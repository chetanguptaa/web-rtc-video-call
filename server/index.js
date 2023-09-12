const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const EmailToSocketId = new Map();
const socketIdToEmail = new Map();

io.on("connection", (socket) => {
  console.log("socket Connected", socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    EmailToSocketId.set(email, socket.id);
    socketIdToEmail.set(socket.id, email);
    socket.to("room:join", data);
  });
});