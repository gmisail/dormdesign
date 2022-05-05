# First build the files
FROM node:alpine AS builder

WORKDIR /app

# copyies package-lock.json and package.json
COPY package*.json ./

# install dependencies (excluding devDependencies)
RUN npm ci --production && npm cache clean --force

# copy everything over to environment
COPY . .

RUN npm run build

# Now actually serve the built files
FROM node:alpine
WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy files over from builder
COPY --from=builder /app/build ./build

RUN chown node:node ./
USER node

CMD ["serve", "-s", "build", "-l", "3000"]

