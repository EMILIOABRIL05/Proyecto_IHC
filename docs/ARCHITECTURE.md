# Arquitectura técnica

Decisión del stack: [ADR-0001](adr/0001-stack.md). Diagramas C4 y de despliegue:
[`diagrams/01-arquitectura.md`](diagrams/01-arquitectura.md).

## 1. Visión general

```
[Navegador] React SPA (apps/web)  ──HTTP JSON /api/v1──►  [API NestJS] (apps/api)
                                                            ├─► PostgreSQL 17 (Docker)  vía Prisma 7
                                                            ├─► UPLOAD_DIR (disco local, evidencias)
                                                            └─► AiProvider ─► Gemini (@google/genai)
                                                                          └─► MockProvider (sin clave / tests)
packages/shared  ←── usado por web y api: esquemas Zod, tipos, constantes, funciones de dominio puras
```

Principios:
1. **TypeScript de punta a punta** y un único contrato: los esquemas Zod de `packages/shared` validan
   la entrada de la API, tipan el frontend y definen la salida esperada de la IA.
2. **Lógica de negocio pura en `shared/domain`** (métricas, comparación, SUS, reglas de estado,
   capacidad, prioridad, Markdown del informe). Sin dependencias de BD ni de React → se prueba con TDD
   y la usan la API y la web.
3. **La API es la autoridad**: valida todas las reglas RN; la web las anticipa para la usabilidad.
4. **Un módulo por área funcional**, con un dueño (ver `TEAM.md` §3).

## 2. Stack y versiones

Versiones verificadas el 6-oct-2026. DI-04 instala versiones exactas y se commitea `pnpm-lock.yaml`.

| Área | Tecnología | Versión mayor | Nota |
|---|---|---|---|
| Runtime | Node.js | 24 LTS | `.nvmrc` |
| Paquetes | pnpm (vía corepack) | 10+ | workspaces |
| Lenguaje | TypeScript | **6.0.x** | **No usar TS 7** todavía: `typescript-eslint` solo soporta `<6.1` |
| Validación | Zod | 4 | `z.toJSONSchema()` para la IA |
| Frontend | React | 19 | |
| Build web | Vite | 8 | |
| Estilos | Tailwind CSS | 4 | |
| Componentes | shadcn/ui (Radix) | — | se copian en `components/ui` |
| Rutas | React Router | 8 | uso declarativo como SPA (sin SSR) |
| Datos cliente | TanStack Query | 5 | |
| Formularios | React Hook Form + `@hookform/resolvers/zod` | 7 | |
| Gráficos | Recharts | 3 | siempre con tabla alternativa |
| Kanban | dnd-kit | 6 | con sensor de teclado |
| PDF | `@react-pdf/renderer` | 4 | se genera en el navegador |
| Backend | NestJS | 12 | Node ≥ 20 |
| ORM | Prisma + `@prisma/adapter-pg` | **7.x** | la URL va en `prisma.config.ts` |
| BD | PostgreSQL | 17 | Docker |
| IA | `@google/genai` | 2 | modelo por variable `GEMINI_MODEL` |
| Archivos | Multer (Nest) + `file-type` | — | verificación por bytes |
| Docs API | `@nestjs/swagger` | — | `/api/docs` |
| Pruebas | Vitest (shared, web), Jest o Vitest (api), Testing Library, Playwright, axe-core | — | ver `TESTING.md` |
| Calidad | ESLint 9/10 (flat) + typescript-eslint + jsx-a11y, Prettier, Husky, lint-staged, commitlint | — | |

Si una versión mayor nueva rompe compatibilidad, se fija la anterior y se anota en el ADR-0001.

## 3. Estructura de carpetas

