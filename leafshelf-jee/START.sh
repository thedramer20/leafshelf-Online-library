#!/usr/bin/env bash
set -e

echo ""
echo "  🌿 LeafShelf — Starting up"
echo "  ========================="
echo ""

# 1. Build the React frontend
echo "  [1/2] Building React frontend..."
cd client
if [ ! -d node_modules ]; then
  echo "        Installing npm dependencies (one time)..."
  npm install
fi
npm run build
cd ..

echo ""
echo "  [2/2] Starting Jetty on http://localhost:8080"
echo ""
echo "  Open http://localhost:8080 once you see the LeafShelf banner."
echo "  Press Ctrl+C to stop."
echo ""

# 2. Start the embedded Jetty server
exec mvn jetty:run
