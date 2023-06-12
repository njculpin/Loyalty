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
