# 1. Base builder image
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# 2. Production runner image (Lightweight standalone, ~150MB)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone server and static assets directly from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Backup initial uploads so we can seed the volume on first start
RUN cp -r /app/public/uploads /app/_initial_uploads 2>/dev/null || mkdir -p /app/_initial_uploads

# Create entrypoint script to seed volume with initial uploads and start standalone server
RUN printf '#!/bin/sh\n\
if [ -d /app/_initial_uploads ] && [ "$(ls -A /app/_initial_uploads 2>/dev/null)" ]; then\n\
  cp -rn /app/_initial_uploads/* /app/public/uploads/ 2>/dev/null || true\n\
fi\n\
exec node server.js\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
