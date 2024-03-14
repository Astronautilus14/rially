import { Router } from "express";
import verifyToken from "../utils/verifyToken";
import { client } from "../index";
import getFromCacheOrFetch from "../utils/getFromCacheOrFetch";
import discordjs from "discord.js";

const router = Router();

// Method to notify a team of a (re)grade
router.post("/", verifyToken, async (req, res) => {
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
    type: "PUZZLE" | "CHALLENGE" | "CRAZY88";
    number?: number;
    location?: number;
    grading: number;
  } = req.body;
  if (
    !roleId ||
    !channelId ||
    !type ||
    grading === null ||
    grading === undefined
  ) {
    return res.status(400).json({
      message: "Role ID, Channel ID, Type and Grading are required",
    });
  }

  // Get the correct guild (aka discod server)
  const guild = await getFromCacheOrFetch(
    client.guilds,
    process.env.DISCORD_SERVER_ID!
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  // Get the correct channel
  const channel = await getFromCacheOrFetch(guild.channels, channelId);
  if (!channel?.isTextBased())
    return res.status(400).json({
      message: "Channel not found",
    });

  // Send a message about their grade using this ridicilous oneliner
  await channel.send(
    `Your ${type.toLowerCase()} submission ${number ? `${number} ` : ""}${
      location ? `for location ${location} ` : ""
    }has been ${
      grading > 0
        ? `graded with ${grading} point${grading > 1 ? "s" : ""}! ${
            type === "PUZZLE"
              ? `You can now see the location challenges${
                  location !== 3 ? " and next puzzles " : " "
                }in the puzzle category.`
              : ""
          }`
        : "rejected"
    }`
  );

  // If the type was not puzzle or the puzzle got rejected return
  if (type !== "PUZZLE" || grading <= 0) return res.sendStatus(200);

  if (!location)
    return res.status(400).json({
      message: "Location required",
    });

  const role = await getFromCacheOrFetch(guild.roles, roleId);
  if (!role)
    return res.status(404).json({
      message: "Role not found",
    });

  // Find the channel id of the next location
  const puzzleChannelId = process.env[`LOCATION_${location}_ID`];
  if (!puzzleChannelId)
    return res.status(400).json({
      message:
        "It looks like you have already reached the end of this RIAlly! This means you have already reached the last location.",
    });

  let puzzleChannel = await getFromCacheOrFetch(
    guild.channels,
    puzzleChannelId
  );
  if (!puzzleChannel?.isTextBased()) return res.sendStatus(500);

  // Update the permission of the team for the next location channel
  await (puzzleChannel as discordjs.TextChannel).permissionOverwrites
    .edit(role, { ViewChannel: true })
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });

  return res.sendStatus(200);
});

export default router;
