FROM node:22-bullseye-slim AS builder

WORKDIR /app 

COPY package*json ./
RUN npm install

COPY . .
RUN npm run build
RUN npx prisma generate

# ---- Runtime Stage ----
  
FROM node:22-bullseye-slim
  
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD sh -c "npx prisma migrate deploy && node dist/app.js"