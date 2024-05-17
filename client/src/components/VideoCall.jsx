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
import alarmaAudio from "../../public/alarma.mp3";
import { IoCloseOutline } from "react-icons/io5";

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
    userNameCall
  } = useCall();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showAnswerButton, setShowAnswerButton] = useState(true);
  const [playAlarm, setPlayAlarm] = useState(false); // Estado para controlar la alarma
  const audioRef = useRef(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const callerVideoRef = useRef(null);
  const peerRef = useRef(null);
  const { user } = useAuth();
  const [callEnd, setCallEnd] = useState(false);

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
        callerVideoRef.current.srcObject = stream; // Mostrar el stream del llamante
      });

      userVideoRef.current.srcObject = stream;
    });

    return () => {
      socket.off("callAccepted");
    };
  }, [myPeer]);

  /* Call Cancelled */

  const handleHangupCall = () => {
    setCallReceived(false);
    setShowAnswerButton(false);
    socket.emit("hangupCall", { from: caller, to: tocall });
  };

  useEffect(() => {
    socket.on("callCancelled", (data) => {
      setCallReceived(false);
      setShowAnswerButton(false);
      console.log("La llamada fue cancelada:", data);
    });

    return () => {
      socket.off("callCancelled");
    };
  }, []);

  /* Call Cancelled */

  useEffect(() => {
    socket.on("callCancelled", () => {
      setCallReceived(false);
      setCallAccepted(false); // Restablecer el estado de aceptación de la llamada
      setCallEnd(true);
    });

    return () => {
      socket.off("callCancelled");
      handleDisconnect(); // Desconectar al usuario si la llamada se cancela
    };
  }, []);

  /* sound configuration */

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

  /* Configuration audio */

  const toggleAudio = () => {
    const stream = userVideoRef.current.srcObject;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  /* Configuration video */

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
      setCallEnd(false); // Restablecer el estado de finalización de la llamada cuando se recibe una nueva llamada
    } else {
      setPlayAlarm(false);
    }
  }, [callReceived, callAccepted]);

  useEffect(() => {
    return () => {
      setPlayAlarm(false); // Detener la alarma cuando se desmonta el componente
    };
  }, []);

  /* DISCONECT */

  useEffect(() => {
    // Cuando la llamada se recibe y se acepta, activamos la llamada
    if (callReceived && callAccepted) {
      setCallActive(true);
    } else {
      setCallActive(false);
    }
  }, [callReceived, callAccepted]);

  /* DISCONECT */

  return (
    <div className={styles.general}>
      <div className={styles.container_videos}>
        <div
          className={`${styles.border_video} ${
            callActive ? "" : styles.hidden
          }`}
        >
          {!callEnd && (
            <video className={styles.video} ref={callerVideoRef} autoPlay />
          )}
        </div>
        <div
          className={`${styles.border_video}  ${
            callEnd ? styles.callEndUser : ""
          } ${callAccepted ? styles.border_video2 : ""}`}
        >
          <video
            className={`${styles.video_user} ${
              callAccepted ? styles.small : styles.large
            }`}
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
          />
        )}
      </div>
    </div>
  );
};

export default VideoCall;
