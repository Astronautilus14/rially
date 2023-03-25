import discordjs from "discord.js";
import jwt from "jsonwebtoken";

export default async function register(
  user: discordjs.GuildMember | discordjs.User,
  interaction?: discordjs.ChatInputCommandInteraction
) {
  const token = jwt.sign(
    {
      discordId: user.id,
    },
    process.env.LINK_DISCORD_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  await user.send(
    `Welcome to the RIAlly discord server!
In order to do anything usefull you first have to register using the link below.\n
${process.env.WEBSITE_URL}/register?token=${token}`
  );

  if (interaction) {
    await interaction.reply("I slid in your DM");
  }
}
