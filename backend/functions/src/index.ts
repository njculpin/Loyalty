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
import { https } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";

const app = initializeApp({ credential: applicationDefault() });
const db = getFirestore(app);

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
export const createVendor = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const vendor = body.wallet;
    logger.info("vendor", vendor);
    const docRef = db.collection("vendors").doc(vendor);
    const res = await docRef.set(body);
    try {
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(res) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const getVendor = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const vendor = body.wallet;
    logger.info("vendor", vendor);
    const docRef = db.collection("vendors").doc(vendor);
    const res = await docRef.get();
    logger.info("res", res.data());
    try {
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(res.data()) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

/*
userId - firebase auth id
tokenId - vendor card id, used as document key
vendorId - the issuer of the patron card & loyalty points
points - current point level
*/
export const createPromotion = https.onRequest(
  { cors: true },
  async (request, response) => {
    try {
      const body = request.body.data;
      logger.info("request body", body);
      const docRef = db.collection("promotions").doc();
      const res = await docRef.set({ ...body });
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(res) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const getPromotion = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const key = body.key;
    try {
      const snapshot = await db
        .collection("promotions")
        .where("key", "==", key)
        .get();
      let data = snapshot.docs.map(function (x: any) {
        return { id: x.id, ...x.data() };
      });
      logger.info("response docs", data);
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(data) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const getPromotionsByOwner = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const businessWallet = body.businessWallet;
    try {
      const snapshot = await db
        .collection("promotions")
        .where("businessWallet", "==", businessWallet)
        .get();
      let data = snapshot.docs.map(function (x: any) {
        return { id: x.id, ...x.data() };
      });
      logger.info("response docs", data);
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(data) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const getPromotionByKey = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const key = body.key;
    try {
      const snapshot = await db
        .collection("promotions")
        .where("key", "==", key)
        .get();
      let data = snapshot.docs.map(function (x: any) {
        return { id: x.id, ...x.data() };
      });
      logger.info("response docs", data);
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(data) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const updatePromotionKey = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const promotionId = body.promotionId;
    const qr = body.qr;
    const key = body.key;
    const docRef = db.collection("promotions").doc(promotionId);
    try {
      const update = await docRef.update({
        qr: qr,
        key: key,
        lastUpdate: new Date().getTime(),
      });
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(update) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

/*
userId - firebase auth id
tokenId - patron card id, used as document key
vendorId - the issuer of the patron card & loyalty points
pointCap - max points allowed on this card, determined by the vendor
points - current point level
*/
export const createPatronCard = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const docRef = db
      .collection("patrons")
      .doc(`${body.patronWallet}-${body.promotionId}`);
    try {
      const res = await docRef.set({ ...body });
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(res) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const updatePatronCardPoints = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    const patronWallet = body.patronWallet;
    const promotionId = body.promotionId;
    const docRef = db
      .collection("patrons")
      .doc(`${patronWallet}-${promotionId}`);
    try {
      const checkPatron = await docRef.get();
      logger.info("checkPatron", checkPatron.data());

      const updatePoints = await db.runTransaction(async (transaction: any) => {
        const patronDoc = await transaction.get(docRef);
        const oldData = patronDoc.data();
        const oldPoint = oldData.points;
        const pointCap = oldData.pointCap;
        const lastUpdate = oldData.lastUpdate;
        const currentTime = new Date().getTime();
        const difference = Math.abs(currentTime - lastUpdate);
        logger.info("time difference", difference);
        let newPoint = oldPoint + 1;
        if (newPoint <= pointCap) {
          transaction.update(docRef, {
            points: newPoint,
            lastUpdate: currentTime,
          });
          return newPoint;
        } else {
          transaction.update(docRef, {
            lastUpdate: currentTime,
            points: 1,
          });
          await updatePromotionPoints(promotionId, pointCap);
          return 1;
        }
      });
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(updatePoints) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

const updatePromotionPoints = async (promotionId: string, pointCap: number) => {
  console.log("should update", promotionId, pointCap);
  const vendorRef = db.collection("promotions").doc(promotionId);
  const currentTime = new Date().getTime();
  const updateVendor = await db.runTransaction(async (transaction: any) => {
    const vendorDoc = await transaction.get(vendorRef);
    const oldPoints = vendorDoc.data().points;
    logger.info("updatePromotionPoints oldPoints", oldPoints);
    const newPoints = oldPoints + pointCap;
    logger.info("updatePromotionPoints newPoints", newPoints);
    transaction.update(vendorRef, {
      points: newPoints,
      lastUpdate: currentTime,
    });
    return newPoints;
  });
  logger.info("updatePromotionPoints", updateVendor);
};

export const getPatronCard = https.onRequest(
  { cors: true },
  async (request, response) => {
    logger.info("request body", request.body);
    const body = request.body.data;
    const patronWallet = body.patronWallet;
    const promotionId = body.promotionId;
    try {
      const docRef = await db
        .collection("patrons")
        .doc(`${patronWallet}-${promotionId}`);
      const res = await docRef.get();
      logger.info("res", res.data());
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(res.data()) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);
