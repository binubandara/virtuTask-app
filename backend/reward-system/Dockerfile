# Use official Node.js 20 image
FROM node:20.17.0-alpine

# Create app directory
WORKDIR /usr/src/reward-system

# Accept port as build argument
ARG PORT=5006

# Set environment variables
ENV PORT=${PORT} \
    NODE_ENV=production

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD wget -q -O- http://localhost:${PORT}/health || exit 1

# Command to run the application
CMD ["npm", "start"]