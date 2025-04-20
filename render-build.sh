#!/usr/bin/env bash
# This script is used by Render to build the application

# Exit on error
set -e

# Install dependencies
npm ci

# Install TypeScript and ESLint explicitly
npm install typescript@5 @types/react@19 @types/node@20 eslint@9 --no-save

# Install Tailwind and its dependencies
npm install tailwindcss@3.3.5 postcss@8.4.31 autoprefixer@10.4.16 --no-save

# Run the build
npm run build

echo "Build completed successfully!" 