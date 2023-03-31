import { Router } from "express";
import verifyToken from "../utils/verifyToken";
import { client } from "../index";
import getFromCacheOrFetch from "../utils/getFromCacheOrFetch";

const router = Router();

// Remove a member from a team
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

  user.roles
    .remove(user.roles.cache)
    .then(() => res.sendStatus(200))
    .catch((error: any) => {
      console.error(error);
      return res.sendStatus(500);
    });
});

// Add a user to a team
router.post("/", verifyToken, async (req, res) => {
  const { roleId, userId }: { roleId: string; userId: string } = req.body;
  if (!roleId || !userId)
    return res.status(400).json({
      message: "Role ID and User ID are required",
    });

  const guild = await getFromCacheOrFetch(
    client.guilds,
    process.env.DISCORD_SERVER_ID!
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  const role = await getFromCacheOrFetch(guild.roles, roleId);
  if (!role)
    return res.status(400).json({
      message: "Role not found",
    });

  const user = await getFromCacheOrFetch(guild.members, userId);
  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  try {
    await user.roles.remove(user.roles.cache);
    await user.roles.add(role);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

export default router;
