# Stage 1: Install Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY task-session/package*.json ./
RUN npm install

# Stage 2: Build Application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY task-session/. ./
RUN npm run build # Or your build command if applicable

# Stage 3: Production Image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 
COPY task-session/.env ./
EXPOSE 5005
CMD ["node", "dist/server.js"] # Or your server entry point