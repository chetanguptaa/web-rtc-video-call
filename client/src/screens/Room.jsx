import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState(null);
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room`);
    setRemoteSocketId(id);
  }, []);
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", {
      to: remoteSocketId,
      offer,
    });
    setMyStream(stream);
  }, [remoteSocketId, socket]);
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      setRemoteSocketId(from);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", {
        to: from,
        ans,
      });
    },
    [socket]
  );
  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log(`call accepted from ${from}`);
      sendStreams();
    },
    [sendStreams]
  );
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", {
      offer,
      to: remoteSocketId,
    });
  }, [remoteSocketId, socket]);
  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", {
        to: from,
        ans,
      });
    },
    [socket]
  );
  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    handleCallAccepted,
    handleIncommingCall,
    handleNegoFinal,
    handleNegoIncoming,
    handleUserJoined,
    socket,
  ]);
  useEffect(() => {
    peer.peer.addEventListener("negotationNeeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotationNeeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);
  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  });
  return (
    <div>
      <h1>Room Page</h1>
      <h3>{remoteSocketId ? "connected" : "No One in Room"}</h3>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            url={myStream}
            height="100px"
            width="200px"
            playing
            muted
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Second Users{`&apos;`} Stream</h1>
          <ReactPlayer
            url={remoteStream}
            height="100px"
            width="200px"
            playing
            muted
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;
