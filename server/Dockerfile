FROM node:12-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install canvas
RUN npm install 

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]