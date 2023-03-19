import express, { NextFunction, Response } from "express";
import type { Request } from "../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma, { sendError } from "../database";

const router = express.Router();

// @ts-expect-error
const secretKey: string = process.env.JWT_PRIVATE_KEY;

router.post("/register", async (req, res) => {
  const { username, password }: { username: string; password: string } =
    req.body;
  if (!username || !password)
    return sendError(res, "Username and password are required", 400);
  if (password.length < 6) return sendError(res, "Password too short", 400);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  prisma.user
    .create({
      data: {
        username: username.toLowerCase(),
        password: hash,
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
      console.error(error);
      return sendError(res);
    });
});

router.post("/login", async (req, res) => {
  const { username, password }: { username: string; password: string } =
    req.body;
  const user = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
  });
  if (!user) return sendError(res, `Username ${username} not found`, 400);
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
    if (!payload) return sendError(res);
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
  if (!uid) return sendError(res);
  const user = await prisma.user.findUnique({
    where: {
      id: uid,
    },
    include: {
      team: true,
    },
  });
  if (!user) return sendError(res);
  if (!user.team)
    return sendError(res, "You need to be in a team for this", 403);
  // @ts-expect-error
  req.data.team = user.team;
  next();
}

export function isCommittee(req: Request, res: Response, next: NextFunction) {
  if (!req.data?.team?.isCommitte)
    sendError(res, "You are not allowed to do this", 403);
  next();
}

export default router;
