import { Router } from "express";
import verifyToken from "../utils/verifyToken";
import { client } from "../index";
import getFromCacheOrFetch from "../utils/getFromCacheOrFetch";
import discordjs from "discord.js";

const router = Router();

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
    type: string;
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
  )
    return res.status(400).json({
      message: "Role ID, Channel ID, Type and Grading are required",
    });

  const guild = await getFromCacheOrFetch(
    client.guilds,
    process.env.DISCORD_SERVER_ID!
  );
  if (!guild)
    return res.status(500).json({
      message: "Discord bot broke",
    });

  const channel = await getFromCacheOrFetch(guild.channels, channelId);
  if (!channel?.isTextBased())
    return res.status(400).json({
      message: "Channel not found",
    });

  channel.send(
    // TODO dit nice maken voor rejection en puzzle submission
    `Your ${type === "challange" ? "challenge" : type} submission ${
      number ? `${number} ` : ""
    }${location ? `for location ${location} ` : ""}has been ${
      grading > 0
        ? `graded with ${grading} point${grading > 1 ? "s" : ""}! ${
            type === "puzzle"
              ? `You can now see the location challanges${
                  location !== 3 ? " and next puzzles " : " "
                }in the puzzle category.`
              : ""
          }`
        : "rejected"
    }`
  );

  if (type !== "puzzle" || grading <= 0) return res.sendStatus(200);

  if (!location)
    return res.status(400).json({
      message: "Location required",
    });

  const role = await getFromCacheOrFetch(guild.roles, roleId);
  if (!role)
    return res.status(404).json({
      message: "Role not found",
    });

  // TODO: Dit nice maken voor 4 locaties
  if (location !== 1 && location !== 2 && location !== 3)
    return res.status(400).json({
      message: "Location must be 1, 2 or 3",
    });
  const puzzleChannelId = process.env[`LOCATION_${location}_ID`];
  if (!puzzleChannelId) return res.sendStatus(500);

  let puzzleChannel = await getFromCacheOrFetch(
    guild.channels,
    puzzleChannelId
  );
  if (!puzzleChannel?.isTextBased()) return res.sendStatus(500);

  await (puzzleChannel as discordjs.TextChannel).permissionOverwrites
    .edit(role, { ViewChannel: true })
    .catch((error) => {
      console.error(error);
      return res.sendStatus(500);
    });

  return res.sendStatus(200);
});

export default router;
