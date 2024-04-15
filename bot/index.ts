import discordjs, { GatewayIntentBits } from "discord.js";
// import dotenv from "dotenv";
import assert from "assert";
import express from "express";
import cors from "cors";

import register from "./commands/register";
import help from "./commands/help";
import leaderboard from "./commands/leaderboard";
import submission from "./commands/submission";

import teamsRouter from "./routes/teams";
import gradeRouter from "./routes/grade";
import memberRouter from "./routes/member";
import axios from "axios";
import getFromCacheOrFetch from "./utils/getFromCacheOrFetch";

// dotenv.config();
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

export const client = new discordjs.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildModeration,
  ],
});

client.on("guildMemberAdd", async (guildMember) => {
  // Check if the user is already in the database
  console.log(guildMember.id);
  const res = await axios.get(
    `${process.env.API_URL}/teams/discord/${guildMember.id}`,
    {
      headers: {
        Authorization: process.env.API_KEY!,
      },
      validateStatus: (status) => {
        return (status >= 200 && status < 300) || status === 404;
      },
    }
  );

  if (res.status === 404) {
    return await register(guildMember);
  }

  const user: {
    id: number;
    discordId: string;
    username: string;
    Team?: {
      id: number;
      name: string;
      channelId: string;
      roleId: string;
    };
  } = res.data.user;

  // Give the user their username
  await guildMember.setNickname(user.username);

  // Give the user their team role
  if (user.Team) {
    const role = await getFromCacheOrFetch(
      guildMember.guild.roles,
      user.Team.roleId
    );
    await guildMember.roles.add(role);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case "register":
      await register(interaction.user, interaction);
      break;
    case "help":
      await help(interaction);
      break;
    case "submission":
      await submission(interaction);
      break;
    case "leaderboard":
      await leaderboard(interaction);
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

app.use("/teams", teamsRouter);
app.use("/member", memberRouter);
app.use("/grade", gradeRouter);

async function run() {
  await client.login(process.env.DISCORD_TOKEN);

  const port = process.env.PORT ?? 8081;
  app.listen(port);
  console.log(`Listening on port ${port}...`);
}

run();
