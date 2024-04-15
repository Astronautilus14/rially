FROM node:16 as base

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

COPY prisma ./prisma

RUN npm install

RUN npx prisma generate


FROM base as dev

COPY . .


FROM dev as build

RUN npm run build


FROM base as prod

COPY --from=build /app/dist /app

RUN node ./prisma/seed.js

CMD ["node", "index.js"]