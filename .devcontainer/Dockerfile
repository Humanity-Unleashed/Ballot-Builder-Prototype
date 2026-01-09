# ============================================
# Ballot Builder - Dev Container Dockerfile
# ============================================
# This container provides a complete development environment
# for coding inside VS Code / Cursor.

FROM node:20-bullseye

# Install useful development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    less \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages for development
RUN npm install -g \
    nodemon \
    eslint \
    prettier \
    typescript \
    ts-node

# Set up workspace directory
WORKDIR /workspace

# The node user already exists in the base image
# Give it ownership of the workspace
RUN chown -R node:node /workspace

# Switch to non-root user
USER node

# Keep container running (VS Code will connect to it)
CMD ["sleep", "infinity"]
