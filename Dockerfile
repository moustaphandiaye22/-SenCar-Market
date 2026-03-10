# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy all backend config files needed for build
COPY Backend/package*.json ./Backend/
COPY Backend/tsconfig*.json ./Backend/
COPY Backend/nest-cli.json ./Backend/
COPY Backend/prisma ./Backend/prisma/

# Install dependencies
WORKDIR /app/Backend
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY Backend/src ./src

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy ALL node_modules from builder (including .prisma)
COPY --from=builder /app/Backend/node_modules ./node_modules
COPY --from=builder /app/Backend/dist ./dist
COPY --from=builder /app/Backend/package*.json ./
COPY --from=builder /app/Backend/prisma ./prisma

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
