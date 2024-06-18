import "@/styles/globals.css";
import { AuthProvider } from "../context/authContext";
import { FriendProvider } from "@/context/friendContext";
import { CallProvider } from "@/context/CallContext";

export default function App({ Component, pageProps }) {
  return (
    <>
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
