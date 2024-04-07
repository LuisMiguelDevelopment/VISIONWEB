import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useAuth } from "./authContext";
import { CiParking1 } from "react-icons/ci";

const ENDPOINT = "http://localhost:3001";
export const socket = io(ENDPOINT);

const CallContext = React.createContext();

export const useCall = () => {
  const context = React.useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const [calls, setCalls] = useState([]);
  const [peers, setPeers] = useState({});
  const [caller, setCaller] = useState("");
  const [tocall, setTocall] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [me, setMe] = useState("");
  const [callReceived, setCallReceived] = useState(false);
  const [myPeer, setMyPeer] = useState(null);
  const userVideoRef = useRef(null);
  const [callerStream, setCallerStream] = useState(null);
  const [stream, setStream] = useState();

  const { user } = useAuth();

  useEffect(() => {
    // Obtener acceso al flujo de vídeo del usuario
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);

        userVideoRef.current.srcObject = stream;
        console.log("Tipo de stream:", typeof stream);
      })
      .catch((error) => {
        console.error("Error accessing user media:", error);
      });
  }, []);

  useEffect(() => {
    const handleCallUser = (data) => {
      setCalls((prevCalls) => [...prevCalls, data]);
    };

    socket.on("callUser", handleCallUser);

    return () => {
      socket.off("callUser", handleCallUser);
    };
  }, []);

  const handleCall = (callData) => {
    const peer = new Peer({ initiator: true, trickle: false });

    setMyPeer(peer);

    peer.on("signal", (signal) => {
      console.log(signal);

      // const streamData = {
      //   MediaStream:{
      //     id: stream.id,
      //     active: stream.active,
      //     onactive: stream.onactive,
      //     onaddtrack: stream.onaddtrack,
      //     oninactive: stream.oninactive,
      //     onremovetrack: stream.onremovetrack
      //   }
       
      // };

      console.log(stream);
      if (stream) {
        socket.emit("callUser", {
          ...callData,
          signal: signal,
          stream: stream,
        });
      } else {
        console.error("Stream is not available yet.");
        // Handle the case when the stream is not available yet
      }
    });
  };

  useEffect(() => {
    socket.on("me", (id) => {
      setMe(id);
    });
  }, []);


  useEffect(() => {
    if (user) {
      const userId = user.UserId;
      socket.emit("setUserId", userId);
    }
  }, [user]);

  useEffect(() => {
    socket.on("callUser", (data) => {
      if (!callReceived) {
        console.log(data);
        setCallReceived(true);
        setCaller(data.from);
        setTocall(data.userToCall);
        setCallerSignal(data.signal);
        setCallerStream(data.stream);
        console.log(data.stream);
      }
    });

    return () => {
      socket.off("callUser");
    };
  }, [callReceived]);

  return (
    // En CallProvider
    <CallContext.Provider
      value={{
        calls,
        peers,
        handleCall,
        socket,
        callReceived,
        tocall,
        caller,
        callerSignal,
        myPeer,
        setMyPeer,
        callerStream,
        stream,
        userVideoRef,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
