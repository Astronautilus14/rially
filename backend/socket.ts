import http from "http";
import { Server as SocketServer } from "socket.io";
import express from "express";

export const server = http.createServer(express());
const io = new SocketServer(server, {
  cors: {
    origin: ["http://127.0.0.1:5173"],
  },
});

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected to the socket server`);

  socket.on("grading-started", (id, type) => {
    io.emit("grading-started", id, type);
  });
});

export default io;
