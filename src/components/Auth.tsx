import { useAuth } from "../context/Auth";

export default function Auth() {
  const auth = useAuth();
  console.log("auth", auth);
  if (!auth) {
    return <></>;
  }
  console.log(auth.smartAccount);
  return (
    <div className="w-full">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        {!auth.smartAccount && !auth.loading && (
          <div>
            <button
              onClick={auth.Login}
              className="w-32 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Login
            </button>
          </div>
        )}
        {auth.loading && <p>Loading</p>}
        {!!auth.smartAccount && (
          <div>
            <h3>Smart Account:</h3>
            <p>{auth.smartAccount.address}</p>
            <button
              onClick={auth.Logout}
              className="w-32 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white mt-4"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
