import discordjs from "discord.js";
import axios from "axios";

export default async function (
  interaction: discordjs.ChatInputCommandInteraction
) {
  const type = interaction.options.getSubcommand().toLowerCase();
  const fileLink = await checkMedia(interaction);
  if (!fileLink) return await interaction.reply("Media not found");

  switch (type) {
    case "puzzle":
      {
        axios
          .post(
            `${process.env.API_URL!}/submissions/puzzle`,
            {
              fileLink,
              discordId: interaction.user.id,
            },
            {
              headers: {
                Authorization: process.env.API_KEY!,
              },
            }
          )
          .then((res) => {
            return interaction.reply(res.data.message);
          })
          .catch((error) => {
            if (error.response.status < 500)
              return interaction.reply(error.response.data.message);
            console.error(error);
            interaction.reply(
              "Something went wrong. Please contact the committee"
            );
          });
      }
      break;

    case "challenge":
      {
        const number = interaction.options.getInteger("number", true);
        axios
          .post(
            `${process.env.API_URL!}/submissions/challenge`,
            {
              fileLink,
              number,
              discordId: interaction.user.id,
            },
            {
              headers: {
                Authorization: process.env.API_KEY!,
              },
            }
          )
          .then((res) => {
            return interaction.reply(res.data.message);
          })
          .catch((error) => {
            if (error.response.status < 500)
              return interaction.reply(error.response.data.message);
            console.error(error);
            interaction.reply(
              "Something went wrong. Please contact the committee"
            );
          });
      }
      break;

    case "crazy88":
      {
        const number = interaction.options.getInteger("number", true);

        axios
          .post(
            `${process.env.API_URL!}/submissions/crazy88`,
            {
              fileLink,
              number,
              discordId: interaction.user.id,
            },
            {
              headers: {
                Authorization: process.env.API_KEY!,
              },
            }
          )
          .then((res) => {
            return interaction.reply(res.data.message);
          })
          .catch((error) => {
            if (error.response.status < 500)
              return interaction.reply(error.response.data.message);
            console.error(error);
            interaction.reply(
              "Something went wrong. Please contact the committee."
            );
          });
      }
      break;
    default:
      interaction.reply(
        "Something went wrong. Type is unkown! Please contact the committee."
      );
  }
}

async function checkMedia(interaction: discordjs.ChatInputCommandInteraction) {
  let media: string | null = null;

  try {
    media = interaction.options.getAttachment("media", true)?.url;
  } catch (error) {
    console.error(error);
  }

  if (!media) {
    await interaction.reply(
      "Could not get the attachment! Please contact the committee."
    );
    return null;
  }

  return media;
}
