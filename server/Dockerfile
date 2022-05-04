FROM node:14-slim as compilation

COPY package.json ./

RUN npm install

# Copy source
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Build dist
RUN npm run build

FROM node:14-slim

# Copy node modules and build directory
COPY --from=compilation ./node_modules ./node_modules
COPY --from=compilation /bin /bin

EXPOSE 8000

CMD ["node", "bin/index.js"]

