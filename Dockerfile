# ============================================
# Ballot Builder - Express Backend Dockerfile
# ============================================
# This Dockerfile creates a containerized version of the Express API server.

# --------------------------------------------
# Stage 1: Install dependencies
# --------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# --------------------------------------------
# Stage 2: Production runner
# --------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy dependencies
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy backend source code
COPY --chown=expressjs:nodejs backend ./backend

# Switch to non-root user
USER expressjs

WORKDIR /app/backend

# Expose the API port
EXPOSE 3001

# Start the Express server
CMD ["node", "src/index.js"]
