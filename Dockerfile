# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm build

# Stage 3: Web (small standalone image)
FROM node:20-alpine AS web
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy standalone build (small)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma files
COPY --from=builder /app/app/generated/prisma ./app/generated/prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# Stage 4: Production dependencies (pruned, used by worker)
FROM deps AS prod-deps
WORKDIR /app

RUN npm install -g pnpm
RUN rm -rf node_modules && npm pkg delete scripts.prepare && pnpm install --frozen-lockfile --prod --ignore-scripts

# Remove UI-only packages that are not needed by the worker.
# These are still listed in dependencies because the web app needs them, but
# the worker never imports them, so their symlinks can be safely removed.
RUN find /app/node_modules -maxdepth 1 -type d \( \
    -name 'next' -o \
    -name 'react' -o \
    -name 'react-dom' -o \
    -name 'react-day-picker' -o \
    -name 'react-dropzone' -o \
    -name 'react-hook-form' -o \
    -name 'react-hot-toast' -o \
    -name 'react-icons' -o \
    -name 'react-pdf' -o \
    -name 'react-select' -o \
    -name 'tailwind-merge' -o \
    -name 'tailwind-variants' -o \
    -name 'tailwindcss' -o \
    -name 'prettier' -o \
    -name '@img' \
  \) -exec rm -rf {} + \
  && find /app/node_modules/.pnpm -maxdepth 1 -type d \( \
    -name 'next@*' -o \
    -name '@next+*' -o \
    -name 'react@*' -o \
    -name 'react-dom@*' -o \
    -name 'react-day-picker@*' -o \
    -name 'react-dropzone@*' -o \
    -name 'react-hook-form@*' -o \
    -name 'react-hot-toast@*' -o \
    -name 'react-icons@*' -o \
    -name 'react-pdf@*' -o \
    -name 'react-select@*' -o \
    -name 'tailwind-merge@*' -o \
    -name 'tailwind-variants@*' -o \
    -name 'tailwindcss@*' -o \
    -name 'prettier@*' -o \
    -name '@img+*' \
  \) -exec rm -rf {} +

# Stage 5: Worker (small production image)
FROM node:20-alpine AS worker
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/app/generated/prisma ./app/generated/prisma
COPY --from=builder /app/prisma ./prisma
COPY scripts ./scripts
COPY lib ./lib
COPY services ./services
COPY tsconfig.json ./tsconfig.json

CMD ["npx", "tsx", "scripts/start-worker.ts"]