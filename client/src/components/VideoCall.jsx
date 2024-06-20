import { useEffect, useRef, useState } from "react";
import { useCall } from "@/context/CallContext";
import { useAuth } from "@/context/authContext";
import { socket } from "@/context/CallContext";
import Peer from "simple-peer";
import styles from "../styles/VideoCall.module.css";
import { BsCameraVideo, BsXLg } from "react-icons/bs";
import { BsCameraVideoOff } from "react-icons/bs";
import { PiMicrophoneLight } from "react-icons/pi";
import { PiMicrophoneSlash } from "react-icons/pi";
import ModalCall from "./modaCall";
import UserIsBusy from "./UserIsBusy";
import alarmaAudio from "../../public/alarma.mp3";
import { IoCloseOutline } from "react-icons/io5";
import Profile from "./Profile_edit";
import { useFriend } from "@/context/friendContext";

const VideoCall = () => {
  const {
    callReceived,
    tocall,
    caller,
    callerSignal,
    myPeer,
    setMyPeer,
    stream,
    userVideoRef,
    setCallReceived,
    handleDisconnect,
    userName,
    userNameCall,
    userIsBusy,
    setUserIsBusy,
    handleCloseIsBusy,
    callIsBusyClose,
    image,
    imageFriend 
  } = useCall();


  const { friendList } = useFriend();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showAnswerButton, setShowAnswerButton] = useState(true);
  const [playAlarm, setPlayAlarm] = useState(false);
  const audioRef = useRef(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const callerVideoRef = useRef(null);
  const peerRef = useRef(null);
  const { user } = useAuth();
  const [callEnd, setCallEnd] = useState(false);



  useEffect(() => {
    
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
       
        userVideoRef.current.srcObject = stream;
        console.log("Tipo de stream:", typeof stream);
      })
      .catch((error) => {
        console.error("Error accessing user media:", error);
      });
  }, []);

  const handleCallAccept = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream: stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        to: tocall,
        from: caller,
        signal: data,
      });
    });

    peer.signal(callerSignal);
    setMyPeer(peer);
    peerRef.current = peer;

    peer.on("stream", (stream) => {
      callerVideoRef.current.srcObject = stream;
    });

    setCallAccepted(true);

    userVideoRef.current.srcObject = stream;

    setShowAnswerButton(true);
  };

  useEffect(() => {
    if (!myPeer) return;

    socket.on("callAccepted", (data) => {
      console.log(data);
      const { signal } = data;
      myPeer.signal(signal);

      myPeer.on("connect", () => {
        console.log("¡Conexión establecida!");
        setCallAccepted(true);
      });

      myPeer.on("stream", (stream) => {
        callerVideoRef.current.srcObject = stream;
      });

      userVideoRef.current.srcObject = stream;
    });

    return () => {
      socket.off("callAccepted");
    };
  }, [myPeer]);

  const handleHangupCall = () => {
    setCallReceived(false);
    setShowAnswerButton(false);
    socket.emit("hangupCall", { from: caller, to: tocall });
    setUserIsBusy(false); 
  };

  useEffect(() => {
    const handleCallCancelled = (data) => {
      setCallReceived(false);
      setShowAnswerButton(false);
      console.log("La llamada fue cancelada:", data);
      setUserIsBusy(false); 
    };

    socket.on("callCancelled", handleCallCancelled);

    return () => {
      socket.off("callCancelled", handleCallCancelled);
    };
  }, []);

  useEffect(() => {
    const handleCallCancelled = () => {
      setCallReceived(false);
      setCallAccepted(false);
      setCallEnd(true);
      setUserIsBusy(false); 
    };

    socket.on("callCancelled", handleCallCancelled);

    return () => {
      socket.off("callCancelled", handleCallCancelled);
      handleDisconnect();
    };
  }, []);

  useEffect(() => {
    if (playAlarm) {
      audioRef.current = new Audio(alarmaAudio);
      audioRef.current.play();
      audioRef.current.loop = true;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [playAlarm]);

  const toggleAudio = () => {
    const stream = userVideoRef.current.srcObject;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const stream = userVideoRef.current.srcObject;

    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  useEffect(() => {
    if (callReceived && !callAccepted) {
      setPlayAlarm(true);
      setCallEnd(false);
    } else {
      setPlayAlarm(false);
    }
  }, [callReceived, callAccepted]);

  useEffect(() => {
    return () => {
      setPlayAlarm(false);
    };
  }, []);

  useEffect(() => {
    if (callReceived && callAccepted) {
      setCallActive(true);
    } else {
      setCallActive(false);
    }
  }, [callReceived, callAccepted]);

  return (
    <div className={styles.general}>
      {userIsBusy && !callIsBusyClose && (
        <UserIsBusy handleClose={handleCloseIsBusy} />
      )}

      <div className={styles.container_videos}>
        <div
          className={`${styles.border_video} ${callActive ? "" : styles.hidden}`}
        >
          {!callEnd && (
            <video className={styles.video} ref={callerVideoRef} autoPlay />
          )}
        </div>
        <div
          className={`${styles.border_video} ${callEnd ? styles.callEndUser : ""} ${callAccepted ? styles.border_video2 : ""}`}
        >
          <video
            className={`${styles.video_user} ${callAccepted ? styles.small : styles.large}`}
            ref={userVideoRef}
            autoPlay
            muted
          />
        </div>
      </div>
      <div className={styles.buttons}>
        <button className={styles.button_options} onClick={toggleVideo}>
          {isCameraOff ? (
            <BsCameraVideoOff className={styles.camera_off} />
          ) : (
            <BsCameraVideo className={styles.camera_on} />
          )}
        </button>
        <button className={styles.button_options} onClick={toggleAudio}>
          {isMuted ? (
            <PiMicrophoneSlash className={styles.microphone_off} />
          ) : (
            <PiMicrophoneLight />
          )}
        </button>
        {callAccepted && (
          <button
            className={styles.button_disconnect}
            onClick={handleDisconnect}
          >
            <IoCloseOutline />
          </button>
        )}
      </div>

      <div className={styles.modal}>
        {callReceived && !callAccepted && (
          <ModalCall
            handleCallAccept={handleCallAccept}
            handleCancell={handleHangupCall}
            UserName={userName}
            UserCall={userNameCall}
            isReceiver={user.UserId === tocall}
            image={image} 
            imageFriend={imageFriend} 
          />
        )}
      </div>
    </div>
  );
};

export default VideoCall;