# Dockerfile para Render.com
# Este Dockerfile está na raiz para que o Render possa encontrá-lo
# Ele referencia o diretório backend/

FROM node:20-alpine AS builder

# Install OpenSSL required by Prisma
RUN apk update && apk add --no-cache openssl

WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
# Using npm install instead of npm ci because package-lock.json may not exist
RUN npm install --include=dev

# Copy source code from backend
COPY backend/ .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init, curl, and OpenSSL for Prisma
RUN apk update && apk add --no-cache dumb-init curl openssl

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install production dependencies + tsx for seed execution
RUN npm install --omit=dev && npm install tsx --save-dev && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy seed file for runtime execution
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts

# Create directory for database with proper permissions
RUN mkdir -p /app/data && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server with migration check and seed (to ensure master user exists)
# O seed garante que o usuário master sempre exista em produção
CMD ["sh", "-c", "npx prisma migrate deploy && (npx tsx prisma/seed.ts || echo 'Seed executado ou usuário master já existe') && node dist/server.js"]
