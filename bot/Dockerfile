FROM node:16

WORKDIR /app

RUN npm run register

RUN npm run build

COPY package*.json ./

RUN npm install

COPY ./dist .

COPY .env .

CMD [ "node", "index.js" ]