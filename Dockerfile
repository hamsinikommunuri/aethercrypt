# Multi-stage production container for AetherCrypt
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation if needed
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and code
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY server/ ./server/
COPY public/ ./public/

# Volume directory for persistent SQLite database
VOLUME /app/data

EXPOSE 3000

CMD ["node", "server/index.js"]
