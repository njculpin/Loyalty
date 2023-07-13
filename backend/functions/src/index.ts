/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const { onTaskDispatched } = require("firebase-functions/v2/tasks");
const { GoogleAuth } = require("google-auth-library");
const { getFunctions } = require("firebase-admin/functions");

import { https } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";

const app = initializeApp({ credential: applicationDefault() });
const db = getFirestore(app);

export const getPointBalance = https.onRequest(
  { cors: true },
  async (request, response) => {
    const token = request.query.tokenId;
    try {
      logger.info("token -> ", request.query.tokenId);
      const docRef = db.collection("nfts").doc(token);
      const snapshot = await docRef.get();
      const data = snapshot.data();
      const points = data.points;
      logger.info("points -> ", points);
      response.send({
        status: "sucess",
        data: { tokenId: Number(token), value: Number(points) },
      });
    } catch (e) {
      logger.error("error", e);
      response.send({
        status: "error",
        data: { message: "error" },
      });
    }
  }
);

export const pointTransactionQueue = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 5,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 6,
    },
  },
  async (request: any) => {
    try {
      const data = request.data;
      const collection = data.collection;
      const document = data.document;
      const value = data.value;

      const docRef = db.collection(collection).doc(document);
      const res = await db.runTransaction(async (t: any) => {
        const doc = await t.get(docRef);
        const docData = doc.data();
        let newPoints = 0;
        if (collection === "cards") {
          newPoints = docData.points - value;
        } else {
          newPoints = docData.points + value;
        }
        if (newPoints < 0) {
          logger.info("not enough points");
        } else {
          t.update(docRef, {
            points: newPoints,
            updatedAt: new Date().getTime(),
          });
        }
        return newPoints;
      });
      logger.info(res);
    } catch (e) {
      logger.error("error", e);
    }
  }
);

export const addPointTransactionToQueue = https.onRequest(
  { cors: true },
  async (request: any, response) => {
    try {
      const queue = getFunctions().taskQueue("pointTransactionQueue");
      const targetUri = await getFunctionUrl("pointTransactionQueue");
      const body = request.body.data;
      const promotionId = body.promotionId;
      const vendorId = body.vendorId;
      const cardId = body.cardId;
      const value = body.value;
      const enqueues: any = [];
      /*
      whenever a customer scans a promotion to redeem it:
      1. Subtract the value from the customers card
      2. Add the value to the promotion
      3. Add the value to the vendor
      4. Add the value to each NFT
      5. Add the value to each NFT holder
      */
      // 1. CARD
      enqueues.push(
        queue.enqueue(
          {
            collection: "cards",
            document: cardId,
            value: value,
          },
          {
            uri: targetUri,
          }
        )
      );

      // 2. PROMOTION
      enqueues.push(
        queue.enqueue(
          {
            collection: "promotions",
            document: promotionId,
            value: value,
          },
          {
            uri: targetUri,
          }
        )
      );

      // 3. VENDOR
      enqueues.push(
        queue.enqueue(
          {
            collection: "wallets",
            document: vendorId,
            value: value,
          },
          {
            uri: targetUri,
          }
        )
      );

      /*
      // 4 & 5. NFTS
      const nftRef = db.collection("nfts");
      const snapshot = await nftRef
        .where("promotionId", "==", promotionId)
        .get();
      if (snapshot.empty) {
        console.log("No matching documents.");
      }
      const count = snapshot.docs.length;
      const pointsToIssueHolder = 1 / count;
      snapshot.forEach((doc: any) => {
        let data = doc.data();
        enqueues.push(
          queue.enqueue(
            {
              collection: "wallets",
              document: data.owner,
              value: pointsToIssueHolder,
            },
            {
              uri: targetUri,
            }
          )
        );
        enqueues.push(
          queue.enqueue(
            {
              collection: "nfts",
              document: doc.id,
              value: value,
            },
            {
              uri: targetUri,
            }
          )
        );
      });
      */

      await Promise.all(enqueues);
      response.send({
        status: "success",
        data: { ...body, message: "congrats, show this to the store cashier" },
      });
    } catch (e) {
      logger.error("error", e);
      response.send({
        status: "error",
        data: { message: "error" },
      });
    }
  }
);

