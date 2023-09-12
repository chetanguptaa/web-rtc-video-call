import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const LobbyScreen = () => {
  const router = useNavigate();
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const socket = useSocket();

  function handleSubmit(e) {
    e.preventDefault();
    socket.emit("room:join", {
      email,
      room,
    });
  }

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      router(`room/${room}`);
    },
    [router]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [handleJoinRoom, socket]);
  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};

export default LobbyScreen;
