FROM node:16
WORKDIR /usr
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY prisma ./prisma
RUN npm install
COPY . ./src
RUN npx prisma migrate deploy
RUN npx prisma generate
RUN npx prisma db seed
RUN npm run build

## this is stage two , where the app actually runs
FROM node:16
WORKDIR /usr
COPY package*.json ./
RUN npm install --only=production
COPY --from=0 /usr/dist/src .
COPY --from=0 /usr/prisma ./prisma
COPY --from=0 /usr/.env .
RUN npx prisma generate
CMD ["node","index.js"]