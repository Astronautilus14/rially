import discordjs from "discord.js";

export default async function help(
  interaction: discordjs.ChatInputCommandInteraction
) {
  await interaction.reply(
    `Check out the current standing at ${process.env.WEBSITE_URL}/leaderboard`
  );
}
