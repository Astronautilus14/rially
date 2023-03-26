FROM node:16

RUN npm run build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./dist .

COPY .env .

RUN npx prisma migrate deploy

CMD [ "node", "index.js" ]