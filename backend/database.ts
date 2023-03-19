import { PrismaClient } from "@prisma/client";
import type { Response } from "express";

const prisma = new PrismaClient();
export default prisma;

export function sendError(res: Response, msg?: string, status?: number) {
  res.status(status ?? 500).send(
    JSON.stringify({
      message: msg ?? "An error occured",
    })
  );
}
