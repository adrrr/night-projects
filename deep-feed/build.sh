#!/bin/bash
# Build Deep Feed: bundle ES modules into a single index.html for production
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check for esbuild
if ! command -v npx &> /dev/null; then
  echo "Error: npx not found. Install Node.js first."
  exit 1
fi

echo "Bundling JS modules..."
npx esbuild src/main.js --bundle --format=iife --minify --outfile=dist/bundle.js

echo "Building index.html..."
mkdir -p dist

# Extract CSS from dev.html (between <style> and </style>)
CSS=$(sed -n '/<style>/,/<\/style>/p' dev.html | sed '1d;$d')

# Extract HTML body (between <body> and the script tag)
BODY=$(sed -n '/<body>/,/<script/p' dev.html | sed '1d;$d')

cat > dist/index.html << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Deep Feed</title>
<style>
${CSS}
</style>
</head>
<body>
${BODY}
<script>
$(cat dist/bundle.js)
</script>
</body>
</html>
HTMLEOF

rm dist/bundle.js
echo "Built dist/index.html ($(wc -c < dist/index.html | tr -d ' ') bytes)"
