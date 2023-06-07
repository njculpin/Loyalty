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
const functions = getFunctions(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);

export const loginFirebase = async (smartAccount) => {
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
};

export const createVendor = async (vendor) => {
  const create = httpsCallable(functions, "createVendor");
  return create({ ...vendor })
    .then((result) => {
      const data = result.data;
      console.log("data", data);
      return true;
    })
    .catch((error) => {
      console.log("error", error);
      return false;
    });
};

export const getVendor = async (wallet) => {
  const get = httpsCallable(functions, "getVendor");
  return get({ wallet: wallet })
    .then((result) => {
      const data = result.data;
      return data;
    })
    .catch((error) => {
      console.log("error", error);
      return false;
    });
};

export const createVendorCard = async (
  vendor,
  name,
  reward,
  pointCap,
  qr,
  key
) => {
  const create = httpsCallable(functions, "createVendorCard");
  create({ vendor, name, reward, pointCap, qr, key })
    .then((result) => {
      const data = result.data;
      console.log("data", data);
      return true;
    })
    .catch((error) => {
      console.log("error", error);
      return false;
    });
};

export const getVendorCard = async (vendor) => {
  const get = httpsCallable(functions, "getVendorCard");
  return get({ vendor })
    .then((result) => {
      return JSON.parse(result.data);
    })
    .catch((error) => {
      console.log("error", error);
      return;
    });
};

export const updateVendorCard = async (patron, vendor) => {
  const update = httpsCallable(functions, "updateVendorCard");
  return update({ patron, vendor })
    .then((result) => {
      const data = result.data;
      return data;
    })
    .catch((error) => {
      console.log("error", error);
      return false;
    });
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

export const createPatronCard = async (
  patron,
  vendor,
  name,
  reward,
  points,
  pointCap
) => {
  const create = httpsCallable(functions, "createPatronCard");
  create({ patron, vendor, name, reward, points, pointCap })
    .then((result) => {
      const data = result.data;
      return data;
    })
    .catch((error) => {
      console.log("error", error);
      return false;
    });
};

export const updateVendorCardKey = async (vendor, qr, key) => {
  const update = httpsCallable(functions, "updateVendorCardKey");
  update({ vendor, qr, key })
    .then((result) => {
      console.log("result", result);
      return JSON.parse(result.data);
    })
    .catch((error) => {
      console.log("error", error);
      return;
    });
};

export const getPatronCard = async (patron, vendor) => {
  const get = httpsCallable(functions, "getPatronCard");
  return get({ patron, vendor })
    .then((result) => {
      return JSON.parse(result.data);
    })
    .catch((error) => {
      console.log("error", error);
      return;
    });
};

export const updateCardPoints = async (patron, vendor, key) => {
  const update = httpsCallable(functions, "updateCardPoints");
  return update({ patron, vendor, key })
    .then((result) => {
      console.log("res", result);
      const data = result.data;
      return data;
    })
    .catch((error) => {
      console.log("error", error);
      return false;
    });
};
