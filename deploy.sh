#!/bin/bash

# Offerzonline 1-Command Server Deployer
set -e

echo "🚀 [1/3] Pulling latest code from git..."
git pull

echo "📦 [2/3] Building optimized Next.js app image..."
docker compose build app

echo "🔄 [3/3] Restarting application container..."
docker compose up -d app

echo "✅ [SUCCESS] App deployed and running smoothly on https://offerzonline.hoztels.in"
