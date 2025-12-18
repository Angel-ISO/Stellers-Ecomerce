FROM node:18-slim AS base

RUN apt-get update && apt-get install -y \
    dumb-init \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps

COPY package*.json ./

RUN npm ci && npm cache clean --force

FROM deps AS build

COPY . .

RUN npx prisma generate

RUN npm run build

FROM base AS production

RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nestjs

COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules

COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

COPY --chown=nestjs:nodejs healthcheck.js .

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
