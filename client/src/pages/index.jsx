import { useAuth } from "@/context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Slider from "@/components/Slider";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const router = useRouter();

  return (
    <>
      <Slider>
        <h1>ghola</h1>
      </Slider>
    </>
  );
}
