FROM node:14-slim

WORKDIR /usr/src/

COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

EXPOSE 8000

CMD ["node", "bin/index.js"]
