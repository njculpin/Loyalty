// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

export let analytics;
if (app.name && typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const loginFirebase = async (smartAccount) => {
  console.log("logging in", smartAccount);
  signInAnonymously(auth)
    .then((res) => {
      console.log("logged in", res);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("errorCode", errorCode);
      console.log("errorMessage", errorMessage);
    });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      console.log("firebase auth changed", uid);
    } else {
      console.log("not logged in firebase");
    }
  });

  await setWallet(smartAccount);
  return;
};

const setWallet = async (smartAccount) => {
  try {
    const docRef = doc(db, "wallets", smartAccount);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("document exists");
      return;
    } else {
      console.log("No such document! create one");
      await setDoc(doc(db, "wallets", smartAccount), {
        address: smartAccount,
        coins: 0,
        points: 0,
      })
        .then(() => {
          console.log("complete");
        })
        .catch((e) => {
          console.log(e);
        });
    }
  } catch (e) {
    console.log(e);
  }
};

export const logoutFirebase = async () => {
  signOut(auth)
    .then((res) => {
      console.log("firebase logout success", res);
    })
    .catch((error) => {
      console.log("firebase logout error", error);
    });
};

export const recordEvent = async (eventName, params) => {
  return logEvent(analytics, eventName, params);
};
