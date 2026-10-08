# Arquitectura (C4 niveles 1–2) y despliegue

## Nivel 1 — Contexto

```mermaid
flowchart LR
  inv["Persona investigadora / moderadora / de mejoras UX"]
  sys["Usability Test Dashboard<br/>(aplicación web)"]
  gem["Google Gemini API<br/>(servicio externo)"]
  part["Participante de la prueba<br/>(no usa el sistema)"]

  inv -- "planifica, registra, analiza, aprueba, planifica mejoras" --> sys
  part -. "es observado; responde SUS en papel o en la pantalla de quien modera" .-> inv
  sys -- "observaciones anonimizadas (JSON)" --> gem
  gem -- "propuestas JSON (borradores)" --> sys
```

## Nivel 2 — Contenedores

```mermaid
flowchart TB
  subgraph browser["Navegador"]
    web["Web SPA<br/>React + Vite + TS<br/>apps/web"]
  end
  subgraph server["Servidor (Docker Compose o local)"]
    api["API REST<br/>NestJS + TS<br/>apps/api"]
    db[("PostgreSQL 17<br/>Prisma 7")]
    files[["UPLOAD_DIR<br/>evidencias"]]
  end
  shared["packages/shared<br/>Zod + dominio puro"]
  gem["Gemini API"]
  mock["MockProvider"]

  web -- "HTTPS JSON /api/v1" --> api
  api --> db
  api --> files
  api -- "AiProvider" --> gem
  api -- "AiProvider (sin clave / tests)" --> mock
  shared -. "importado por" .-> web
  shared -. "importado por" .-> api
```

## Módulos de la API

```mermaid
flowchart LR
  plans --> sessions
  sessions --> evidence
  sessions --> metrics
  sessions --> ai
  ai --> findings
  findings --> improvements
  improvements --> sprints
  metrics --> reports
  findings --> reports
  improvements --> reports
  health
```

## Despliegue (perfil demo)

```mermaid
flowchart LR
  subgraph compose["docker compose --profile demo"]
    nginx["web<br/>nginx sirve el build de Vite<br/>:8080"]
    apic["api<br/>node dist/main.js<br/>prisma migrate deploy al iniciar<br/>:3000"]
    pg[("db<br/>postgres:17<br/>volumen pgdata<br/>:5432")]
    vol[["volumen uploads"]]
  end
  user["Navegador"] --> nginx
  nginx -- "/api/v1" --> apic
  apic --> pg
  apic --> vol
  apic -. "HTTPS" .-> gemini["Gemini API"]
```

En desarrollo solo corren `db` (y `db_test` para e2e) en Docker; API y web corren con `pnpm dev`.
