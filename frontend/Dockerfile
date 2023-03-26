FROM node:16

WORKDIR /usr

COPY package*.json ./

COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm","run","preview"]