# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files from Backend
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

# Install dependencies
WORKDIR /app/backend
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY backend/src ./src

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only necessary files from builder
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
