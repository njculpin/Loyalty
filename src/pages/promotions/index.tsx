import { useEffect, Fragment, useState } from "react";
import { createVendorCard, getVendorCard, storage } from "../../firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import useAuthStore from "@/lib/store";
import useStore from "@/lib/useStore";

const Promotions = () => {
  return (
    <div className="px-6 py-12 text-center sm:rounded-3xl sm:px-16 grid grid-cols-1 gap-4"></div>
  );
};

export default Promotions;
