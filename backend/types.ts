import { team } from "@prisma/client";
import { Request as ExpressRequest } from "express";

export interface Request extends ExpressRequest {
  data?: {
    uid?: number;
    team?: team;
  };
}
