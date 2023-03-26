FROM node:16
RUN npm run register
WORKDIR /usr
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
RUN npm install
COPY . ./src
RUN npm run build

## this is stage two , where the app actually runs
FROM node:16
WORKDIR /usr
COPY package*.json ./
RUN npm install --only=production
COPY --from=0 /usr/dist .
COPY --from=0 /usr/.env .
CMD ["node","index.js"]