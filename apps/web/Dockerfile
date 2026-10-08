# Perfil `demo` de docker-compose.yml. Se construye desde la raíz del monorepo.
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .
# La URL de la API la usa el navegador, por eso apunta al puerto publicado en el equipo.
ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @utd/shared build && pnpm --filter @utd/web build

FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
