import type { Request, Response, NextFunction } from "express";

export default function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization;
  if (!token)
    return res.status(401).json({
      message: "Token not found",
    });

  if (token === process.env.API_KEY!) return next();
  return res.status(401).json({
    message: "Token not valid",
  });
}
