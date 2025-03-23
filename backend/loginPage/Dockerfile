# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["node", "servers.js"]