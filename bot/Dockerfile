FROM node:16

RUN npm run register

RUN npm run build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./dist .

COPY .env .

CMD [ "node", "index.js" ]