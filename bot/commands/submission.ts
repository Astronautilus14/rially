import discordjs from "discord.js";
import axios from "axios";

export default function (interaction: discordjs.ChatInputCommandInteraction) {
  const type = interaction.options.getSubcommand();
  switch (type) {
    case "puzzle":
      {
        const fileLink = checkPhoto(interaction);
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

    case "challange":
      {
        const fileLink = checkPhoto(interaction);
        const number = interaction.options.getInteger("number", true);
        axios
          .post(
            `${process.env.API_URL!}/submissions/challange`,
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
        const media = interaction.options.getAttachment("media", true);
        if (
          !(
            media.contentType?.startsWith("image") ||
            media.contentType?.startsWith("video")
          )
        )
          return interaction.reply(
            "That media type is not supported. Please send a photo or video"
          );
        const fileLink = media.url;
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
              "Something went wrong. Please contact the committee"
            );
          });
      }
      break;
  }
}

function checkPhoto(interaction: discordjs.ChatInputCommandInteraction) {
  const media = interaction.options.getAttachment("photo", true);
  if (!media.contentType?.startsWith("image")) {
    interaction.reply("That media type is not supported. Please send a photo");
    return null;
  }
  return media.url;
}
