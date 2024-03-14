import express from "express";
import prisma from "../utils/database";
import sendError from "../utils/sendError";
import { isCommittee, teamCheck, tokenCheck } from "./auth";
import type { Request } from "../utils/types";
import axios from "axios";

const router = express.Router();

// Method to create a new team
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
    if (error.code === "P2002" && error.meta?.target === "team_name_key") {
      return sendError(res, "Team name already exists", 400);
    }
    console.error(error);
    return sendError(res);
  }
  if (!team) return sendError(res);

  // Send a request to the discord bot to create a team
  // The bot reponds with the newly created channel id and role id
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
    return sendError(
      res,
      "Could not create the channel and/or role in the discord server. Please do so manually",
      500
    );
  }

  // Update the discord role id and channel id in the database
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

// Method to delete a team
router.delete("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { teamId }: { teamId: number } = req.body;
  if (!teamId) return sendError(res, "Team ID required", 400);

  // Deleate the team from the database
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

  // If the team is not in the discord server
  if (!team.channelId || !team.roleId) return res.sendStatus(200);

  // Send a request to the bot to delete the team in the discord server
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

// Method to change a team name
router.patch(
  "/",
  tokenCheck,
  teamCheck,
  isCommittee,
  async (req: Request, res) => {
    const { newName, teamId } = req.body;
    if (!newName || !teamId) {
      return sendError(res, "New name and Team ID are required", 400);
    }

    // Update the team name in the data base
    let team;
    try {
      team = await prisma.team.update({
        where: {
          id: teamId,
        },
        data: {
          name: newName,
        },
      });
    } catch (error) {
      console.error(error);
      return sendError(res);
    }
    if (!team) return sendError(res, `Team ID ${teamId} not found`, 404);

    // Send a request to the bot to change the team name in the discord server
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
      return sendError(
        res,
        "Could not update team name in discord. Please update the channel name and role name manually. Names don't effect the functionality!"
      );
    }
    return res.sendStatus(200);
  }
);

// Method to add user to a team
router.post("/member", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  const { userId, teamId }: { userId: number; teamId: number } = req.body;
  if (!userId || !teamId) {
    return sendError(res, "User ID and Team ID are required", 400);
  }

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
        Team: true,
      },
    });
  } catch (error) {
    console.error(error);
    return sendError(res);
  }
  if (!user) return sendError(res, `User ID ${userId} is unknown`, 404);

  // Send a request to the bot to add the user to a team in the discord server
  try {
    await axios.post(
      `${process.env.BOT_API_URL}/member`,
      {
        roleId: user.Team!.roleId,
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
    return sendError(
      res,
      "Could not delete user from team in discord. Please do so manually by removing the user's role in the discord server.",
      500
    );
  }

  return res.sendStatus(200);
});

// Method to delete member from team (unused: or change a user's team)
router.delete(
  "/member",
  tokenCheck,
  teamCheck,
  isCommittee,
  async (req, res) => {
    const { userId, newTeamId }: { userId: number; newTeamId?: number } =
      req.body;
    if (!userId) return sendError(res, "User ID is required", 400);

    // Update data base
    const user = await prisma.user
      .update({
        where: {
          id: userId,
        },
        data: {
          teamId: newTeamId ?? null,
        },
      })
      .catch((e) => {
        console.error(e);
        return sendError(res);
      });

    if (!user) return sendError(res, `User ID ${userId} not found`, 404);
    if (!user.discordId) return res.sendStatus(200);

    // Send a request to the bot to change the role of the user in the discord server
    try {
      await axios.delete(`${process.env.BOT_API_URL}/member`, {
        data: {
          discordId: user.discordId,
        },
        headers: {
          Authorization: process.env.BOT_API_KEY!,
        },
      });
    } catch (error) {
      console.error(error);
      sendError(
        res,
        "User not deleted from old team in Discord. User's rights are updated, please manually update the user's role in Discord.",
        500
      );
      return;
    }

    return res.sendStatus(200);
  }
);

// Method to change a username
router.patch(
  "/member",
  tokenCheck,
  teamCheck,
  isCommittee,
  async (req, res) => {
    const { userId, newName }: { userId: number; newName: string } = req.body;
    if (!userId || !newName) {
      return sendError(res, "User ID and New name required", 400);
    }

    // Update the username in the database
    const user = await prisma.user
      .update({
        where: { id: userId },
        data: { username: newName },
      })
      .catch((error) => {
        console.error(error);
        return sendError(res);
      });

    if (!user) return sendError(res, "User ID not found", 404);

    // If there is no discord ID, the username will not have to be updated in the discord server
    if (!user.discordId) return res.sendStatus(200);

    // Send a request to the bot to change the user's username in the discord server
    try {
      await axios.patch(
        `${process.env.BOT_API_URL!}/member`,
        {
          userId: user.discordId,
          newName,
        },
        {
          headers: { Authorization: process.env.BOT_API_KEY! },
        }
      );
      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return sendError(
        res,
        "Username could not be updated on Discord, please do so manually. Note that usernames don't effect functionality!"
      );
    }
  }
);

// Method to get all teams
router.get("/", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  try {
    return res.json(await prisma.team.findMany());
  } catch (error) {
    console.error(error);
    return sendError(res);
  }
});

// Method to get all users
router.get("/users", tokenCheck, teamCheck, isCommittee, async (req, res) => {
  try {
    res.json(
      await prisma.user.findMany({ select: { id: true, username: true } })
    );
  } catch (error) {
    console.error(error);
    sendError(res);
  }
});

// Method to get the id of the committee team
router.get("/committee", tokenCheck, teamCheck, isCommittee, async (_, res) => {
  try {
    res.json(
      await prisma.team.findFirst({
        where: { isCommittee: true },
        select: { id: true },
      })
    );
  } catch (error) {
    console.error(error);
    sendError(res);
  }
});

// Method to get all team + members for public
router.get("/:id/public", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, "ID is not a number", 400);

  const team = await prisma.team
    .findUnique({
      where: { id },
      select: {
        Users: {
          select: { username: true },
        },
        name: true,
      },
    })
    .catch((e) => {
      console.error(e);
      return sendError(res);
    });

  if (!team) return sendError(res, `Team ${id} not found`, 404);
  res.json({ team });
});

// Method to get all users who are not yet in a team + list of teams
router.get("/lonely", tokenCheck, teamCheck, isCommittee, async (_, res) => {
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

    // Wait on the database and then send the users and teams to the client
    Promise.all([users, teams]).then(([users, teams]) =>
      res.json({ users, teams })
    );
  } catch (error) {
    console.error(error);
    return sendError(res);
  }
});

// Method to get info about a team and its users
router.get("/:id", tokenCheck, teamCheck, isCommittee, (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, "ID is not a number", 400);

  prisma.team
    .findUnique({
      where: { id },
      include: {
        Users: {
          select: { username: true, name: true, id: true, discordId: true },
        },
      },
    })
    .then((data) => {
      if (!data) return res.status(404).json({ message: "ID is not known" });
      return res.json(data);
    })
    .catch((error) => {
      console.error(error);
      sendError(res);
    });
});

export default router;
