# RIAlly bot + website + backend

You have to start 3 pocesses.

## Bot

```
cd backend
npm i
```

Ask Naut for all the things that go in your `.env`

```
npm run dev
```

## Backend

```
cd bot
npm i
```

I run a local database. Make sure you hava a database with a user that can do basically anything (this includes creating and deleting databases). Run this commanmd to create all the tables in your databae.

```
npx prisma migrate dev
```

Ask Naut for all the things that go in your `.env`

```
npm run dev
```

Slash commands are not like you might know discord bot commands. The layout of the command (i.e. name, arguments etc.) Is managed in `registerCommands.ts` This means if you want to change this you have to run. The command names (i.e. 'help') are hardcoded in `index.ts`, so if you make a new command or change a name, you have to change is there is well.

```
npm run register
```

### Old

**Create admin user**
To give yourself and your fellow committee members admin right, you can register yourself (once you openend the frontend) at /registerCommittee. Afterwards you have to make a team in the team table and set the isCommittee to 1 and set your teamId in the user table to the team you just created.

**Set variables**
In the variables table you have to make a row with the key field set to publicLeaderboard and the value field to 'true' or 'false'. You can also do this by loggin in at the frontend (at /login) and toggeling the switch at /leaderboard.

## Frontend

```
cd frontend
npm i
npm run dev
```
