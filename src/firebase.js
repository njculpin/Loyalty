// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

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
// const analytics = getAnalytics(app);

export const loginFirebase = async () => {
  const uid = await signInAnonymously(auth);
  return uid.user.uid;
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

export const recordEvent = async (
  transactionType,
  amount,
  reciever,
  sender
) => {
  try {
    /*
    mint_nft
    list_nft
    unlist_nft
    transfer_nft

    transfer_point
    transfer_coin
    
    create_promotion
    */
    const docRef = await addDoc(collection(db, "transactions"), {
      transactionType: transactionType,
      amount: amount,
      reciever: reciever,
      sender: sender,
      createdAt: new Date().toString(),
    });
    console.log("transactions written with ID: ", docRef.id);
  } catch (e) {
    console.log(e);
  }
};
