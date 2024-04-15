FROM node:20 as base

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

RUN npm install


FROM base as dev

COPY . .


FROM dev as build

RUN npm run build


FROM base as prod

COPY --from=build /app/dist /app

RUN node registerCommands.js

CMD ["node", "index.js"]