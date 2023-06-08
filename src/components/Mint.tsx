import { useEffect, useState, Suspense } from "react";
import useStore from "../store";
import { ref, getDownloadURL } from "firebase/storage";
import {
  createPatronCard,
  getPatronCard,
  getPromotion,
  updatePatronCardPoints,
  updatePromotionKey,
  storage,
} from "../firebase";

import { ethers } from "ethers";
import { loyaltyManagerAddress } from "../../config";
// import LoyaltyManager from "../../artifacts/contracts/LoyaltyManager.sol/LoyaltyManager.json";

type VendorCard = {
  account: "";
  name: "";
  reward: "";
  points: "";
  qr: "";
  qrUrl: "";
};

export default function Mint() {
  const provider = useStore((state: any) => state.provider);
  const actions = useStore((state: any) => state.actions);
  const smartAccount = useStore((state: any) => state.smartAccount);
  const vendorCards = useStore((state: any) => state.vendorCards);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getVendorDetails = async () => {
      getCard();
    };
    getVendorDetails();
  }, []);

  const getCard = async () => {
    if (smartAccount) {
      setLoading(true);
      const result = await getPromotion(smartAccount.address);
      const card = result as unknown as VendorCard;
      if (card && card.qr) {
        const qr = card.qr;
        const url = await getDownloadURL(ref(storage, qr));
        actions.setVendorCards([...vendorCards, { ...card, qrUrl: url }]);
      }
      setLoading(false);
    }
  };

  // const getImage = async () => {
  //   if (!smartAccount) return;

  //   let seed = smartAccount.address;
  //   seed += `-vendor`;

  //   const contract = new ethers.Contract(
  //     loyaltyManagerAddress,
  //     LoyaltyManager.abi,
  //     provider
  //   );

  //   let balance = 0;
  //   // balance = await contract.getPatronBalance(tokenId);
  //   // console.log("patron balance", balance);
  //   seed += `-${balance}`;

  //   console.log("seed", seed);

  //   // console.log("seed", seed);
  //   // return axios
  //   //   .get(`/api/argen/${seed}`)
  //   //   .then((res) => res)
  //   //   .catch((e) => console.log(e));
  // };

  // const mint = async () => {
  //   if (!smartAccount) return;
  //   console.log("smartAccount: ", smartAccount);
  //   console.log(
  //     `network: ${smartAccount.provider._network.chainId} - ${smartAccount.provider._network.name}`
  //   );
  //   const image = await getImage();
  //   console.log("image", image);

  //   let tx = {};

  //   let tokenURI = "vendor.json";
  //   let card = new ethers.utils.Interface([
  //     "function mintVendorCard(string memory _tokenURI)",
  //   ]);
  //   let encodedData = card.encodeFunctionData("mintVendorCard", [tokenURI]);
  //   tx = {
  //     to: loyaltyManagerAddress,
  //     data: encodedData,
  //   };

  //   console.log(tx);

  //   smartAccount.on("txHashGenerated", (response: any) => {
  //     console.log("txHashGenerated event received via emitter", response);
  //   });
  //   smartAccount.on("onHashChanged", (response: any) => {
  //     console.log("onHashChanged event received via emitter", response);
  //   });
  //   smartAccount.on("txMined", (response: any) => {
  //     console.log("txMined event received via emitter", response);
  //   });
  //   smartAccount.on("error", (response: any) => {
  //     console.log("error event received via emitter", response);
  //   });

  //   const txResponse = await smartAccount.sendTransaction({
  //     transaction: tx,
  //   });
  //   console.log("userOp hash", txResponse);

  //   const txReciept = await txResponse.wait();
  //   console.log("Tx hash", txReciept.transactionHash);
  //   if (txReciept.transactionHash) {
  //     //   setOpen(true);
  //     //   setTransactionHash(`tx/${txReciept.transactionHash}`);
  //   }
  // };

  return (
    <div className="space-y-12 p-16">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        {smartAccount && (
          <div className="relative isolate overflow-hidden px-6 py-12 text-center sm:rounded-3xl sm:px-16">
            <div className="mt-10 grid grid-cols-1 gap-8 justify-center gap-x-6">
              <div className="mt-10 grid grid-cols-1 gap-8 justify-center gap-x-6">
                {!loading && <div></div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
