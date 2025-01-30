FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --only=production

COPY . .

# Expose the port your application listens on
EXPOSE 8080

# Add this to see what's in your /app directory
RUN ls -la /app

# Add this to check if node and npm are working
RUN node -v && npm -v

# Use the CMD defined in your original Dockerfile
CMD ["node", "server.js"]