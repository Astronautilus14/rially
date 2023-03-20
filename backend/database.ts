import { PrismaClient } from "@prisma/client";
import type { Response } from "express";

const prisma = new PrismaClient();
export default prisma;

export function sendError(res: Response, msg?: string, status?: number) {
  const data = JSON.stringify({
    message: msg ?? "An error occured",
  });
  res.status(status ?? 500).send(data);
}
