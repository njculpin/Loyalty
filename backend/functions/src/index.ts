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
      response
        .status(200)
        .json({ tokenId: Number(token), value: Number(points) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).json({ tokenId: Number(token), value: Number(0) });
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
      const key = data.key;
      const value = data.value;
      const operation = data.operation;
      if (operation == "replace") {
        logger.info(
          `update ${document} from ${collection} with ${key} to ${value}`
        );
        const docRef = db.collection(collection).doc(document);
        const res = await docRef.update({
          [key]: value,
          updatedAt: new Date().getTime(),
        });
        logger.info(res);
      }
      if (operation == "add") {
        const docRef = db.collection(collection).doc(document);
        const res = await db.runTransaction(async (t: any) => {
          const doc = await t.get(docRef);
          const newPoints = doc.data()[key] + value;
          t.update(docRef, { [key]: newPoints });
        });
        logger.info(res);
      }
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
      const documentKey = body.key; // points || coins
      const promotionId = body.promotionId;
      const value = body.value;
      const enqueues: any = [];
      const nftRef = db.collection("nfts");
      const snapshot = await nftRef
        .where("promotionId", "==", promotionId)
        .get();
      if (snapshot.empty) {
        console.log("No matching documents.");
        response.status(200).json({ message: "success but missing documents" });
      }
      const count = snapshot.docs.length;
      const pointsToIssueHolder = 1 / count;
      snapshot.forEach((doc: any) => {
        let data = doc.data();
        // add to wallets of owners the 1 / total NFT from that promotion
        enqueues.push(
          queue.enqueue(
            {
              collection: "wallets",
              document: data.owner,
              key: documentKey,
              value: pointsToIssueHolder,
              operation: "add",
            },
            {
              uri: targetUri,
            }
          )
        );
        // update points on each NFT
        enqueues.push(
          queue.enqueue(
            {
              collection: "nfts",
              document: doc.id,
              key: documentKey,
              value: value,
              operation: "replace",
            },
            {
              uri: targetUri,
            }
          )
        );
      });
      await Promise.all(enqueues);
      response.send({
        status: "success",
        data: { promotion: promotionId },
      });
    } catch (e) {
      logger.error("error", e);
      response.send({
        status: "error",
        data: "error",
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