```
Proyecto_IHC/
├─ AGENTS.md  CLAUDE.md  GEMINI.md  README.md
├─ apps/
│  ├─ web/
│  │  ├─ src/
│  │  │  ├─ app/                  # router.tsx, providers.tsx, layout/ (AppShell, SideNav, TopBar)
│  │  │  ├─ features/
│  │  │  │  ├─ plans/             # HU-01, HU-03 (pages/, components/, hooks/, api.ts, *.test.tsx)
│  │  │  │  ├─ sessions/          # HU-02, HU-03, HU-13
│  │  │  │  ├─ results/           # HU-05, HU-12
│  │  │  │  ├─ ai-review/         # HU-06, HU-07
│  │  │  │  ├─ improvements/      # HU-08, HU-09, HU-10
│  │  │  │  └─ export/            # HU-11
│  │  │  ├─ components/ui/        # componentes base (DI-05)
│  │  │  ├─ lib/                  # api-client.ts, query-client.ts, labels.ts, format.ts
│  │  │  ├─ styles/               # tokens y Tailwind
│  │  │  └─ test/                 # setup de Vitest y axe
│  │  ├─ e2e/                     # Playwright: t1-crear-plan.spec.ts … t5-exportar.spec.ts
│  │  ├─ index.html  vite.config.ts  playwright.config.ts
│  └─ api/
│     ├─ src/
│     │  ├─ modules/
│     │  │  ├─ plans/             # plans.controller.ts, plans.service.ts, plans.module.ts, *.spec.ts
│     │  │  ├─ sessions/
│     │  │  ├─ evidence/
│     │  │  ├─ metrics/
│     │  │  ├─ ai/                # ai.module.ts, ai.service.ts, providers/{gemini,mock}.provider.ts, prompt/
│     │  │  ├─ findings/
│     │  │  ├─ improvements/      # historias MX
│     │  │  ├─ sprints/           # sprints, miembros, review, retro
│     │  │  ├─ reports/           # modelo saneado del informe (HU-11)
│     │  │  └─ health/
│     │  ├─ common/               # zod-validation.pipe.ts, domain-error.ts, http-exception.filter.ts
│     │  ├─ config/               # env.ts (Zod)
│     │  ├─ prisma/               # prisma.service.ts
│     │  ├─ generated/prisma/     # cliente generado (en .gitignore)
│     │  └─ main.ts
│     ├─ prisma/                  # schema.prisma, migrations/, seed.ts
│     ├─ prisma.config.ts
│     └─ test/                    # e2e: *.e2e-spec.ts con supertest
├─ packages/shared/
│  └─ src/
│     ├─ schemas/                 # plan.ts, session.ts, evidence.ts, ai-output.ts, finding.ts, story.ts, sprint.ts, report.ts, errors.ts
│     ├─ domain/                  # plan-rules.ts, session-rules.ts, timer.ts, metrics.ts, comparison.ts,
│     │                           # sus.ts, priority.ts, capacity.ts, redact.ts, report-markdown.ts (+ *.test.ts)
│     ├─ constants/               # heuristics.ts, pour.ts, severity.ts, sus-items.ts, error-codes.ts
│     └─ index.ts
├─ docs/                          # esta documentación
├─ .github/                       # CI, plantillas de PR e issues, instrucciones de Copilot
├─ docker-compose.yml  .env.example  .nvmrc  .gitattributes  .editorconfig  .gitignore
├─ pnpm-workspace.yaml  package.json  tsconfig.base.json  eslint.config.js  commitlint.config.js
```

## 4. Backend (NestJS)

**Patrón por módulo:** `controller` (HTTP: rutas, parseo con Zod, códigos de estado) → `service`
(orquesta: transacciones Prisma + funciones de `shared/domain`) → `PrismaService`. Sin capa
repositorio extra salvo que una consulta compleja lo justifique.

**Errores:** los servicios lanzan `DomainError(code, message, details?, httpStatus)`; un filtro global
lo convierte al formato `{ code, message, details }` (catálogo en `BUSINESS_RULES.md`). Los errores no
controlados → `500 INTERNAL_ERROR`, con detalle solo en el log.

**Validación:** `ZodValidationPipe` recibe un esquema de `@utd/shared`. No se usa `class-validator`
(ver [ADR-0005](adr/0005-zod-contrato-compartido.md)).

**Prisma 7:** `prisma.config.ts` lee `DATABASE_URL`; `PrismaService` crea `new PrismaClient({ adapter:
new PrismaPg({ connectionString }) })` importando el cliente desde `src/generated/prisma`. El esquema
de referencia está en `DATA_MODEL.md`.

**Transacciones obligatorias:** crear sesión (participante + sesión + resultados), aprobar hallazgo
(historia + vínculo + estado), cerrar sprint (estados + review), reordenar backlog.

**Procesamiento de IA:** asíncrono dentro del mismo proceso: `POST /ai/runs` responde `202` con el
id y el servicio procesa los grupos en segundo plano (sin colas externas). La web consulta el estado cada
2 s mientras haya grupos pendientes. Al arrancar se aplica RN-18 (marcar `RUNNING` como `FAILED`).

