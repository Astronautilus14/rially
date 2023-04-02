import { Router } from "express";
import verifyToken from "../utils/verifyToken";
import { client } from "../index";
import { ChannelType } from "discord.js";
import getFromCacheOrFetch from "../utils/getFromCacheOrFetch";
import type discordjs from "discord.js";

const router = Router();

// Delete a team
router.delete("/", verifyToken, async (req, res) => {
  const { channelId, roleId } = req.body;
  if (!channelId || !roleId)
    return res.status(400).json({ message: "Channel ID and Role ID required" });

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

  const channel = await getFromCacheOrFetch(guild.channels, channelId);
  if (!channel) return res.status(400).json({ message: "Channel not found" });
  if (!channel.isTextBased())
    return res
      .status(400)
      .json({ message: "Channel must be a text based channel" });

  const roleDelete = role.delete();
  const channelDelete = channel.delete();

  Promise.all([roleDelete, channelDelete])
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });
});

// Create a new team
router.post("/", verifyToken, async (req, res) => {
  const { name }: { name: string } = req.body;
  if (!name)
    return res.status(400).json({
      message: "Name required",
    });

  const guild = await getFromCacheOrFetch(
    client.guilds,
    process.env.DISCORD_SERVER_ID!
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  const everyone = guild.roles.cache.find(
    (role: any) => role.name === "@everyone"
  );
  if (!everyone)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  // Create role
  const role = await guild.roles.create({
    name,
    color: [Math.random() * 255, Math.random() * 255, Math.random() * 255],
  });

  // Create channel
  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: process.env.TEAMS_CAT_ID!,
    permissionOverwrites: [
      {
        id: role.id,
        allow: ["ViewChannel"],
      },
      {
        id: everyone.id,
        deny: ["ViewChannel"],
      },
    ],
  });

  return res.json({
    roleId: role.id,
    channelId: channel.id,
  });
});

// let i = 0;
// Change team name
router.patch("/", verifyToken, async (req, res) => {
  const {
    roleId,
    channelId,
    newName,
  }: { roleId: string; channelId: string; newName: string } = req.body;
  if (!roleId || !channelId || !newName)
    return res
      .status(400)
      .json({ message: "Role ID, Channel ID and New name required" });

  const guild = await getFromCacheOrFetch(
    client.guilds,
    process.env.DISCORD_SERVER_ID!
  );
  if (!guild) return res.status(500).json({ message: "Discord bot broke" });

  const role = await getFromCacheOrFetch(guild.roles, roleId);
  if (!role) return res.status(404).json({ message: "Role ID unkown" });

  const channel = await getFromCacheOrFetch(guild.channels, channelId);
  if (!channel?.isTextBased())
    return res.sendStatus(404).json({ message: "Channel ID unkown" });

  // i++;
  // const localId = i.toString();
  // console.log(`Created promise id:${localId}`);
  // const t1 = Date.now();
  const changeRoleName = role.setName(newName);
  const changeChannelName = (channel as discordjs.TextChannel).setName(newName);

  Promise.all([changeRoleName, changeChannelName])
    .then(() => {
      // const t2 = Date.now();
      // console.log(
      //   `Resolved promise id:${localId} in ${(t2 - t1) / 1000} seconds`
      // );
      return res.sendStatus(200);
    })
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });
});

export default router;
