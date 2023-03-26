FROM node:16

WORKDIR /usr

COPY package*.json ./

COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:16

WORKDIR /usr

COPY package*.json ./

RUN npm install --only=production

COPY --from=0 /usr/dist .

CMD ["npm","run","preview"]