### Endpoints (`/api/v1`)

| Módulo | Método y ruta | HU |
|---|---|---|
| health | `GET /health` | DI-04 |
| plans | `GET /plans?status&search&sort&page` · `POST /plans` · `GET /plans/:id` · `PATCH /plans/:id` · `POST /plans/:id/close` | HU-01, HU-03 |
| plans | `POST /plans/:id/tasks` · `PATCH /plans/:id/tasks/:taskId` · `DELETE /plans/:id/tasks/:taskId` · `PUT /plans/:id/tasks/order` · `GET /plans/equivalence-keys?interfaceName=` · `POST /plans/lint-instruction` | HU-01 |
| sessions | `GET /plans/:id/sessions` · `POST /plans/:id/sessions` · `GET /sessions/:id` | HU-02, HU-03 |
| sessions | `PUT /sessions/:id/results/:taskId` · `POST /sessions/:id/results/:taskId/timer` (`{action:"start"\|"pause"\|"reset"\|"adjust", elapsedMs?}`) | HU-02 |
| sessions | `POST /sessions/:id/observations` · `PATCH /observations/:id` · `DELETE /observations/:id` | HU-02 |
| sessions | `POST /sessions/:id/review` · `POST /sessions/:id/reopen` · `POST /sessions/:id/close` · `PUT /sessions/:id/sus` | HU-02, HU-13 |
| evidence | `POST /sessions/:id/evidence` (multipart) · `GET /evidence/:id` · `DELETE /evidence/:id` | HU-03 |
| metrics | `GET /metrics?planId&from&to` · `GET /metrics/heuristics-matrix?planId` · `GET /metrics/compare?basePlanId&currentPlanId` | HU-05, HU-12 |
| ai | `GET /observations?planId&sessionId&taskId` · `POST /ai/redaction-preview` · `POST /ai/runs` · `GET /ai/runs/:id` · `POST /ai/runs/:id/groups/:groupId/retry` | HU-06 |
| findings | `GET /findings?runId&status&severity` · `GET /findings/:id` · `PATCH /findings/:id` · `POST /findings/:id/approve` · `POST /findings/:id/mark-reviewed` · `POST /findings/:id/discard` · `POST /findings/:id/restore` | HU-07 |
| improvements | `GET /improvements?status&priority&planId` · `POST /improvements` · `PATCH /improvements/:id` · `PUT /improvements/order` · `PATCH /improvements/:id/status` | HU-08, HU-09 |
| sprints | `GET/POST /members` · `GET /sprints` · `POST /sprints` · `PATCH /sprints/:id` · `POST /sprints/:id/stories` · `DELETE /sprints/:id/stories/:storyId` · `POST /sprints/:id/start` · `POST /sprints/:id/close` · `PUT /sprints/:id/review` · `PUT /sprints/:id/retrospective` | HU-09, HU-10 |
| reports | `GET /reports/:planId?sections=` | HU-11 |

Las escrituras sobre `TestPlan` y `Session` envían `version` (RN-21). Las respuestas de listas usan
`{ items, total, page, pageSize }`.

## 5. Frontend (React)

- **Por funcionalidad** (`features/<área>`): cada una tiene `pages/`, `components/`, `hooks/` y `api.ts`
  (funciones que llaman al `api-client` y hooks de TanStack Query). Una feature no importa archivos
  internos de otra: comparte por `components/ui`, `lib` o `@utd/shared`.
- **Estado del servidor** con TanStack Query (claves `['plans', filtros]`, `['session', id]`…); estado
  local con `useState`/`useReducer`. No se agrega Redux/Zustand.
- **Formularios** con React Hook Form + resolver Zod usando los **mismos** esquemas de shared.
- **Errores:** `api-client` convierte la respuesta en `ApiError { code, message, details }`; los
  formularios mapean `details.fields` a cada campo; el resto se muestra con `ErrorState` o `Toast`.
- **Rutas:**

