import discordjs from "discord.js";

export default async function help(
  interaction: discordjs.ChatInputCommandInteraction
) {
  await interaction.reply(
    "**All commands**\n`/register`\nRegister yourself.\n\n`/submit puzzle <media>`\nSubmit a photo or video to proof you are at the right location. This will unlock the next puzzle and location challanges.\n\n`/submit challenge <media> <number>`\nSubmit a photo or video to proof you did a location challenge.\n\n`/submit crazy88 <media> <number>`\nSubmit a photo or video to proof you did a crazy 88 task\n\n`/leaderboard`\nCheck out the current standings.\n\nContact the committee if you need any help!"
  );
}
