FROM node:16

WORKDIR /app

RUN npm run build

COPY package*.json ./

RUN npm install

COPY ./dist .

COPY .env .

RUN npx prisma migrate deploy

CMD [ "node", "index.js" ]