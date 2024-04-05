import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const VideoCall = ({ callUser, answerCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [myPeer, setMyPeer] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    const initializeMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error accessing media devices", error);
      }
    };
    initializeMediaStream();
  }, []);

  const toggleAudio = () => {
    const stream = localVideoRef.current.srcObject;
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current.srcObject;

    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const handleCall = async () => {
    const peer = new Peer({ initiator: true });
    setMyPeer(peer);
    const stream = localVideoRef.current.srcObject;
    peer.addStream(stream);
    peer.on("signal", (signal) => {
      callUser(signal);
    });
    peer.on("stream", (stream) => {
      setRemoteStream(stream);
    });
  };

  const handleAnswer = async (signal) => {
    const peer = new Peer({ initiator: false });
    setMyPeer(peer);
    const stream = localVideoRef.current.srcObject;
    peer.addStream(stream);
    peer.signal(signal);
    peer.on("stream", (stream) => {
      setRemoteStream(stream);
    });
  };

  useEffect(() => {
    if (answerCall && answerCall.signal) {
      handleAnswer(answerCall.signal);
    }
  }, [answerCall]);




  return (
    <div>
      <video ref={localVideoRef} autoPlay muted width={400} height={400} />
      {remoteStream && (
        <video ref={remoteVideoRef} autoPlay width={400} height={400} srcObject={remoteStream} />
      )}
      <div>
        <button onClick={toggleAudio}>{isMuted ? "Unmute" : "Mute"}</button>
        <button onClick={toggleVideo}>{isCameraOff ? "Turn Camera on" : "Turn Camera off"}</button>
        {!answerCall && <button onClick={handleCall}>Call</button>}
      </div>
    </div>
  );
};

export default VideoCall;
