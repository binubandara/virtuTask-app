# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy entire project
COPY . .

# Expose port
EXPOSE 5001

# Command to start the server
CMD ["node", "server.js"]