| Ruta | Pantalla | HU |
|---|---|---|
| `/plans` | Mis planes | HU-03 |
| `/plans/new`, `/plans/:id/edit` | Asistente del plan (3 pasos) | HU-01 |
| `/plans/:id` | Detalle del plan y sus sesiones | HU-03 |
| `/sessions` | Sesiones (todas, con filtro por plan) | HU-03 |
| `/sessions/:id/run` | Ejecutar tarea | HU-02 |
| `/sessions/:id/review` | Revisión antes del cierre (+ SUS) | HU-02, HU-13 |
| `/sessions/:id` | Detalle de sesión | HU-03 |
| `/results` | Dashboard de resultados | HU-05 |
| `/results/compare` | Comparar evaluaciones | HU-12 |
| `/results/export` | Exportar resultados | HU-11 |
| `/ai` | Hallazgos e IA (seleccionar y analizar) | HU-06 |
| `/ai/runs/:id` | Estado del análisis y propuestas | HU-06, HU-07 |
| `/ai/findings/:id` | Revisar sugerencia | HU-07 |
| `/improvements` | Backlog de mejoras MX | HU-08 |
| `/improvements/sprints/new`, `/improvements/sprints/:id/plan` | Planificar sprint | HU-09 |
| `/improvements/board` | Tablero del sprint activo | HU-09 |
| `/improvements/sprints/:id/close` | Review y retrospectiva | HU-10 |
| `/design` (solo dev) | Catálogo de componentes | DI-05 |

## 6. Paquete compartido (`@utd/shared`)

- `schemas/`: entradas y salidas de la API (`PlanCreateInput`, `TaskResultUpdate`, `AiFindingsOutput`…)
  y `ApiErrorSchema`. Los tipos se exportan con `z.infer`.
- `domain/`: **funciones puras**, sin `Date.now()` interno (reciben `now` como parámetro para probarlas
  con reloj fijo) y sin acceso a BD.
- `constants/`: heurísticas (código, nombre, descripción corta), POUR, escala de severidad, ítems SUS,
  códigos de error. La IA y la UI leen de aquí, para que el prompt y la interfaz digan lo mismo.

## 7. Configuración (`.env.example`)

```dotenv
# API
NODE_ENV=development
API_PORT=3000
WEB_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://utd:utd@localhost:5432/utd
DATABASE_URL_TEST=postgresql://utd:utd@localhost:5433/utd_test
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=10

# IA
AI_PROVIDER=mock            # mock | gemini (si es gemini y falta la clave, la API no arranca)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash   # modelo Flash GA al 6-oct-2026; verificar en Google AI Studio
AI_TIMEOUT_MS=30000
AI_GROUP_SIZE=20
AI_PROMPT_VERSION=v1

# Web
VITE_API_URL=http://localhost:3000/api/v1
```

## 8. Docker

`docker-compose.yml`:
- `db`: `postgres:17`, usuario/clave/BD `utd`, volumen `pgdata`, healthcheck `pg_isready`, puerto 5432.
- `db_test`: `postgres:17`, BD `utd_test`, puerto 5433, **sin volumen** (se recrea en cada corrida de e2e).
- Perfil `demo`: `api` (Dockerfile multi-etapa en `apps/api`, ejecuta `prisma migrate deploy` al
  iniciar) y `web` (build de Vite servido por nginx). `docker compose --profile demo up --build` levanta
  todo para la presentación.

En desarrollo la API y la web corren con `pnpm dev` (recarga en caliente); Docker solo levanta las BD.
Si alguien no puede usar Docker, usa un PostgreSQL gratuito en la nube (Neon o Supabase) cambiando
`DATABASE_URL`; **no** se cambia a SQLite (rompe enums y migraciones).

## 9. Estándares de código

- TypeScript `strict` + `noUncheckedIndexedAccess`; sin `any`, sin `!` no justificado.
- Nombres: archivos `kebab-case`; componentes y clases `PascalCase`; funciones y variables
  `camelCase`; constantes `UPPER_SNAKE`; booleanos con `is/has/can`.
- Funciones pequeñas y con un propósito; lógica de negocio fuera de controladores y componentes.
- Componentes accesibles por defecto: HTML semántico primero (`button`, `label`, `table`, `nav`,
  `main`), ARIA solo cuando el HTML no alcanza.
- Fechas: se guardan en UTC (ISO 8601 en la API); se formatean con `Intl.DateTimeFormat('es-EC',
  { timeZone: 'America/Guayaquil' })`.
- Nada de `console.log` en código fusionado: en la API se usa el `Logger` de Nest.
- Los textos de la interfaz se centralizan por feature (constantes), no repartidos en la lógica.
