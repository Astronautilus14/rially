import http from "http";
import { Server as SocketServer } from "socket.io";
import express from "express";

export const server = http.createServer(express());
const io = new SocketServer(server, {
  cors: {
    origin: [
      "http://127.0.0.1:5173",
      "http://localhost:5173",
      "http://127.0.0.1:8083/",
      "http://localhost:8083/",
      "https://rially.nautdevroome.nl",
    ],
  },
});

let areGrading: { id: number; type: string }[] = [];

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected to the socket server`);

  for (const submission of areGrading) {
    socket.emit("grading-started", submission.id, submission.type);
  }

  socket.on("grading-started", (id: number, type: string) => {
    areGrading.push({ id, type });
    io.emit("grading-started", id, type);
  });

  socket.on("grading-finished", (id: number, type: string) => {
    removeAreGrading(id, type);
    io.emit("grading-finished", id, type);
  });

  socket.on("grading-cancled", (id: number, type: string) => {
    removeAreGrading(id, type);
    io.emit("grading-cancled", id, type);
  });

  function removeAreGrading(id: number, type: string) {
    areGrading = areGrading.filter(
      (submission) => submission.type !== type && submission.id !== id
    );
  }
});

export default io;
