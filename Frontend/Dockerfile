# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments for environment variables (can be overridden)
ARG PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
ARG VITE_API_URL=/api

# Set environment variables for build
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Copy static files if they exist
COPY --from=builder /app/static ./static

# Expose port (default for SvelteKit with adapter-node)
EXPOSE 80

# Set environment to production
ENV NODE_ENV=production
ENV PORT=80

# Start the application
CMD ["node", "build/index.js"]

# Expose port (default for SvelteKit with adapter-node)
EXPOSE 80

# Set environment to production
ENV NODE_ENV=production
ENV PORT=80

# Start the application
CMD ["node", "build/index.js"]

