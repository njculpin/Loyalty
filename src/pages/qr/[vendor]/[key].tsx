import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/router";
import useStore from "../../../store";
import {
  createPatronCard,
  getPatronCard,
  getVendorCard,
  updateCardPoints,
  updateVendorCardKey,
  storage,
} from "../../../firebase";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadString } from "firebase/storage";

type PatronCard = {
  name: "";
  reward: "";
  points: "";
  pointCap: "";
  lastUpdate: "";
};

const Qr = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { vendor, key } = router.query;

  const smartAccount = useStore((state: any) => state.smartAccount);
  const [message, setMessage] = useState("");
  const [rel, setRel] = useState<PatronCard>({
    name: "",
    reward: "",
    points: "",
    pointCap: "",
    lastUpdate: "",
  });

  const SocialLoginDynamic = dynamic(
    () => import("../../../components/Auth").then((res) => res.default),
    {
      ssr: false,
    }
  );

  useEffect(() => {
    if (smartAccount && vendor) {
      update();
    }
  }, [vendor, key, smartAccount]);

  const update = async () => {
    setLoading(true);

    const relationship = await getPatronCard(smartAccount.address, vendor);
    setRel(relationship);

    const vendorCard = await getVendorCard(vendor);
    if (vendorCard.key != key) {
      setLoading(false);
      setMessage("Error! Invalid Key");
      return;
    } else {
      if (relationship) {
        setRel(relationship);
        console.log("updating");
        const updated = await updateCardPoints(
          smartAccount.address,
          vendor,
          key
        );
        console.log("updated", updated);
        if (updated === "-1") {
          setLoading(false);
          return setMessage("Sorry, you have already checked in today!");
        }
      } else {
        if (vendorCard) {
          await createPatronCard(
            smartAccount.address,
            vendor,
            vendorCard.name,
            vendorCard.reward,
            1,
            vendorCard.pointCap
          );
        }
      }

      const result = await getPatronCard(smartAccount.address, vendor);
      setRel(result);

      issueNewKey();
      setLoading(false);
      return;
    }
  };

  const issueNewKey = async () => {
    const qr = await QRCode.toDataURL(
      `loyalty-iota.vercel.app/qr/${vendor}/${key}`
    );
    const newKey = uuidv4();
    const storageRef = ref(storage, `qr/${vendor}.png`);
    const uploadTask = await uploadString(storageRef, qr, "data_url");
    const QRURL = uploadTask.metadata.fullPath;
    await updateVendorCardKey(vendor, QRURL, newKey);
  };

  const redeemCard = async () => {
    const update = await updateCardPoints(smartAccount.address, vendor, key);
    console.log("update", update);
    if (update === "-1") {
      setLoading(false);
      return setMessage("Sorry, you have already checked in today!");
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl p-6">
        <Suspense fallback={<div>Loading...</div>}>
          {loading && <p>Loading</p>}
          <div className="w-full flex justify-center items-center">
            <div className="grid grid-cols-1 text-center">
              <p className="text-red-500 font-bold text-lg">{message}</p>
              {rel && rel.name !== "" && !loading && (
                <div>
                  <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-6xl lg:mt-6 xl:text-8xl">
                    <span className="">You have earned </span>
                    <span className=" text-green-400">{rel.points} </span>
                    <span>out of </span>
                    <span className=" text-yellow-400">{rel.pointCap} </span>
                    <span>points for a FREE </span>
                    <span className=" text-red-400">{rel.reward} </span>
                    <span>from</span>
                    <span className=" text-blue-400"> {rel.name}</span>
                  </h1>
                  {rel.pointCap === rel.points && (
                    <button className="my-8" onClick={() => redeemCard()}>
                      <p className="border px-4 py-2 border-white">
                        REDEEM - TEST ONLY
                      </p>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <SocialLoginDynamic />
        </Suspense>
      </div>
    </div>
  );
};

export default Qr;
