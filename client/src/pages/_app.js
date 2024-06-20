import "@/styles/globals.css";
import { AuthProvider } from "../context/authContext";
import { FriendProvider } from "@/context/friendContext";
import { CallProvider } from "@/context/CallContext";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>VISIONWEB</title>
        <link rel="icon" href="/VISIONWEBLOGO.png" />{" "}
        
      </Head>
      <AuthProvider>
        <FriendProvider>
          <CallProvider>
            <Component {...pageProps} />
          </CallProvider>
        </FriendProvider>
      </AuthProvider>
    </>
  );
}
