export default function Mint() {
  const mint = async () => {};
  return (
    <div className="my-4">
      <button
        onClick={mint}
        className="w-32 rounded-md bg-white px-3.5 py-2.5 text-4xl font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white mt-4"
      >
        <p className="p-2">Mint</p>
      </button>
    </div>
  );
}
