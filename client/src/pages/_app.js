import "@/styles/globals.css";
import { AuthProvider } from "../context/authContext";
import { FriendProvider } from "@/context/friendContext";

export default function App({ Component, pageProps }) {
  return (
    <>
      <AuthProvider>
        <FriendProvider>
          <Component {...pageProps} />
        </FriendProvider>
      </AuthProvider>
    </>
  );
}
