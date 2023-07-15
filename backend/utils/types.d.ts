import type { team } from "@prisma/client";
import type { Request as ExpressRequest } from "express";

export interface Request extends ExpressRequest {
  data?: {
    uid?: number;
    team?: team;
    username?: string;
  };
}

import type { puzzlesubmission, crazy88submission, challengesubmission } from "@prisma/client";

export type submissionType = "puzzle" | "challenge" | "crazy88"

export interface TypedSubmission extends puzzlesubmission, challengesubmission, crazy88submission {
  type?: submissionType
}