#!/usr/bin/env bash
# This script is used by Render to build the application

# Exit on error
set -e

echo "Starting build process..."

# Remove package-lock.json to avoid inconsistencies
if [ -f package-lock.json ]; then
  echo "Removing existing package-lock.json"
  rm package-lock.json
fi

# Install all dependencies
echo "Installing dependencies..."
npm install

# Install specific dependencies needed for build
echo "Installing TypeScript and related packages..."
npm install --no-save \
  typescript@5.0.4 \
  @types/react@19.0.0 \
  @types/node@20.10.5 \
  @types/react-dom@19.0.0 \
  eslint@9.0.0 \
  eslint-config-next@15.3.1

echo "Installing Tailwind CSS and related packages..."
npm install --no-save \
  tailwindcss@3.3.5 \
  postcss@8.4.31 \
  autoprefixer@10.4.16

# Run the build
echo "Running Next.js build..."
npm run build

echo "Build completed successfully!" 