import express from "express";
import prisma, { sendError } from "../database";
import { isCommittee, teamCheck, tokenCheck } from "./auth";
import type { Request } from "../types";
import axios from "axios";

const router = express.Router();

// Create a new team
router.post("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { teamName } = req.body;
  if (!teamName) return sendError(res, "Team name is required", 400);

  // Create team in db
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

  // Create team in discord
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
    sendError(res);
    // If the team in not created in discord, delete it from the db
    await prisma.team.delete({
      where: { id: team.id },
    });
    return;
  }

  // Set the discord role id and channel id in the db
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

// Delete a team
router.delete("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { teamId }: { teamId: number } = req.body;
  if (!teamId) return sendError(res, "Team ID required", 400);

  // Create team in db
  let team;
  try {
    team = await prisma.team.delete({
      where: {
        id: teamId,
      },
    });
  } catch (error) {
    console.error(error);
    return sendError(res);
  }

  if (!team) return sendError(res, "Team ID not found", 400);
  if (!team.channelId || !team.roleId) return res.sendStatus(200);

  // Delete team in discord
  try {
    await axios.delete(`${process.env.BOT_API_URL}/teams`, {
      data: {
        channelId: team.channelId,
        roleId: team.roleId,
      },
      headers: {
        Authorization: process.env.BOT_API_KEY,
      },
    });
  } catch (error) {
    console.error(error);
    return sendError(
      res,
      "Altough discord seems to be connected, the team could not be deleted in discord",
      500
    );
  }
  return res.sendStatus(200);
});

// Change team name
router.patch(
  "/",
  tokenCheck,
  teamCheck,
  isCommittee,
  async (req: Request, res) => {
    const { newName, teamId } = req.body;
    if (!newName || !teamId)
      return sendError(res, "New name and Team ID are required", 400);
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
      .then(async (team) => {
        let hasSent = false;
        try {
          await axios.patch(
            `${process.env.BOT_API_URL}/teams`,
            {
              roleId: team.roleId,
              channelId: team.channelId,
              newName,
            },
            {
              headers: {
                Authorization: process.env.BOT_API_KEY!,
              },
            }
          );
        } catch (error) {
          console.error(error);
          hasSent = true;
          res.status(500).json({
            message:
              "Could not update team name in discord. Please update the channel name and role name manually. Names don't effect the functionality!",
          });
        }
        if (!hasSent) return res.sendStatus(200);
      })
      .catch((error) => {
        console.error(error);
        return sendError(res);
      });
  }
);

// Add member to team
router.post("/member", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { userId, teamId }: { userId: number; teamId: number } = req.body;
  if (!userId || !teamId)
    return sendError(res, "User ID and Team ID are required", 400);

  // Add member in db
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

  // Add user to team in discord
  try {
    await axios.post(
      `${process.env.BOT_API_URL}/member`,
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
    sendError(res, "Could not delete user from team in discord.", 500);
    await prisma.user.update({
      where: { id: userId },
      data: { teamId: null },
    });
    return;
  }

  return res.sendStatus(200);
});

// Delete member from team (unused: or add user to new team)
router.delete(
  "/member",
  tokenCheck,
  teamCheck,
  isCommittee,
  async (req, res) => {
    const { userId, newTeamId }: { userId: number; newTeamId?: number } =
      req.body;
    if (!userId) return sendError(res, "User id is required", 400);

    // Update db
    let user;
    try {
      user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          teamId: newTeamId ?? null,
        },
      });
    } catch (error) {
      console.error(error);
      return sendError(res);
    }
    if (!user) return sendError(res, "User not found", 404);
    if (!user.discordId) return res.sendStatus(200);

    // Update discord
    try {
      await axios.delete(`${process.env.BOT_API_URL}/member`, {
        data: {
          discordId: user.discordId,
        },
        headers: {
          Authorization: process.env.BOT_API_KEY,
        },
      });
    } catch (error) {
      console.error(error);
      sendError(
        res,
        "User not deleted from old team in discord. User's rights are updated, please manually update the user's roles in discord.",
        500
      );
      return;
    }
  }
);

// Get all teams
router.get("/", tokenCheck, teamCheck, isCommittee, async (req, res) =>
  res.json(await prisma.team.findMany())
);

// Get all team + members for public
router.get("/:id/public", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, "ID is not a number", 400);
  const data = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        select: { username: true },
      },
    },
  });
  return res.json(data);
});

// Get all users who are not yet in a team + list of teams
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
        isCommittee: false,
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

// Get all info about a team and its users
router.get("/:id", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, "ID is not a number", 400);
  const data = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        select: { username: true, name: true, id: true, discordId: true },
      },
    },
  });
  if (!data) return res.status(404).json({ message: "ID is not known" });
  return res.json(data);
});

export default router;
