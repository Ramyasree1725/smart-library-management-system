# Production Dockerfile for Smart Library Management System
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm run install-all

# Copy application source
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 5000 3000

# Start command
CMD ["npm", "run", "dev"]
