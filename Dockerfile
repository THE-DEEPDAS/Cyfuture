# Multi-stage build for optimized Docker image

# Base stage for dependencies
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=development

# Backend build stage
FROM base AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend ./

# Frontend build stage
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Final stage
FROM base
WORKDIR /app

# Copy built backend
COPY --from=backend-build /app/backend ./backend

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./backend/public

# Set working directory to backend for starting the app
WORKDIR /app/backend

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]
