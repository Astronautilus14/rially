import express, { NextFunction, Response } from "express";
import type { Request } from "../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma, { sendError } from "../database";

const router = express.Router();

// @ts-expect-error
const secretKey: string = process.env.JWT_PRIVATE_KEY;

router.post("/registerCommittee", async (req, res) => {
  const {
    username,
    password,
    name,
  }: { username: string; password?: string; discordId: string; name: string } =
    req.body;
  if (!username || !name)
    return sendError(res, "Username and name are required", 400);

  let hash: string | null = null;
  if (password) {
    if (password.length < 6) return sendError(res, "Password too short", 400);

    const salt = await bcrypt.genSalt(10);
    hash = await bcrypt.hash(password, salt);
  }

  prisma.user
    .create({
      data: {
        username: username.toLowerCase(),
        password: hash,
        name,
      },
    })
    .then((data) => {
      const token = jwt.sign(
        {
          uid: data.id,
        },
        secretKey
      );
      return res.send(
        JSON.stringify({
          token,
        })
      );
    })
    .catch((error) => {
      if (error.code === "P2002" && error.meta?.target === "user_username_key")
        return sendError(res, "Username already exists", 400);
      if (error.code === "P2002" && error.meta?.target === "user_discordId_key")
        return sendError(res, "Discord is already connected", 400);
      console.error(error);
      return sendError(res);
    });
});

router.post("/register", async (req, res) => {
  const {
    token,
    username,
    name,
  }: { token: string; username: string; name: string } = req.body;
  if (!token || !username || !name)
    return sendError(res, "Token, Username and Name are required");
  // @ts-expect-error
  const secret: string = process.env.LINK_DISCORD_SECRET;

  let discordId: string;
  let sentResponse = false;
  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        sentResponse = true;
        return sendError(
          res,
          "Token expired, request a new one by using the -register command on discord.",
          401
        );
      }
      console.log(err);
      sentResponse = true;
      return sendError(res, "Token not valid", 401);
    }
    // @ts-expect-error
    discordId = payload?.discordId;
    if (!discordId) {
      sentResponse = true;
      return sendError(res, "Discord ID required", 400);
    }
  });

  if (sentResponse) return;

  if (!username) return sendError(res, "Username required", 400);
  if (!name) return sendError(res, "Name required", 400);

  prisma.user
    .create({
      data: {
        username: username.toLowerCase(),
        password: null,
        name,
        // @ts-expect-error
        discordId,
      },
    })
    .then((data) => {
      const token = jwt.sign(
        {
          uid: data.id,
        },
        secretKey
      );
      return res.send(
        JSON.stringify({
          token,
        })
      );
    })
    .catch((error) => {
      if (error.code === "P2002" && error.meta?.target === "user_username_key")
        return sendError(res, "Username already exists", 400);
      if (error.code === "P2002" && error.meta?.target === "user_discordId_key")
        return sendError(res, "Discord is already connected", 400);
      console.error(error);
      return sendError(res);
    });
});

router.post("/login", async (req, res) => {
  const { username, password }: { username: string; password: string } =
    req.body;
  if (!username || !password)
    return sendError(res, "Username and Password are required", 400);
  const user = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
  });
  if (!user) return sendError(res, `Username ${username} not found`, 400);

  if (!user.password) return sendError(res, "No password set", 400);
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ uid: user.id }, secretKey);
    res.send(
      JSON.stringify({
        token,
      })
    );
  }
});

export function tokenCheck(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) return sendError(res, "No authorization token", 401);
  jwt.verify(token, secretKey, (err, payload) => {
    if (err) return sendError(res, "Invalid token", 401);
    if (!payload) {
      console.error("No payload in tokeCheck");
      return sendError(res);
    }
    req.data = {
      // @ts-expect-error
      uid: payload.uid,
    };
    // @ts-expect-error
    req.data.uid = payload.uid;
    next();
  });
}

export async function teamCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uid = req.data?.uid;
  if (!uid) {
    console.error(
      "No UID in teamCheck, did you call teamCheck before tokenCheck?"
    );
    return sendError(res);
  }
  const user = await prisma.user.findUnique({
    where: {
      id: uid,
    },
    include: {
      team: true,
    },
  });
  if (!user) {
    console.error("User not found in teamCheck");
    return sendError(res);
  }
  if (!user.team)
    return sendError(res, "You need to be in a team for this", 403);
  // @ts-expect-error
  req.data.team = user.team;
  next();
}

export function isCommittee(req: Request, res: Response, next: NextFunction) {
  if (!req.data?.team?.isCommittee)
    return sendError(res, "You are not allowed to do this", 403);
  next();
}

export function checkBotApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.headers.authorization;
  if (!key) return sendError(res, "No auth key found", 401);
  if (key === process.env.BOT_API_KEY!) return next();
  return sendError(res, "Invalid key", 401);
}

export async function checkDiscordId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { discordId } = req.body;
  if (!discordId) return sendError(res, "Discord ID is required", 400);

  const user = await prisma.user.findUnique({
    where: {
      discordId,
    },
    include: {
      team: true,
    },
  });
  if (!user) return sendError(res, "Discord ID is unkown", 401);
  req.data = {
    uid: user.id,
    username: user.username,
    team: user.team ?? undefined,
  };
  next();
}

export default router;
