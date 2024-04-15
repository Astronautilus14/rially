# RIAlly bot + website + backend

Web app with frontend in [Svelte](https://svelte.dev/), backend in [Node.js](https://nodejs.org/en) with [Express](https://expressjs.com/) and Discord bot using [Node.js](https://nodejs.org/en) with [Discord.js v14](https://discord.js.org/) for the Inter-/Actief/ RIAlly.

## Set up Discord server for dev / prod

1. Create a Discord server. [Help](https://support.discord.com/hc/en-us/articles/204849977-How-do-I-create-a-server)
2. Create an empty catregory for teams
   a. Set the default privelage to not read channels
3. Create an category for locations
   a. Create a channel for start, location 1, location 2, location 3 and crazy88
   b. Set the default privalage to not read channels for location 1, 2, 3
4. Create a discord bot. [Help](https://discordpy.readthedocs.io/en/stable/discord.html)
   a. Set the permissions to TODO (use admin for now)

## Development

There are 2 ways to setup your development enviroment, you can choose either.

### Docker compose

Prerequisites: Docker installed

```
  cp frontend/src/lib/settings.json.example frontend/src/lib/settings.json
  cp .env.example .env
```

Put in your .env the required variables. You get these from the Discord developer portal or the Discord server.

```
  docker compose up
```

### Manual

You have to start 3 pocesses.
Prerequisites: Node.js and npm installed

#### Bot

```
cd bot
npm i
cp .env.example .env
```

Put in your .env the required variables. You get these from the Discord developer portal or the Discord server.

Start the bot by running

```
npm run dev
```

#### Backend

```
cd bot
npm i
cp .env.example .env
```

I run a local database. Make sure you hava a database with a user that can do basically anything (this includes creating and deleting databases). Run this commanmd to create all the tables in your databae.

```
npx prisma migrate dev
```

Fill in your database user, password and host in the database url in the `.env`

```
npm run dev
```

Slash commands are not like you might know discord bot commands. The layout of the command (i.e. name, arguments etc.) Is managed in `registerCommands.ts` This means if you want to change this you have to run. The command names (i.e. 'help') are hardcoded in `index.ts`, so if you make a new command or change a name, you have to change is there is well.

```
npm run register
```

#### Default admin user

```
npx prisma db seed
```

This will seed your DB. It makes a admin user and committee team. This way you can login with the username `admin` and password `adminadmin`. It is recommended to change the password to something more secure. You can do so at the settings page.

#### Frontend

```
cd frontend
npm i
cp src/lib/settings.json.example src/lib/settings.json
npm run dev
```
