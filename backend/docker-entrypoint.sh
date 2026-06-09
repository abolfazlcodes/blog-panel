#!/bin/sh
set -e

# Resolve Docker/Swarm secrets: when VAR_FILE points to a file, export VAR from
# it. Done in the shell so `prisma migrate deploy` (below) sees DATABASE_URL too.
for var in JWT_SECRET_KEY DATABASE_URL; do
  file=$(eval "printf '%s' \"\${${var}_FILE:-}\"")
  if [ -n "$file" ] && [ -f "$file" ]; then
    export "$var=$(cat "$file")"
  fi
done

echo "→ Applying database migrations (prisma migrate deploy)..."
npx prisma migrate deploy

echo "→ Starting Notiq API..."
exec node dist/app.js
