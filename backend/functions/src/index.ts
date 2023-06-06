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

/*
userId - firebase auth id
tokenId - vendor card id, used as document key
vendorId - the issuer of the patron card & loyalty points
points - current point level
*/
export const createVendorCard = https.onRequest(
  { cors: true },
  async (request, response) => {
    try {
      const body = request.body.data;
      logger.info("request body", body);
      const vendor = body.vendor;
      const name = body.name;
      const reward = body.reward;
      const pointCap = body.pointCap;
      const qr = body.qr;
      const key = body.key;
      const docRef = db.collection("vendors").doc(vendor);
      const res = await docRef.set({
        vendor: vendor,
        name: name,
        reward: reward,
        points: 0,
        pointCap: pointCap,
        qr: qr,
        key: key,
      });
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(res) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const getVendorCard = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const vendor = body.vendor;
    try {
      const doc = await db.collection("vendors").doc(vendor).get();
      if (doc.exists) {
        const res = doc.data();
        response
          .status(200)
          .send({ status: "success", data: JSON.stringify(res) });
      } else {
        response.status(200).send({ status: "success", data: null });
      }
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const updateVendorCardKey = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const vendor = body.vendor;
    const key = body.key;
    const qr = body.qr;
    const docRef = db.collection("vendors").doc(vendor);
    try {
      const update = await docRef.update({
        qr: qr,
        key: key,
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
    const patron = body.patron;
    const vendor = body.vendor;
    const name = body.name;
    const reward = body.reward;
    const points = body.points;
    const pointCap = body.pointCap;
    const docRef = db.collection("patrons").doc(`${vendor}-${patron}`);
    try {
      const res = await docRef.set({
        patron: patron,
        vendor: vendor,
        name: name,
        reward: reward,
        points: points,
        pointCap: pointCap,
        lastUpdate: new Date().getTime(),
      });
      response
        .status(200)
        .send({ status: "success", data: JSON.stringify(res) });
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);

export const updateCardPoints = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const vendor = body.vendor;
    const patron = body.patron;
    // const key = body.key;
    // const vendorRef = db.collection("vendors").doc(vendor);
    const docRef = db.collection("patrons").doc(`${vendor}-${patron}`);
    try {
      const checkPatron = await docRef.get();
      logger.info("checkPatron", checkPatron.data());
      // const getVendor = await vendorRef.get();
      // const vendorKey = getVendor.data().key;
      const updatePoints = await db.runTransaction(async (transaction: any) => {
        const patronDoc = await transaction.get(docRef);
        const oldPoint = patronDoc.data().points;
        const pointCap = patronDoc.data().pointCap;
        const lastUpdate = patronDoc.data().lastUpdate;
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
          transaction.update(docRef, { points: 0, lastUpdate: currentTime });
          await updateVendorCardPoints(vendor, pointCap);
          return 0;
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

const updateVendorCardPoints = async (vendor: string, pointCap: number) => {
  console.log("should update", vendor, pointCap);
  const vendorRef = db.collection("vendors").doc(vendor);
  const currentTime = new Date().getTime();
  const updateVendor = await db.runTransaction(async (transaction: any) => {
    const vendorDoc = await transaction.get(vendorRef);
    const oldPoints = vendorDoc.data().points;
    logger.info("updateVendorCardPoints oldPoints", oldPoints);
    const newPoints = oldPoints + pointCap;
    logger.info("updateVendorCardPoints newPoints", newPoints);
    transaction.update(vendorRef, {
      points: newPoints,
      lastUpdate: currentTime,
    });
    return newPoints;
  });
  logger.info("updateVendorCardPoints", updateVendor);
};

export const getPatronCard = https.onRequest(
  { cors: true },
  async (request, response) => {
    const body = request.body.data;
    logger.info("request body", body);
    const patron = body.patron;
    const vendor = body.vendor;
    try {
      const doc = await db
        .collection("patrons")
        .doc(`${vendor}-${patron}`)
        .get();
      if (doc.exists) {
        const res = doc.data();
        response
          .status(200)
          .send({ status: "success", data: JSON.stringify(res) });
      } else {
        response.status(200).send({ status: "success", data: null });
      }
    } catch (e) {
      logger.error("error", e);
      response.status(400).send({ status: "error", data: JSON.stringify(e) });
    }
  }
);
