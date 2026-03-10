FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/www/package.json ./apps/www/package.json
COPY packages/jsoncrack-react/package.json ./packages/jsoncrack-react/package.json
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
ARG SITE_URL=https://jsoncrack.com
ENV SITE_URL=$SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/www/node_modules ./apps/www/node_modules
COPY --from=deps /app/packages/jsoncrack-react/node_modules ./packages/jsoncrack-react/node_modules
COPY . .
RUN bun run build

# Stage 3: Production image
FROM docker.io/nginxinc/nginx-unprivileged:1-alpine AS production
COPY --from=builder --chown=nginx:nginx /app/apps/www/out /app
COPY apps/www/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
