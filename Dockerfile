FROM node:24-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Coolify can inject NODE_ENV=production or npm omit settings during builds.
# Vite is a build dependency and must still be installed in this stage.
RUN npm ci --include=dev
COPY frontend/ ./
RUN npm run build

FROM node:24-slim AS backend-builder
# Compile SQLite against the production Node ABI; keep build tools out of the runner.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
ENV NODE_ENV=development
COPY backend/package*.json ./
# TypeScript is required here; dev dependencies are pruned before the runner.
RUN npm ci --include=dev
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

FROM node:24-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends gosu && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./package.json
COPY --from=backend-builder /app/backend/data/crawled_database.json ./crawled_database.backup.json
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
RUN mkdir -p /app/backend/data && chown node:node /app/backend/data
COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod 755 /entrypoint.sh
ENV PORT=3100 NODE_ENV=production
EXPOSE 3100
ENTRYPOINT ["/entrypoint.sh"]
