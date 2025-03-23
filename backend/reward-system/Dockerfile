# Stage 1: Install Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY rewards/package*.json ./
RUN npm install

# Stage 2: Build Application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY rewards/. ./
RUN npm run build # Or your build command if applicable

# Stage 3: Production Image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 
COPY rewards/.env ./
EXPOSE 5006
CMD ["node", "dist/server.js"] # Or your server entry point