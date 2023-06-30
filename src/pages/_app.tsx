import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-row justify-center items-center">
      <div className="p-16">LYLT - Coming Soon</div>
      {/* <Nav />
      <Component {...pageProps} />
      <Footer /> */}
    </div>
  );
}
