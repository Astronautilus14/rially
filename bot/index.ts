import discordjs, { ChannelType, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import assert from "assert";
import express from "express";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import register from "./commands/register";
import help from "./commands/help";
import submission from "./commands/submission";

dotenv.config();
assert.notEqual(process.env.DISCORD_TOKEN, undefined);
assert.notEqual(process.env.DISCORD_SERVER_ID, undefined);
assert.notEqual(process.env.API_URL, undefined);
assert.notEqual(process.env.API_KEY, undefined);
assert.notEqual(process.env.WEBSITE_URL, undefined);
assert.notEqual(process.env.LINK_DISCORD_SECRET, undefined);
assert.notEqual(process.env.TEAMS_CAT_ID, undefined);
assert.notEqual(process.env.LOCATION_1_ID, undefined);
assert.notEqual(process.env.LOCATION_2_ID, undefined);
assert.notEqual(process.env.LOCATION_3_ID, undefined);

// BOT

const client = new discordjs.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("guildMemberAdd", register);

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case "register":
      register(interaction.user);
      break;
    case "help":
      help(interaction);
      break;
    case "submission":
      submission(interaction);
      break;
  }
});

client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user?.tag}`);
});

// API
const app = express();
app.use(cors());
app.use(express.json());

function verifyToken(req: Request, res: Response, next: NextFunction) {
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

app.post("/teams", verifyToken, async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({
      message: "Name required",
    });

  const guild = client.guilds.cache.find(
    (guild) => guild.id === process.env.DISCORD_SERVER_ID
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  const everyone = guild.roles.cache.find((role) => role.name === "@everyone");
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

app.post("/teams/member", verifyToken, async (req, res) => {
  const { roleId, userId }: { roleId: string; userId: string } = req.body;
  if (!roleId || !userId)
    return res.status(400).json({
      message: "Role ID and User ID are required",
    });

  const guild = client.guilds.cache.find(
    (guild) => guild.id === process.env.DISCORD_SERVER_ID
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  let role = guild.roles.cache.find((role) => role.id === roleId);
  if (!role) role = (await guild.roles.fetch(roleId)) ?? undefined;
  if (!role)
    return res.status(400).json({
      message: "Role not found",
    });

  let user = guild.members.cache.find((member) => member.id === userId);
  if (!user) user = await guild.members.fetch(userId);
  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  await user.roles.remove(user.roles.cache);
  await user.roles.add(role);
  return res.sendStatus(200);
});

app.post("/grade", verifyToken, async (req, res) => {
  const {
    roleId,
    channelId,
    type,
    number,
    location,
    grading,
  }: {
    roleId?: string;
    channelId: string;
    type: string;
    number?: number;
    location?: number;
    grading: number;
  } = req.body;
  if (!roleId || !channelId || !type || !grading)
    return res.status(400).json({
      message: "Role ID, Channel ID, Type and Grading are required",
    });

  const guild = client.guilds.cache.find(
    (guild) => guild.id === process.env.DISCORD_SERVER_ID
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  let channel = guild.channels.cache.find((channel) => channel.id == channelId);
  if (!channel) channel = (await guild.channels.fetch(channelId)) ?? undefined;
  if (!channel?.isTextBased())
    return res.status(400).json({
      message: "Channel not found",
    });
  channel.send(
    `Your ${type} submission ${
      number ? "number " + number : ""
    } has been graded with ${grading} point${grading > 1 ? "s" : ""}!`
  );

  if (type !== "puzzle") return res.sendStatus(200);

  let role = guild.roles.cache.find((role) => role.id == roleId);
  if (!role) role = (await guild.roles.fetch(roleId)) ?? undefined;
  if (!role)
    return res.status(400).json({
      message: "Role not found",
    });

  if (!location)
    return res.status(400).json({
      message: "Location required",
    });
  if (location !== 1 && location !== 2 && location !== 3)
    return res.status(400).json({
      message: "Location must be 1, 2 or 3",
    });
  const puzzleChannelId = process.env[`LOCATION_${location}_ID`];
  if (!puzzleChannelId) return res.sendStatus(500);

  let puzzleChannel = guild.channels.cache.find(
    (channel) => channel.id == puzzleChannelId
  );
  if (!puzzleChannel)
    puzzleChannel = (await guild.channels.fetch(puzzleChannelId)) ?? undefined;
  if (!puzzleChannel?.isTextBased()) return res.sendStatus(500);
  puzzleChannel = puzzleChannel as discordjs.TextChannel;

  puzzleChannel.permissionOverwrites.edit(role, { ViewChannel: true });
  return res.sendStatus(200);
});

app.delete("/teams", verifyToken, async (req, res) => {
  const { channelId, roleId } = req.body;
  if (!channelId || !roleId)
    return res.status(400).json({ message: "Channel ID and Role ID required" });

  const guild = client.guilds.cache.find(
    (guild) => guild.id === process.env.DISCORD_SERVER_ID
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  let role = guild.roles.cache.find((role) => role.id == roleId);
  if (!role) role = (await guild.roles.fetch(roleId)) ?? undefined;
  if (!role)
    return res.status(400).json({
      message: "Role not found",
    });

  let channel = guild.channels.cache.find((c) => c.id == channelId);
  if (!channel) channel = (await guild.channels.fetch(channelId)) ?? undefined;
  if (!channel?.isTextBased()) return res.sendStatus(500);
  channel = channel as discordjs.TextChannel;

  const roleDelete = role.delete();
  const channelDelete = channel.delete();

  Promise.all([roleDelete, channelDelete])
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });
});

app.delete("/teams/member", verifyToken, async (req, res) => {
  const { discordId } = req.body;
  if (!discordId)
    return res.status(400).json({ message: "Discord ID required" });

  const guild = client.guilds.cache.find(
    (guild) => guild.id === process.env.DISCORD_SERVER_ID
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  let user = guild.members.cache.find((m) => m.id == discordId);
  if (!user) user = (await guild.members.fetch(discordId)) ?? undefined;
  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  user.roles
    .remove(user.roles.cache)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });
});

async function run() {
  await client.login(process.env.DISCORD_TOKEN);
  const port = process.env.PORT ?? 8081;
  app.listen(port);
  console.log(`Listening on port ${port}...`);
}

run();
