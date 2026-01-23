# ============================================
# Ballot Builder - Express Backend Dockerfile
# ============================================
# This Dockerfile creates a containerized version of the Express API server.

# --------------------------------------------
# Stage 1: Build TypeScript
# --------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci

# Copy backend source code
COPY backend ./

# Build TypeScript to JavaScript
RUN npm run build

# --------------------------------------------
# Stage 2: Production dependencies
# --------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# --------------------------------------------
# Stage 3: Production runner
# --------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy production dependencies
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy compiled JavaScript from builder
COPY --from=builder --chown=expressjs:nodejs /app/backend/dist ./backend/dist

# Copy package.json for reference
COPY --chown=expressjs:nodejs backend/package.json ./backend/

# Switch to non-root user
USER expressjs

WORKDIR /app/backend

# Expose the API port
EXPOSE 3001

# Start the Express server
CMD ["node", "dist/index.js"]
