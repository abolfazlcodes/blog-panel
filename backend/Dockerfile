# ---- Build stage ----
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

# ---- Runtime stage ----
FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Carry over installed deps (incl. the generated Prisma client and the Prisma
# CLI used by `migrate deploy`), the compiled app, the schema/migrations, the
# manifest, and the entrypoint.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# Uploads are written to dist/src/uploads — make it writable (persist via a
# volume in production) and drop to the unprivileged node user.
RUN chmod +x ./docker-entrypoint.sh \
  && mkdir -p /app/dist/src/uploads \
  && chown -R node:node /app

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
