import { Router } from "express";
import verifyToken from "../utils/verifyToken";
import { client } from "../index";
import getFromCacheOrFetch from "../utils/getFromCacheOrFetch";

const router = Router();

// Method to remove a member from a team
router.delete("/", verifyToken, async (req, res) => {
  const { discordId } = req.body;
  if (!discordId)
    return res.status(400).json({ message: "Discord ID required" });

  const guild = await getFromCacheOrFetch(
    client.guilds,
    process.env.DISCORD_SERVER_ID!
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  const user = await getFromCacheOrFetch(guild.members, discordId);
  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  // Remove all roles the user currenyl has
  user.roles
    .remove(user.roles.cache)
    .then(() => res.sendStatus(200))
    .catch((error: any) => {
      console.error(error);
      return res.sendStatus(500);
    });
});

// Method to add a user to a team
router.post("/", verifyToken, async (req, res) => {
  const { roleId, userId }: { roleId: string; userId: string } = req.body;
  if (!roleId || !userId)
    return res.status(400).json({
      message: "Role ID and User ID are required",
    });
  
  // Find the guild (discord server)
  const guild = await getFromCacheOrFetch(
    client.guilds,
    process.env.DISCORD_SERVER_ID!
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  // Find the role
  const role = await getFromCacheOrFetch(guild.roles, roleId);
  if (!role)
    return res.status(400).json({
      message: "Role not found",
    });

  // Find the user
  const user = await getFromCacheOrFetch(guild.members, userId);
  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  try {
    // Remove all roles the user has
    await user.roles.remove(user.roles.cache);
    // Add the role of the user's new team
    await user.roles.add(role);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

// Method to update a user's nickname
router.patch("/", verifyToken, async (req, res) => {
  const { userId, newName }: { userId: string; newName: string } = req.body;
  if (!userId || !newName)
    return res.status(400).json({ message: "User ID and New name required" });

  // Find the guild (discord server)
  const guild = await getFromCacheOrFetch(
    client.guilds,
    process.env.DISCORD_SERVER_ID!
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  // Find the user
  const user = await getFromCacheOrFetch(guild.members, userId);
  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  try {
    // Update the user's nickname
    await user.edit({ nick: newName });
  } catch (error: any) {
    // 50013 is discords error code for lacking permission
    // The bot can't change the nickname of an admin
    // If this error occured more, the bot has not the right permissions
    if (error.code === 50013) return res.status(403).json({
      message: "Can not change that user's name because he is a discord admin"
    })

    console.error(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

export default router;
