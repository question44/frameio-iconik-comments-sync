FROM node:22.12.0

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY src ./src
COPY tsconfig.json ./
COPY .env ./

CMD ["npm", "start"]
