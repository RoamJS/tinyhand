#!/bin/sh
set -eu

npm ci --no-audit --no-fund
npm run build:roam

for file in extension.js extension.css README.md CHANGELOG.md; do
  if [ ! -s "$file" ]; then
    printf 'Missing or empty Roam Depot file: %s\n' "$file" >&2
    exit 1
  fi
done
