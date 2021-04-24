FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update \
    && apt-get install -qq build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

RUN npm install canvas
RUN npm install 

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]