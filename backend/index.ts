import express from "express";
import dotenv from "dotenv";
import assert from "assert";
import cors from "cors";

import authRouter from "./routes/auth";
import teamsRouter from "./routes/teams";
import submissionsRouter from "./routes/submissions";
import leaderboardRouter from "./routes/leaderboard";

import { server } from "./utils/socket";

// Check if all essential environment variables are set
dotenv.config();
assert.notEqual(process.env.JWT_PRIVATE_KEY, undefined);
assert.notEqual(process.env.DATABASE_URL, undefined);
assert.notEqual(process.env.LINK_DISCORD_SECRET, undefined);
assert.notEqual(process.env.BOT_API_URL, undefined);

// Create the express app
const app = express();
app.use(cors());
app.use(express.json());

// Set all routes
app.use("/auth", authRouter);
app.use("/teams", teamsRouter);
app.use("/submissions", submissionsRouter);
app.use("/leaderboard", leaderboardRouter);

async function run() {
  const port = process.env.PORT ?? 8080;
  app.listen(port, () => {
    console.log(`⚡ Listening on port ${port}...`);
  });

  const socketPort = process.env.SOCKET_PORT ?? 7070;
  server.listen(socketPort, () => {
    console.log(`🔌 Socket server listening on port ${socketPort}...`);
  });
}

run();