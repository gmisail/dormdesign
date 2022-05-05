FROM node:14-slim as compilation
WORKDIR /usr/local/app

COPY package*.json ./

RUN npm install -g typescript
RUN npm ci --production && npm cache clean --force

# Copy source
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Build dist
RUN npm run build

FROM node:14-slim
WORKDIR /usr/local/app

# Copy node modules and build directory
COPY --from=compilation /usr/local/app/node_modules ./node_modules
COPY --from=compilation /usr/local/app/bin ./bin

RUN chown node:node ./
USER node

CMD ["node", "bin/index.js"]

