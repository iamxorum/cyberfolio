# Dependencies in their own stage: cached until package.json or the lockfile changes.
FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# Build. src/config is compiled in, so it must be in the build context.
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# Runtime: only the standalone server and static files, as a non-root user.
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]

