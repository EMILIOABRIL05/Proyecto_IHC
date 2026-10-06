# Perfil `demo` de docker-compose.yml. Se construye desde la raíz del monorepo:
#   docker compose --profile demo up --build
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @utd/shared build && pnpm --filter @utd/api build

FROM node:24-slim
RUN corepack enable
ENV NODE_ENV=production
WORKDIR /repo
# Se conserva el monorepo completo: el contenedor necesita la CLI de Prisma para aplicar migraciones.
COPY --from=build /repo /repo
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @utd/api db:deploy && node apps/api/dist/main.js"]
