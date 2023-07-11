import type { Response } from "express";

export default function sendError(
  res: Response,
  msg = "An error occured",
  status = 500
) {
  const data = JSON.stringify({
    message: msg,
  });
  res.status(status).send(data);
}