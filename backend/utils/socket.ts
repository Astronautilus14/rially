import http from "http";
import { Server as SocketServer } from "socket.io";
import express from "express";

// Create the web socket server
export const server = http.createServer(express());
const io = new SocketServer(server, {
  cors: { origin: "*" },
});

// List to keep track of all submissions that are not graded yet,
// but someone is currently grading
let areGrading: { id: number; type: string }[] = [];

io.on("connection", (socket) => {

  // For every new connection, send a message of the submission that are being graded
  for (const submission of areGrading) {
    socket.emit("grading-started", submission.id, submission.type);
  }

  // When a client starts grading a submission
  socket.on("grading-started", (id: number, type: string) => {
    // Add it to the list of submissions that are being graded
    areGrading.push({ id, type });
    // Let all other clients know the grading has started
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
