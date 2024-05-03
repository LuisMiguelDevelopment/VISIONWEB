import { useEffect, useRef, useState } from "react";
import { useCall } from "@/context/CallContext";
import { useAuth } from "@/context/authContext";
import { socket } from "@/context/CallContext";
import Peer from "simple-peer";
import styles from "../styles/VideoCall.module.css";

import { BsCameraVideo } from "react-icons/bs";
import { BsCameraVideoOff } from "react-icons/bs";

import { PiMicrophoneLight } from "react-icons/pi";
import { PiMicrophoneSlash } from "react-icons/pi";

import ModalCall from "./modaCall";

import alarma from "../../public/alarma.mp3";

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
  } = useCall();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showAnswerButton, setShowAnswerButton] = useState(true);

  const [isRinging, setIsRinging] = useState(false);

  const [callAccepted, setCallAccepted] = useState(false);

  const { user } = useAuth();
  const callerVideoRef = useRef(null);
  const peerRef = useRef(null);

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

    setShowAnswerButton(false);

    setCallAccepted(true)

    userVideoRef.current.srcObject = stream;

  };

  useEffect(() => {
    if (!myPeer) return;

    socket.on("callAccepted", (data) => {
      console.log(data);
      const { signal } = data;
      myPeer.signal(signal);

      myPeer.on("connect", () => {
        console.log("¡Conexión establecida!");
      });

      myPeer.on("stream", (stream) => {
        callerVideoRef.current.srcObject = stream; // Mostrar el stream del llamante
      });

      setCallAccepted(true)

      userVideoRef.current.srcObject = stream;
    });

    return () => {
      socket.off("callAccepted");
    };
  }, [myPeer]);

  /* sound configuration */

  useEffect(() => {
    // Reproducir sonido cuando hay una llamada recibida
    if (callReceived && !isRinging && showAnswerButton) {
      const audio = new Audio(alarma);
      audio.play();

      setIsRinging(true);
    } else if ((!callReceived || !showAnswerButton) && isRinging) {
      setIsRinging(false);

    }
  }, [callReceived, isRinging, showAnswerButton]);

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

  return (
    <div className={styles.general}>
      <div className={styles.container_videos}>
        <div className={styles.border_video}>
          <video className={styles.video} ref={callerVideoRef} autoPlay />
        </div>
        <div className={`${styles.border_video} ${styles.border_video2}`}>
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
      </div>

      <div className={styles.modal}>
        {showAnswerButton && callReceived && tocall === user.UserId && (
          <ModalCall handleCallAccept={handleCallAccept} />
        )}
      </div>
    </div>
  );
};

export default VideoCall;