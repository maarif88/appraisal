#!/bin/sh
set -eu
mkdir -p /app/backend/data
chown node:node /app/backend/data
find /app/backend/data -maxdepth 1 -type f -exec chown node:node {} +
exec gosu node:node node dist/server.js

