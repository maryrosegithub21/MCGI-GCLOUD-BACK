FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --only=production

COPY . .

# Expose the port your application listens on
EXPOSE 8080

# Use the CMD defined in your original Dockerfile
CMD ["node", "server.js"]