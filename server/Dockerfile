FROM node:14-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --production

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]