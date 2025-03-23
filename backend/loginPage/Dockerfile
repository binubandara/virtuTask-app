# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy entire project
COPY . .

# Expose port 8080 (Cloud Run default)
EXPOSE 5001

# Modify your server.js to listen on the port from environment
CMD ["sh", "-c", "PORT=${PORT:-5001} node server.js"]