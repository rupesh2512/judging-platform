# FROM node:20-alpine

# RUN apk add --no-cache docker-cli

# WORKDIR /app

# RUN mkdir -p /app/temp

# COPY package*.json ./
# RUN npm install

# COPY . .

# CMD ["node", "src/index.js"]

FROM node:20-alpine

# Install Docker CLI so the worker can spawn containers
RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package.json .
RUN npm install

COPY src/ ./src/

CMD ["node", "src/index.js"]