import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const main = async () => {
  const createTeamAndUser = client.team
    .upsert({
      where: {
        name: "Committee",
      },
      update: {},
      create: {
        name: "Committee",
        isCommittee: true,
      },
    })
    .then(async (team) => {
      await client.user.upsert({
        where: {
          username: "admin",
        },
        update: {},
        create: {
          username: "admin",
          name: "admin",
          password:
            "$2a$10$4.XELKpp5ZO2hIu9owc3De.asEMnXlRYTlvqdqhRyFNE5EVh5YZ6C", // adminadmin
          teamId: team.id,
        },
      });
    });

  const setVariables = client.variables.upsert({
    where: {
      key: "publicLeaderboard",
    },
    update: {},
    create: {
      key: "publicLeaderboard",
      value: "true",
    },
  });

  await Promise.all([createTeamAndUser, setVariables]);
};

main()
  .then(async () => {
    await client.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await client.$disconnect();
    process.exit(1);
  });
