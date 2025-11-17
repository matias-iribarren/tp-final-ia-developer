# 1. Dependency installation stage
# Use a specific Node.js version for reproducibility
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm, the package manager used in the project
RUN npm install -g pnpm

# Copy package manager files to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies with --frozen-lockfile to ensure exact versions are used
RUN pnpm install --frozen-lockfile

# 2. Builder stage
# This stage builds the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy installed dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .

# Build the Next.js application for production
# The project is configured to ignore TS/ESLint errors on build
RUN pnpm build

# 3. Runner stage
# This is the final, lightweight image that will run the application
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production to optimize Next.js performance
ENV NODE_ENV production

# Install pnpm
RUN npm install -g pnpm

# Copy only the necessary production assets from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Expose the port the Next.js application runs on
EXPOSE 3000

# The command to start the production server
CMD ["pnpm", "start"]
