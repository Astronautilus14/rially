import express from "express";
import dotenv from "dotenv";
import router from "./routes/auth";
import teamsRouter from "./routes/teams";
import assert from "assert";
import cors from "cors";

dotenv.config();
assert.notEqual(process.env.JWT_PRIVATE_KEY, undefined);
assert.notEqual(process.env.DATABASE_URL, undefined);
assert.notEqual(process.env.LINK_DISCORD_SECRET, undefined);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", router);
app.use("/teams", teamsRouter);

async function run() {
  const port = process.env.PORT ?? 8080;
  app.listen(port, () => {
    console.log(`⚡ Listening on port ${port}...`);
  });
}

run();