// HELPER FUNCTIONS
async function getFunctionUrl(name: string, location = "us-central1") {
  let auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const projectId = await auth.getProjectId();
  const url =
    "https://cloudfunctions.googleapis.com/v2beta/" +
    `projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  const res = await client.request({ url });
  const uri = res.data?.serviceConfig?.uri;
  if (!uri) {
    throw new Error(`Unable to retreive uri for function at ${url}`);
  }
  return uri;
}

/*
  const updateCard = async (promotion: Promotion, currentTime: number) => {
    try {
      const patronRef = doc(
        db,
        "cards",
        `${store?.wallet}_${promotion.businessWallet}`
      );
      const docSnap = await getDoc(patronRef);
      if (!docSnap.exists()) {
        await setDoc(
          doc(db, "cards", `${store?.wallet}_${promotion.businessWallet}`),
          {
            businessCity: promotion.businessCity,
            businessEmail: promotion.businessEmail,
            businessName: promotion.businessName,
            businessPhone: promotion.businessPhone,
            businessPostalCode: promotion.businessPostalCode,
            businessRegion: promotion.businessRegion,
            businessStreetAddress: promotion.businessStreetAddress,
            businessCountry: promotion.businessCountry,
            businessWallet: promotion.businessWallet,
            pointsRequired: promotion.pointsRequired,
            coinsRequired: promotion.coinsRequired,
            patronWallet: store?.wallet,
            points: promotion.pointsRequired > 0 ? 1 : 0,
            coins: promotion.coinsRequired > 0 ? 1 : 0,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          }
        );
        return 1;
      } else {
        if (wallet && wallet?.points < promotion.pointsRequired) {
          return console.log("not enough points");
        }
        const cardRef = doc(
          db,
          "cards",
          `${store?.wallet}_${promotion.businessWallet}`
        );
        const points = await runTransaction(db, async (transaction) => {
          const doc = await transaction.get(cardRef);
          if (!doc.exists()) {
            throw "Document does not exist!";
          }
          const oldData = doc.data() as unknown as Wallet;
          const oldPoints = oldData.points;
          const newPoints = oldPoints - promotion.pointsRequired;
          if (newPoints > 0) {
            transaction.update(cardRef, {
              points: newPoints,
              updatedAt: currentTime,
            });
            return newPoints;
          } else {
            return oldPoints;
          }
        });
        return points;
      }
    } catch (e) {
      console.log(e);
      return -1;
    }
  };

  const updateVendor = async (promotion: Promotion, currentTime: number) => {
    try {
      let businessWallet = promotion.businessWallet;
      console.log("businessWallet ln 160", businessWallet);
      const bWalletRef = doc(db, "wallets", `${businessWallet}`);
      const points = await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(bWalletRef);
        if (!doc.exists()) {
          throw "Document does not exist!";
        }
        const oldData = doc.data() as unknown as Wallet;
        const oldPoints = oldData.points;
        const newPoints = oldPoints + 1;
        transaction.update(bWalletRef, {
          points: newPoints,
          updatedAt: currentTime,
        });
        return newPoints;
      });
      return points;
    } catch (e) {
      console.log(e);
      return -1;
    }
  };

  const updatePromotion = async (promotion: Promotion, currentTime: number) => {
    try {
      if (!promotionId && !promotion) {
        return console.log("missing vendor");
      }
      const newKey = uuidv4();
      const promotionRef = doc(db, "promotions", `${promotionId}`);
      return await runTransaction(db, async (transaction) => {
        const doc = await transaction.get(promotionRef);
        if (!doc.exists()) {
          throw "Document does not exist!";
        }
        const oldData = doc.data().points;
        const newPoints = oldData + 1;
        transaction.update(promotionRef, {
          points: newPoints,
          updatedAt: currentTime,
          key: newKey,
        });
        return newPoints;
      });
    } catch (e) {
      console.log(e);
      return -1;
    }
  };
*/
