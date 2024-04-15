import { REST, Routes, SlashCommandBuilder } from "discord.js";
// import dotenv from "dotenv";
import assert from "assert";

// dotenv.config();

assert.notEqual(process.env.APPLICATION_ID, undefined);
assert.notEqual(process.env.DISCORD_TOKEN, undefined);

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("List of all comments"),

  new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register yourself"),

  new SlashCommandBuilder()
    .setName("submission")
    .setDescription("Make a submission")

    .addSubcommand((subcommand) =>
      subcommand
        .setName("puzzle")
        .setDescription("Submit a puzzle")
        .addAttachmentOption((option) =>
          option
            .setName("media")
            .setDescription("Photo or video of your submission")
            .setRequired(true)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName("challenge")
        .setDescription("Submit a location challenge")
        .addAttachmentOption((option) =>
          option
            .setName("media")
            .setDescription("Photo or video of your submission")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("number")
            .setDescription(
              "The number of the location challange as indicated at the pictures"
            )
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(50)
        )
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName("crazy88")
        .setDescription("Submit a crazy 88 task")
        .addAttachmentOption((option) =>
          option
            .setName("media")
            .setDescription("Photo or video of your submission")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("number")
            .setDescription(
              "The number of the task as indicated on the task list"
            )
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(88)
        )
    ),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Check out the current standings"),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID!), {
      body: commands,
    });
    console.log("✅ Succes! All slashcommands are registered");
  } catch (error) {
    console.error(error);
  }
})();
