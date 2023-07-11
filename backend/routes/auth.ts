import express, { NextFunction, Response } from "express";
import type { Request } from "../utils/types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "../utils/database";
import sendError from "../utils/sendError";
import axios from "axios";

const router = express.Router();

const secretKey: string = process.env.JWT_PRIVATE_KEY!;

// Method to register a committee member
router.post("/registerCommittee", async (req, res) => {
  const {
    username,
    password,
    name,
  }: { username: string; password: string; name: string } =
    req.body;
  if (!username || !name)
    return sendError(res, "Username and name are required", 400);

  if (password.length < 6) return sendError(res, "Password too short", 400);

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

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

// Method to register a participant
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

  // The token is a json web token which has the user's discord id in it's payload
  let discordId: string;
  let sentResponse = false;
  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        sentResponse = true;
        return sendError(
          res,
          "Token expired, request a new one by using the /register command on discord.",
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

  // Create the user in de database
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
    .then( async (data) => {
      // Create a token
      const token = jwt.sign(
        {
          uid: data.id,
        },
        secretKey
      );

      // Send the token to the client
      return res.send(
        JSON.stringify({
          token,
        })
      );
    })
    .catch((error) => {
      // If the username is already in the database, send a 400
      if (error.code === "P2002" && error.meta?.target === "user_username_key")
        return sendError(res, "Username already exists", 400);

      // If the discord id is already in the database, send a 400
      if (error.code === "P2002" && error.meta?.target === "user_discordId_key")
        return sendError(res, "Discord is already connected", 400);

      console.error(error);
      return sendError(res);
    });

  // Send a reqeuest to the bot to change the user's discord nickname
  // to what they inputed on the registration page
  try {
    await axios.patch(
      `${process.env.BOT_API_URL!}/member`,
      {
        // @ts-expect-error
        userId: discordId,
        newName: username,
      },
      {
        headers: { Authorization: process.env.BOT_API_KEY! },
      }
    );
  } catch (error) {
    console.error(error);
  }
});

// Method I am not sure yet where it is used, but it gives the username, name and discord id
// of a user given a user's token
router.post("/verifytoken", async (req, res) => {
  const { token }: { token: string } = req.body;
  if (!token) return sendError(res, "No token provided", 400);
  
  jwt.verify(token, secretKey, (err, payload) => {
    if (err || !payload || typeof payload === "string") {
      return sendError(res, "Invalid token", 401);
    }

    const uid = payload.uid;
    if (!uid) return sendError(res, "Invalid token", 401);

    prisma.user
      .findUnique({
        where: {
          id: uid,
        },
      })
      .then((data) => {
        // No user found with that id
        if (!data) return sendError(res, "Invalid token", 401);

        return res.send(
          JSON.stringify({
            username: data.username,
            name: data.name,
            discordId: data.discordId,
          })
        );
      })
      .catch((error) => {
        console.error(error);
        return sendError(res);
      });
  });
});

// Method to login as a committee member
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

  // Compere the hashed password to the plain password
  if (await bcrypt.compare(password, user.password)) {
    // Create a token and send it to the client
    const token = jwt.sign({ uid: user.id }, secretKey);
    return res.json({ token });
  } else {
    return sendError(res, "Password incorect", 400);
  }
});

// Method to change a committee member's password
router.post("/changepassword", tokenCheck, async (req: Request, res) => {
  const {
    oldPassword,
    newPassword,
  }: { oldPassword: string; newPassword: string } = req.body;
  if (!oldPassword || !newPassword)
    return sendError(res, "oldPassword and newPassword required", 400);

  // Find the user in the database. It's id (uid) is set by the tokenCheck
  const user = await prisma.user.findUnique({
    where: { id: req.data!.uid },
  });

  if (!user)
    return sendError(
      res,
      "User ID not found",
      404
    );

  if (!user.password)
    return sendError(
      res,
      "You have no password set",
      400
    );

  // Compere the hashed password to the plain password
  if (!(await bcrypt.compare(oldPassword, user.password)))
    return sendError(res, "Old password incorrect", 400);

  if (newPassword.length < 6)
    return sendError(res, "Password must be at least 6 characters", 400);

  // Salt and hash the new password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  // Update the hashed password in the database
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash },
  });

  return res.sendStatus(200);
});

// Middleware that given a token either respons with a 401 or
// sets the user's id on the request
export function tokenCheck(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) return sendError(res, "No authorization token", 401);

  jwt.verify(token, secretKey, (err, payload) => {
    if (err || !payload || typeof payload === "string") return sendError(res, "Invalid token", 401);

    req.data = {
      uid: payload.uid,
    };
    next();
  });
}

// Middleware that checks if the user is in a team
// If not it sends a 403
// Otherwise it adds the team to the request
export async function teamCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const uid = req.data?.uid;
  if (!uid || !req.data) {
    console.error(
      "No UID in teamCheck, did you call teamCheck before tokenCheck?"
    );
    return sendError(res);
  }

  // Find the user's team in the database
  const user = await prisma.user.findUnique({
    where: {
      id: uid,
    },
    include: {
      team: true,
    },
  });

  // User is not found in the database
  if (!user) {
    console.error("User not found in teamCheck");
    return sendError(res);
  }

  // User has no team
  if (!user.team)
    return sendError(
      res,
      "You need to be placed in a team for this. Contact the committee if you registered more than 30 minutes ago since they might have forgotten to place you in your team!",
      403
    );
    
  // Add the team to the request
  req.data.team = user.team;
  next();
}

//Middleware to check if the team that is set on the requets is the committee
export function isCommittee(req: Request, res: Response, next: NextFunction) {
  if (!req.data?.team?.isCommittee)
    return sendError(res, "You are not allowed to do this", 403);
  next();
}

// Middleware that checks if a request that is made by the bot has the right key
export function checkBotApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // The key should be set on the authorization header
  const key = req.headers.authorization;
  if (!key) return sendError(res, "No auth key found", 401);
  if (key === process.env.BOT_API_KEY!) return next();
  return sendError(res, "Invalid key", 401);
}

// Middleware that finds a user based on the discord id in the body.
// This middleware should only be used when you know the request
// was send by the bot, since a user's discord id is not secret.
export async function checkDiscordId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { discordId } = req.body;
  if (!discordId) return sendError(res, "Discord ID is required", 400);

  // Find discord id in the database
  const user = await prisma.user.findUnique({
    where: {
      discordId,
    },
    include: {
      team: true,
    },
  });

  if (!user)
    return sendError(res, "Discord ID is unkown, did you do /register?", 401);

  // Add all user's information on the request
  req.data = {
    uid: user.id,
    username: user.username,
    team: user.team ?? undefined,
  };
  next();
}

export default router;
