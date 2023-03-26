FROM node:16
WORKDIR /usr
COPY package.json ./
COPY tsconfig.json ./
COPY .env ./
COPY prisma ./
COPY . ./src
RUN ls -a
RUN npm install
RUN npx prisma migrate deploy
RUN npm run build

## this is stage two , where the app actually runs
FROM node:16
WORKDIR /usr
COPY package.json ./
RUN npm install --only=production
COPY --from=0 /usr/dist .
CMD ["node","index.js"]