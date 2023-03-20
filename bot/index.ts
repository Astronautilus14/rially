import discordjs, { GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import assert from "assert";
import jwt from "jsonwebtoken";

dotenv.config();
assert.notEqual(process.env.DISCORD_TOKEN, undefined);
//assert.notEqual(process.env.DISCORD_SERVER_ID, undefined);
assert.notEqual(process.env.API_URL, undefined);
assert.notEqual(process.env.WEBSITE_URL, undefined);
assert.notEqual(process.env.LINK_DISCORD_SECRET, undefined);

const client = new discordjs.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("guildMemberAdd", register);

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith("-")) return;
  const args = msg.content.slice(1).trim().split(/ +/);
  const cmdName = args.shift()?.toLowerCase();

  switch (cmdName) {
    case "register":
      console.log(2);
      register(msg.author);
      break;
  }
});

function register(user: discordjs.GuildMember | discordjs.User) {
  const token = jwt.sign(
    {
      discordId: user.id,
    },
    // @ts-expect-error
    process.env.LINK_DISCORD_SECRET,
    {
      expiresIn: "1h",
    }
  );

  user.send(
    `Welcome to the RIAlly discord server!
In order to do anything usefull you first have to register using the link below.\n
${process.env.WEBSITE_URL}/register?token=${token}`
  );
}

client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
