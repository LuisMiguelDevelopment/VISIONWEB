import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useAuth } from "./authContext";

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
  const [userName, setUserName] = useState("");
  const [userNameCall, setUserNameCall] = useState("");
  const [callReceived, setCallReceived] = useState(false);
  const [myPeer, setMyPeer] = useState(null);
  const userVideoRef = useRef(null);
  const [callerStream, setCallerStream] = useState(null);
  const [stream, setStream] = useState();
  const [userIsBusy , setUserIsBusy] = useState(false);
  const [callIsBusyClose, setCallIsBusyClose] = useState(false);
  const [ image , setImage ] = useState("");
  const [ imageFriend , setImageFriend ] = useState("");

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
    const handleReconnection = (user) => {
      const userReconnect = user.UserId;
      console.log("Reconexión del usuario:", userReconnect);
      socket.emit("setUserId", userReconnect); // Reasignar la ID de usuario al socket
    };

    socket.on("reconnected", handleReconnection);

    return () => {
      socket.off("reconnected", handleReconnection);
    };
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
    const peer = new Peer({ initiator: true, trickle: false, stream: stream });

    setMyPeer(peer);

    peer.on("signal", (signal) => {
      console.log(signal);

      if (stream) {
        console.log(callData);
        
        socket.emit("callUser", {
          ...callData,
          signal: signal,
        });
      } else {
        console.error("Stream is not available yet.");
      }
    });
  };

  useEffect(() => {
    if (user) {
      const userId = user.UserId;
      socket.emit("setUserId", userId);
    }
  }, [user]);

  useEffect(() => {
    socket.on("callUser", (data) => {
      console.log(data);
      setCallReceived(true);
      setCaller(data.from);
      setTocall(data.userToCall);
      setCallerSignal(data.signal);
      setCallerStream(data.stream);
      setUserName(data.name);
      setUserNameCall(data.nameCall);
      setImage(data.profileImage);
      setImageFriend(data.profileImageFriend);
     
    });

    return () => {
      socket.off("callUser");
    };
  }, []);

  const handleDisconnect = () => {
    if (myPeer) {
      myPeer.destroy();
      setMyPeer(null);
      socket.emit("hangupCall", { from: tocall, to: caller });
    }
  };


  useEffect(() => {
    socket.on('callFailed', (data) => {
      console.log(data);
      setUserIsBusy(true);
      setCallIsBusyClose(false);
    });

    return () => {
      socket.off('callFailed');
    };
  }, []);

  const handleCloseIsBusy = () => {
    setCallIsBusyClose(true);
    setUserIsBusy(false); // Reset userIsBusy when the busy modal is closed
  };



  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Mostrar mensaje de confirmación
      const confirmationMessage = "¿Estás seguro que quieres salir y terminar la llamada?";
      event.preventDefault();
      event.returnValue = confirmationMessage; // Standard-compliant browsers
      return confirmationMessage; // Old IE
    };
  
    const handleUnload = () => {
      if (myPeer) {
        myPeer.destroy();
        setMyPeer(null);
  
        // Emitir el evento de colgar llamada
        socket.emit("hangupCall", { from: tocall, to: caller });
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [myPeer, tocall, caller]);
  
  


  return (
    // En CallProvider
    <CallContext.Provider
      value={{
        calls,
        peers,
        handleCall,
        socket,
        callReceived,
        setCallReceived,
        tocall,
        caller,
        callerSignal,
        myPeer,
        setMyPeer,
        callerStream,
        stream,
        userVideoRef,
        handleDisconnect,
        userName,
        userNameCall,
        userIsBusy,
        setUserIsBusy,
        handleCloseIsBusy,
        callIsBusyClose,
        image,
        imageFriend
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
