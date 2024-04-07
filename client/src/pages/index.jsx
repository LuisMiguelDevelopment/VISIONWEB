import React, { useRef, useEffect, useState } from "react";
import { useCall } from "@/context/CallContext";
import { useAuth } from "@/context/authContext";
import Peer from "simple-peer";
import { socket } from "@/context/CallContext";
import Slider from "@/components/Slider";

const Home = () => {
  const { callReceived, tocall, caller, callerSignal, myPeer, setMyPeer, stream, userVideoRef } = useCall();
  const { user } = useAuth();
  const callerVideoRef = useRef(null);
  const peerRef = useRef(null);

  const handleCallAccept = () => {
    const peer = new Peer({ initiator: false, trickle: false });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        to: tocall,
        from: caller,
        signal: data,
        stream: stream
      });
    });

    peer.signal(callerSignal);
    setMyPeer(peer);
    peerRef.current = peer;
  };

  useEffect(() => {
    if (!myPeer) return;

    socket.on("callAccepted", (data) => {
      console.log(data);
      const { signal, stream } = data;
      myPeer.signal(signal);

      myPeer.on("connect", () => {
        console.log("¡Conexión establecida!");
      });

      console.log(stream);

      if (callerVideoRef.current && stream) {
        callerVideoRef.current.srcObject = stream;
      }
    });

    return () => {
      socket.off("callAccepted");
    };
  }, [myPeer]);

  return (
    <Slider>
      <h1>¡Hola!</h1>

      <div>
        <p>Llamada entrante de </p>
        {callReceived && tocall === user.UserId && (
          <button onClick={handleCallAccept}>Answer Call</button>
        )}

        <video
          ref={userVideoRef}
          autoPlay
          playsInline
          style={{ width: "50%" }}
        />

        <video
          ref={callerVideoRef}
          autoPlay
          playsInline
          style={{ width: "50%" }}
        />
      </div>
    </Slider>
  );
};

export default Home;