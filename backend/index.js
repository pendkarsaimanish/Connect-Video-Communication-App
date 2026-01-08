const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ status: "signaling server up 🏃‍♂️" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, userId }) => {
    console.log(`[${socket.id}] User ${userId} joining room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    const clients = io.sockets.adapter.rooms.get(roomId);
    console.log(
      `Room ${roomId} has clients:`,
      clients ? Array.from(clients) : []
    );
  });

  socket.on("offer", ({ roomId, offer }) => {
    console.log(`[${socket.id}] Sending offer to room ${roomId}`);
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    console.log(`[${socket.id}] Sending answer to room ${roomId}`);
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    console.log(`[${socket.id}] Sending ICE candidate to room ${roomId}`);
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port :${PORT}`);
});
