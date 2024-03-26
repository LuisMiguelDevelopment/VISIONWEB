import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
export default function Home() {

  const { isAuthenticated } = useAuth();

  const router = useRouter();

  

  return (
    <>
      <h1>ghola</h1>
    </>
  )
}
