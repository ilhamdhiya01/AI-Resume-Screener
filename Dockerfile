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

# Stage 4: Production dependencies (for worker only)
FROM deps AS prod-deps
WORKDIR /app

RUN npm install -g pnpm

# Copy lockfile and a stripped package.json that only lists dependencies the
# worker actually imports. This avoids installing UI-only packages.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm pkg delete scripts.prepare \
    dependencies.next dependencies.react dependencies.react-dom \
    dependencies.react-day-picker dependencies.react-dropzone \
    dependencies.react-hook-form dependencies.react-hot-toast \
    dependencies.react-icons dependencies.react-pdf dependencies.react-select \
    dependencies.tailwind-merge dependencies.tailwind-variants \
    dependencies.@hookform/resolvers \
    dependencies.@marsidev/react-turnstile \
    dependencies.@tanstack/react-query \
    dependencies.@tanstack/react-query-devtools \
    dependencies.@wojtekmaj/react-hooks \
    dependencies.@auth/prisma-adapter dependencies.next-auth \
    dependencies.bcryptjs dependencies.classnames dependencies.date-fns \
    dependencies.nodemailer dependencies.zustand
RUN rm -rf node_modules pnpm-lock.yaml && pnpm install --prod --ignore-scripts

# Remove runtime files and engines that the worker does not need.
RUN find /app/node_modules -path '*/@prisma/client/runtime/*' -type f \( \
    -name '*.darwin*' -o \
    -name '*.windows*' -o \
    -name '*.debian*' -o \
    -name '*.rhel*' -o \
    -name '*.arm*' ! -name '*musl*' -o \
    -name '*.x64*' -o \
    -name '*.wasm*' \
  \) -delete 2>/dev/null || true
RUN rm -rf /app/node_modules/.pnpm/@prisma+studio-core@* \
  /app/node_modules/.pnpm/chart.js@* \
  /app/node_modules/.pnpm/react-dom@* \
  /app/node_modules/.pnpm/react@* \
  /app/node_modules/.pnpm/pdfjs-dist@* \
  /app/node_modules/.pnpm/@napi-rs+canvas@* \
  /app/node_modules/.pnpm/@electric-sql+pglite@* \
  /app/node_modules/.pnpm/@prisma+query-plan-executor@* \
  /app/node_modules/.pnpm/@prisma+dev@* \
  /app/node_modules/.pnpm/effect@* \
  /app/node_modules/.pnpm/@img+sharp-libvips-linuxmusl-arm64@* 2>/dev/null || true

# Stage 5: Worker (small production image)
FROM node:20-alpine AS worker
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=builder /app/app/generated/prisma ./app/generated/prisma
COPY --from=builder /app/prisma ./prisma
COPY scripts ./scripts
COPY lib ./lib
COPY services ./services
COPY const ./const
COPY tsconfig.json ./tsconfig.json

CMD ["npx", "tsx", "scripts/start-worker.ts"]