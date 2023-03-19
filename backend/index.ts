import express from "express";
import dotenv from "dotenv";
import router from "./routes/auth";
import teamsRouter from "./routes/teams";
import assert from "assert";

dotenv.config();
assert.notEqual(process.env.JWT_PRIVATE_KEY, undefined);
assert.notEqual(process.env.DATABASE_URL, undefined);

const app = express();

app.use(express.json());

app.use("/auth", router);

app.use("/teams", teamsRouter);

const port = process.env.PORT ?? 8080;
app.listen(port);
console.log(`⚡ Listening on port ${port}...`);
