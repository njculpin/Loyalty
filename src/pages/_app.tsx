import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NewsSignup from "@/components/NewsSignup";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      {/* <NewsSignup /> */}
      <Nav />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
