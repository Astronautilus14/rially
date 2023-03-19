import express from "express";
import prisma, { sendError } from "../database";
import { isCommittee, teamCheck, tokenCheck } from "./auth";
import type { Request } from "../types";

const router = express.Router();

router.post("/", tokenCheck, teamCheck, isCommittee, (req, res) => {
  const { teamName } = req.body;
  if (!teamName) return sendError(res, "Team name is required", 400);

  prisma.team
    .create({
      data: {
        name: teamName,
      },
    })
    .then(() => res.sendStatus(200))
    .catch((error) => {
      if (error.code === "P2002" && error.meta?.target === "team_name_key")
        return sendError(res, "Team name already exists", 400);
    });
});

router.delete("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { teamId } = req.body;
  if (!teamId) return sendError(res, "No team id", 400);

  prisma.team
    .delete({
      where: {
        id: teamId,
      },
    })
    .then(() => res.sendStatus(200))
    .catch((error) => {
      res.sendStatus(500);
    });
});

router.patch(
  "/",
  tokenCheck,
  teamCheck,
  isCommittee,
  async (req: Request, res) => {
    const { newName, teamId } = req.body;
    if (!newName || !teamId)
      return sendError(res, "New name and Team id are required", 400);
    if (!req.data?.team?.id) return sendError(res);
    prisma.team
      .update({
        where: {
          id: teamId,
        },
        data: {
          name: newName,
        },
      })
      .then(() => res.sendStatus(200))
      .catch((error) => {
        console.error(error);
        return sendError(res);
      });
  }
);

router.post("/member", tokenCheck, teamCheck, isCommittee, (req, res) => {
  const { userId, teamId } = req.body;
  if (!userId || !teamId)
    return sendError(res, "User id and team id are required", 400);
  prisma.user
    .update({
      where: {
        id: userId,
      },
      data: {
        teamId,
      },
    })
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error(error);
      return sendError(res);
    });
});

router.delete("/member", tokenCheck, teamCheck, isCommittee, (req, res) => {
  const { userId, newTeamId } = req.body;
  if (!userId) return sendError(res, "User id is required", 400);
  prisma.user
    .update({
      where: {
        id: userId,
      },
      data: {
        teamId: newTeamId ?? null,
      },
    })
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error(error);
      return sendError(res);
    });
});

export default router;
