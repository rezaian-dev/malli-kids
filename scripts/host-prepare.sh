#!/bin/bash
set -e
echo "🚀 Host prepare: building locally (no DB needed thanks to build-safe)..."
# quick lint check
# npm run lint
# Build with production env (uses .env.host if exists, else fallback)
if [ -f .env.host ]; then
  echo "Using .env.host for build"
  cp .env.host .env
fi
# Build (DB-safe, will succeed even without Mongo)
npm run build

echo "📦 Creating deploy zip for cPanel (without node_modules)..."
rm -f malli-kids-host.zip
zip -r malli-kids-host.zip \
  .next \
  public \
  package.json \
  package-lock.json \
  next.config.ts \
  next-env.d.ts \
  .npmrc \
  src \
  -x "node_modules/*" ".git/*" "*.log" ".next/cache/*"

echo "✅ Ready: malli-kids-host.zip"
echo "   Upload this zip to /home/mallikid/malli-kids on cPanel File Manager and Extract"
echo "   Then in cPanel NodeJS: npm install --omit=dev --ignore-scripts (or with PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1)"
echo "   Env vars: MONGODB_URI=mongodb://mallikid_mrezaian:...@localhost:27017/mallikid_mallkidsDB?authSource=mallikid_mallkidsDB"
echo "            BETTER_AUTH_URL=https://mallikids.ir"
echo "            NODE_ENV=production"
ls -lh malli-kids-host.zip
