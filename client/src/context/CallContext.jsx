import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useAuth } from "./authContext";


const ENDPOINT = "http://localhost:3001";
const socket = io(ENDPOINT);

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
  const [caller , setCaller] = useState("");
  const [tocall , setTocall] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [me , setMe] = useState("");
  const [callReceived, setCallReceived] = useState(false);

  const { user } = useAuth();


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
    const peer = new Peer({ initiator: true });
  
    peer.on("signal", (signal) => {
      socket.emit("callUser", {
        ...callData,
        signal: signal,
      });
    });
  
    setPeers((prevPeers) => ({
      ...prevPeers,
      [callData.userToCall]: peer,
    }));
  };

useEffect(() => {
  socket.on("me", (id) => {
    console.log(id);
    setMe(id);
  });


  

  socket.on("callUser", (data) => {
    if (!callReceived) {
      console.log("soy yo", data);
      setCallReceived(true);
    }
    setCaller(data.from);
    setTocall(data.userToCall);
    setCallerSignal(data.signal);
  });
}, [callReceived]);



useEffect(() => {
  if (user) {
    const userId = user.UserId;
    console.log("holi", userId);
    socket.emit("setUserId", userId);
  }
}, [user]);



  return (
    <CallContext.Provider value={{ calls, peers, handleCall, socket }}>
      {children}
    </CallContext.Provider>
  );
};