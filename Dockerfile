# ── Stage 1: Compilación TypeScript ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ── Stage 2: Runtime de producción ───────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist      ./dist
COPY --from=builder /app/api       ./api
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/index.html ./index.html

EXPOSE 3000

CMD ["node", "server.js"]
