# RIAlly bot + website + backend

You have to start 3 pocesses.

## Backend

```
cd backend
npm i
```

Ask Naut for all the things that go in your `.env`

```
npm run dev
```

## Bot

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

## Frontend

```
cd frontend
npm i
npm run dev
```
