import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@biconomy/web3-auth/dist/src/style.css";
import { AuthProvider } from "@/context/Auth";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
