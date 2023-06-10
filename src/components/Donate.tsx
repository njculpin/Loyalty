import { payMasterAddress } from "../../config";
import Link from "next/link";

export default function Mint() {
  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden px-6 py-12 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Donate
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-300">
            LYLT requires MATIC tokens to stay alive so donations are welcome,
            they go straight into a smart contract to pay for gas and app
            maintenance. The current contract balance is 0 MATIC. You can view
            it here on Polyscan:
          </p>
          <Link href={`https://polygonscan.com/address/${payMasterAddress}`}>
            {payMasterAddress}
          </Link>
        </div>
      </div>
    </div>
  );
}
