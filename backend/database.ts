import { PrismaClient } from "@prisma/client";
import type { Response } from "express";

const prisma = new PrismaClient();
export default prisma;

export function sendError(
  res: Response,
  msg = "An error occured",
  status = 500
) {
  const data = JSON.stringify({
    message: msg,
  });
  res.status(status).send(data);
}
