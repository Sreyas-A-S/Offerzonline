# Base image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy full application code
COPY . .

# Build Next.js
RUN npm run build

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built application and required production node_modules
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Backup initial uploads so we can seed the volume on first start
RUN cp -r /app/public/uploads /app/_initial_uploads 2>/dev/null || mkdir -p /app/_initial_uploads

# Create entrypoint script to seed volume with initial uploads
RUN printf '#!/bin/sh\n\
# On first run, seed the volume-mounted uploads dir with built-in images\n\
if [ -d /app/_initial_uploads ] && [ "$(ls -A /app/_initial_uploads 2>/dev/null)" ]; then\n\
  cp -rn /app/_initial_uploads/* /app/public/uploads/ 2>/dev/null || true\n\
fi\n\
exec npm start\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
