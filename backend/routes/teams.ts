import express from "express";
import prisma, { sendError } from "../database";
import { isCommittee, teamCheck, tokenCheck } from "./auth";
import type { Request } from "../types";
import axios from "axios";

const router = express.Router();

router.post("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { teamName } = req.body;
  if (!teamName) return sendError(res, "Team name is required", 400);

  let team;
  try {
    team = await prisma.team.create({
      data: {
        name: teamName,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target === "team_name_key")
      return sendError(res, "Team name already exists", 400);
    console.error(error);
  }
  if (!team) return sendError(res);

  let discordRes;
  try {
    discordRes = await axios.post(
      `${process.env.BOT_API_URL}/teams`,
      {
        name: teamName,
      },
      {
        headers: {
          Authorization: process.env.BOT_API_KEY!,
        },
      }
    );
  } catch (error) {
    console.error(error);
    return sendError(res);
  }

  await prisma.team.update({
    where: {
      id: team.id,
    },
    data: {
      channelId: discordRes.data.channelId,
      roleId: discordRes.data.roleId,
    },
  });
  res.sendStatus(200);
});

router.delete("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { teamId } = req.body;
  if (!teamId) return sendError(res, "No team id", 400);

  try {
    await prisma.team.delete({
      where: {
        id: teamId,
      },
    });
  } catch (error) {
    console.error(error);
    return sendError(res);
  }
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

router.post("/member", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { userId, teamId } = req.body;
  if (!userId || !teamId)
    return sendError(res, "User ID and Team ID are required", 400);

  let user;
  try {
    user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        teamId,
      },
      include: {
        team: true,
      },
    });
  } catch (error) {
    console.error(error);
  }
  if (!user) return sendError(res, "User ID is now known", 400);

  console.log(user);
  try {
    await axios.post(
      `${process.env.BOT_API_URL}/teams/member`,
      {
        roleId: user.team?.roleId,
        userId: user.discordId,
      },
      {
        headers: {
          Authorization: process.env.BOT_API_KEY!,
        },
      }
    );
  } catch (error) {
    console.error(error);
    return sendError(res);
  }

  return res.sendStatus(200);
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

router.get("/", tokenCheck, teamCheck, isCommittee, async (req, res) =>
  res.json(await prisma.team.findMany())
);

router.get("/:id", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res);
  const data = await prisma.team.findUnique({
    where: { id },
    include: { members: { select: { username: true, name: true, id: true } } },
  });
  return res.json(data);
});

router.get("/lonely", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  try {
    const users = prisma.user.findMany({
      where: {
        teamId: null,
      },
      select: {
        username: true,
        name: true,
        id: true,
      },
    });

    const teams = prisma.team.findMany({
      where: {
        isCommitte: false,
      },
    });

    Promise.all([users, teams]).then(([users, teams]) =>
      res.json({ users, teams })
    );
  } catch (error) {
    console.error(error);
    return sendError(res);
  }
});

export default router;
