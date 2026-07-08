# Stage 1: Build the frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
ENV NODE_ENV=development
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build and run the backend
FROM node:20-slim
WORKDIR /app

COPY backend/package*.json ./backend/
ENV NODE_ENV=development
RUN cd backend && npm ci

# Copy backend source
COPY backend/ ./backend/
# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
RUN npm run build
RUN npm prune --production

# Create directory for SQLite persistent database
RUN mkdir -p /app/backend/data

ENV PORT=3100
ENV NODE_ENV=production

EXPOSE 3100

CMD ["npm", "start"]
