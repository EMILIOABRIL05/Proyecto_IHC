# Product Backlog — Usability Test Dashboard

Fuente: matriz oficial de planificación del grupo (HU-01..HU-12, puntos y sprints). Quién hace cada tarea
y cuántas horas: [`TEAM.md`](TEAM.md). El trabajo técnico base (**DI-04** y **DI-05**, abajo) no es un ítem
de la matriz: se cumple dentro de las líneas de HU-01, HU-03 y HU-04. **HU-13 (SUS)** es un **extra** que el
equipo agrega encima de la matriz (se hace con la holgura del S3). Reglas `RN-xx` en
[`BUSINESS_RULES.md`](BUSINESS_RULES.md).

## Resumen

| Orden | Código | Historia | Valor (1–10) | SP | Sprint | Depende de |
|---|---|---|---|---|---|---|
| 1 | HU-01 | Configurar plan de prueba (asistente de 3 pasos) | 10 | 8 | S2 | DI-04, DI-05 |
| 2 | HU-02 | Ejecutar sesión: cronómetro, resultado, errores, observaciones | 10 | 8 | S2 | DI-04 (esquema y seed); se integra con la API de HU-01 al final |
| 3 | HU-03 | Consultar planes y sesiones; adjuntar evidencias | 8 | 5 | S2 | HU-01, HU-02 (API de sesiones) |
| 4 | HU-04 | Formularios accesibles y sin pérdida de datos | 8 | 5 | S2 | DI-05; revisa HU-01..03 |
| 5 | HU-05 | Dashboard de métricas filtrable | 10 | 8 | S3 | HU-02, seed |
| 6 | HU-06 | IA resume y clasifica observaciones | 9 | 8 | S3 | HU-02 |
| 7 | HU-07 | Revisar, editar y aprobar propuestas de IA | 9 | 5 | S3 | HU-06 |
| 8 | HU-08 | Backlog de mejoras MX priorizado y vinculado | 8 | 5 | S3 | HU-07 |
| 9 | HU-13 (extra) | Cuestionario SUS al cerrar la sesión | — | 2 | S3 | HU-02 |
| 10 | HU-09 | Sprints de mejora y tablero Kanban | 9 | 8 | S4 | HU-08 |
| 11 | HU-10 | Sprint Review y Retrospectiva de mejoras | 7 | 3 | S4 | HU-09 |
| 12 | HU-11 | Exportar informe en PDF y Markdown | 7 | 5 | S4 | HU-05, HU-07, HU-08 |
| 13 | HU-12 | Comparar dos evaluaciones (tareas equivalentes) | 8 | 5 | S4 | HU-01 (`equivalenceKey`), HU-05 |

El valor (1–10) viene de la hoja *Backlog* de la matriz oficial; el equipo la usa para priorizar.

**Totales (matriz):** S2 = 26 SP · S3 = 26 SP · S4 = 21 SP · **Total = 73 SP**. Con el extra HU-13: S3 = 28 y total 75.
**Ruta crítica:** DI-04 → HU-01 → HU-02 → HU-06 → HU-07 → HU-08 → HU-09 → HU-10.

Diagrama de dependencias y cronograma: [`diagrams/05-cronograma.md`](diagrams/05-cronograma.md).

Formato de cada historia: **Historia** · **Criterios de aceptación (CA)** verificables · **Tareas
técnicas** sugeridas (cada una ≈ 1–3 commits) · **Pruebas mínimas** · **Fuera de alcance**.

---

## DI-04 — Configuración técnica (dentro de las líneas de HU-01 y HU-03; sin horas ni puntos propios)

**Objetivo:** que cualquier integrante clone el repo y, con los comandos de `AGENTS.md` §6, tenga la
API, la web, la BD y las pruebas funcionando en menos de 15 minutos.

**Dónde se cumple** (cada parte vive dentro de una línea de la matriz, ver [`TEAM.md`](TEAM.md) §4). Orden:
primero la raíz, después lo demás en paralelo.

| Línea de la matriz | Persona | Parte del checklist que incluye |
|---|---|---|
| HU-01 "Preparar NestJS, contratos de datos y validación de entrada" | Manuel | Raíz del monorepo, `tsconfig`, ESLint/Prettier, Husky/commitlint, `packages/shared`, `apps/api` base, `docker-compose.yml`, `.env.example`, scripts raíz |
| HU-01 "Preparar estructura React, rutas y componentes del flujo" | William | `apps/web` base (Vite, Tailwind, shadcn, Router, Query, Vitest/axe, Playwright), `ci.yml` y todo **DI-05** |
| HU-03 "Diseñar base de datos para planes, sesiones y evidencias" | Pablo | Esquema Prisma completo, migración inicial y seed |
| Responsabilidad de admin del repo (sin horas de la matriz) | Emilio | Último punto de GitHub: `develop`, protecciones, etiquetas, Project |

Si la parte de Manuel se retrasa, Emilio (que no tiene línea de base) apoya con la raíz.

### Estado de la base técnica (6 oct 2026)

Emilio, como apoyo, **ya construyó la base técnica** y la entregó en tres PR apilados, uno por línea de la
matriz (se fusionan en este orden: A → B → C). Eso **no cierra las líneas**: cada dueño revisa su PR,
completa lo que falta y registra sus horas reales en la matriz. Las horas que Emilio dedicó van en la hoja
*Tareas no Planificadas*.

| PR (rama) | Línea de la matriz | Ya está hecho | Falta (lo hace el dueño de la línea) |
|---|---|---|---|
| **A** `chore/DI-04-raiz` | HU-01 · **Manuel** — Preparar NestJS, contratos de datos y validación de entrada (8 h) | Monorepo pnpm, `tsconfig` estricto, ESLint/Prettier/Husky/commitlint, `packages/shared` (con el esquema y los códigos de error de la API), `apps/api` base (`/health`, Swagger, filtro de errores, `ZodValidationPipe`, configuración validada), Docker de la BD, `.env.example`, scripts raíz | **Contratos de datos de HU-01** (esquemas Zod del plan y de las tareas en `packages/shared/src/schemas`), **validación de entrada** con esos esquemas y el módulo `plans` de la API. Revisar el PR A |
| **B** `feature/HU-03-bd` | HU-03 · **Pablo** — Diseñar base de datos para planes, sesiones y evidencias (10 h) | Esquema Prisma completo de `DATA_MODEL.md`, migración inicial con `CHECK`, `PrismaService`, seed idempotente del caso demo, scripts `db:*` | **Revisar y validar el esquema** contra planes, sesiones y evidencias; cambios nuevos solo con una migración nueva; comprobar con un clon limpio que `db:migrate` y `db:seed` funcionan. Revisar el PR B |
| **C** `feature/HU-01-estructura-web` | HU-01 · **William** — Preparar estructura React, rutas y componentes del flujo (8 h) | `apps/web` base (Vite, Tailwind, shadcn inicializado, Router, TanStack Query, `api-client`, Vitest + axe, Playwright), perfil Docker `demo`, `ci.yml`, README | **Todo DI-05**: layout, navegación lateral de 5 áreas, tokens del Figma con contraste AA calculado, componentes base, página `/design` y rutas vacías de `HCI_DESIGN.md` §3; además `docs/testing/a11y-checklist.md`. Revisar el PR C |
| GitHub | **Emilio** (admin del repo, sin horas de la matriz) | La rama `develop` ya existe | Dejarla como rama por defecto, proteger `main` y `develop`, etiquetas, GitHub Project y un Issue por HU |

Los PR llevan `Refs #n`: el Issue de HU-01 y el de HU-03 los cierra el dueño de cada HU (Jonathan y Pablo)
al fusionar su última línea (ver [`TEAM.md`](TEAM.md) §4).


Checklist (cada punto es un commit `chore`/`ci`/`build` o `feat(db)`):
- [ ] Monorepo pnpm: `apps/web` (`@utd/web`), `apps/api` (`@utd/api`), `packages/shared` (`@utd/shared`);
      `pnpm-workspace.yaml`; `package.json`
      raíz con `packageManager` (pnpm) y `engines.node` (>=24); `.nvmrc` = `24`.
- [ ] `tsconfig.base.json` con `strict: true`, `noUncheckedIndexedAccess: true`; alias `@utd/shared`.
- [ ] `packages/shared` compilado con `tsup` (ESM + CJS + `.d.ts`); `pnpm dev` ejecuta su modo watch.
- [ ] ESLint (flat config) + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y`
      + Prettier; Husky + lint-staged + commitlint (Conventional Commits).
- [ ] `docker-compose.yml`: servicio `db` (PostgreSQL 17, volumen, healthcheck, puerto 5432), servicio
      `db_test` (puerto 5433, BD `utd_test`, sin volumen) y perfil `demo` con `api` y `web` construidos.
- [ ] `apps/api` NestJS: prefijo `/api/v1`; `GET /api/v1/health`; Swagger en `/api/docs`;
      `ZodValidationPipe` global; filtro global de errores con formato `{ code, message, details }`;
      CORS para `WEB_ORIGIN`; configuración validada con Zod al arrancar (falla rápido si falta una variable).
- [ ] Prisma: **esquema completo** de [`DATA_MODEL.md`](DATA_MODEL.md) en la migración inicial (evita
      choques de migraciones entre ramas); `PrismaService`; `prisma/seed.ts` con el caso demo (ver §Seed).
- [ ] `apps/web`: Vite + React + TS, Tailwind, shadcn/ui inicializado, React Router, TanStack Query,
      `lib/api-client.ts` que interpreta el formato de error; Vitest + Testing Library + `vitest-axe`;
      Playwright configurado (`apps/web/e2e`).
- [ ] Scripts raíz: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `format`, `db:migrate`,
      `db:seed`, `db:reset`, `db:studio`.
- [ ] `.env.example` documentado (ver `ARCHITECTURE.md` §7). `.env` en `.gitignore`.
- [ ] `.github/workflows/ci.yml` (ver `TESTING.md` §6).
- [ ] **Emilio (admin GitHub):** crear rama `develop` y ponerla por defecto; proteger `main` y `develop`
      (PR obligatorio, 1 aprobación, CI verde, sin push directo); activar *secret scanning*; crear
      etiquetas (`HU-01`…`HU-13`, `DI-04`, `DI-05`, `sprint-2/3/4`, `tipo:feat|fix|docs|test|chore`,
      `bug`, `bloqueado`); crear el GitHub Project con columnas To Do / In Progress / Review / Done; crear
      un Issue por HU y sub-issues por tarea.
- [ ] README con instrucciones verificadas en Windows y en Linux/macOS.

**CA:** clon limpio → `pnpm install`, `docker compose up -d db`, `pnpm db:migrate`, `pnpm db:seed`,
`pnpm dev` funcionan; `GET /api/v1/health` responde `{"status":"ok"}`; la web muestra una página;
`pnpm lint && pnpm typecheck && pnpm test` pasan; un PR de prueba ejecuta el CI en verde.

### Seed (datos demo)
Caso "Checkout tienda universitaria" (datos **ficticios**, solo para demo y pruebas):
- Plan **Piloto** (CLOSED): tareas `buscar-producto`, `anadir-carrito`; 5 sesiones cerradas.
- Plan **Evaluación actual** (IN_PROGRESS): tareas `buscar-producto`, `anadir-carrito`, `completar-pago`;
  cupo 8; 7 sesiones (6 CLOSED, 1 IN_PROGRESS = P-008 con 3 errores, 1 ayuda, 08:42 acumulado).
- Observaciones realistas (≥ 20), incluidas 2 sobre el campo de vencimiento de la tarjeta.
- Hallazgos de ejemplo: 1 APPROVED (genera MX-014), 1 DRAFT, 1 DISCARDED.
- Backlog MX con 7 historias (MX-008..MX-014), sprint de mejoras con capacidad 21 y 16 puntos
  comprometidos (MX-011, MX-014 terminadas = 13 pts; MX-009 en progreso = 3 pts).
- 3 integrantes ficticios del equipo de mejoras.
El seed es **idempotente** (`db:reset` + `db:seed` siempre deja el mismo estado).

---

## DI-05 — Estructura de UI y design system (dentro de la línea de HU-01 de William)

- [ ] Layout: barra superior (nombre del producto, proyecto activo), navegación lateral persistente con
      5 áreas — **Planes de prueba, Sesiones, Resultados, Hallazgos e IA, Gestión Scrum** — con la
      sección activa resaltada (no solo por color), título de página y migas de pan.
- [ ] Enlace "Saltar al contenido principal"; `focus-visible` evidente; respeta `prefers-reduced-motion`.
- [ ] Rutas con páginas vacías para todas las pantallas de [`HCI_DESIGN.md`](HCI_DESIGN.md) §3.
- [ ] Tokens tomados del Figma del Sprint 1 (colores semánticos, tipografía, espaciado, radios) en
      Tailwind; **contraste AA verificado** (4.5:1 texto, 3:1 componentes y texto grande).
- [ ] Componentes base (shadcn adaptados): `Button` (primary, secondary, ghost, destructive), `FormField`
      (label persistente + ayuda + error enlazado con `aria-describedby`), `Input`, `Textarea`, `Select`,
      `Checkbox`, `RadioGroup`, `ConfirmDialog`, `Toast`, `StatusBadge`, `SeverityBadge` (0–4 con texto),
      `AiBadge` (marca contenido generado por IA), `Stepper`, `DataTable`, `EmptyState`, `ErrorState`,
      `LoadingState`.
- [ ] Página `/design` (solo en desarrollo) que muestra todos los componentes y sus estados.

**CA:** axe sin violaciones en el layout y en `/design`; todo se recorre con Tab/Shift+Tab/Enter/Espacio/
Esc; los estados (activo, error, deshabilitado, cargando) se comunican con texto además de color.

---

## HU-01 — Configurar plan de prueba (8 SP · S2)

**Historia:** Como investigador, quiero configurar un plan de prueba con objetivos, participantes y
tareas para organizar la evaluación.

**Reglas:** RN-01, RN-02, RN-04, RN-16.

**CA:**
1. Desde "Nuevo plan" se abre un asistente de **3 pasos** con indicador de progreso ("Paso 1 de 3") y
   navegación Volver/Continuar.
2. **Paso 1 — Datos generales:** nombre*, interfaz evaluada*, objetivo*, perfil de participantes*,
   modalidad* (`MODERATED_IN_PERSON`, `MODERATED_REMOTE`, `UNMODERATED_REMOTE`), cupo de participantes*
   (1–50), "Formulario de consentimiento preparado" (casilla + texto o enlace del formulario), notas del
   moderador (opcional). Panel de ayuda con un ejemplo de objetivo bien redactado.
3. **Paso 2 — Tareas y criterios:** añadir, editar, duplicar, eliminar y reordenar tareas (reordenar
   también con botones Subir/Bajar accesibles por teclado). Cada tarea: consigna*, resultado esperado*,
   métrica principal* (`SUCCESS_TIME`, `SUCCESS_ERRORS`, `SUCCESS_ONLY`), criterio de éxito*, **clave de
   equivalencia*** (se propone automáticamente desde la consigna en `kebab-case`, editable, y se puede
   elegir una existente de otro plan con la misma interfaz evaluada).
4. Si una consigna contiene palabras que dirigen al participante (RN-02) se muestra una **advertencia
   no bloqueante** con una sugerencia de redacción neutral.
5. **Paso 3 — Revisar y guardar:** resumen de datos y tareas con enlaces "Editar" a cada paso y lista de
   comprobación (objetivo, ≥ 1 tarea completa, criterios definidos, consentimiento).
6. **Guardar plan** está disponible aunque falte el consentimiento → el plan queda `READY` si tiene ≥ 1
   tarea completa, o `DRAFT` si no. **Guardar e iniciar** está **deshabilitado** con el motivo visible
   ("Falta preparar el consentimiento informado") mientras `consentReady = false` (RN-01).
7. "Guardar borrador" existe en todos los pasos y no pierde datos; al intentar salir con cambios sin
   guardar se pide confirmación.
8. Editar un plan con sesiones ya iniciadas **no permite** agregar, eliminar ni reordenar tareas ni
   cambiar su clave de equivalencia; se explica por qué (RN-04).
9. El servidor valida todo (Zod) y responde errores con el formato estándar; la UI los muestra junto al campo.

**Tareas técnicas:** esquemas Zod `PlanInput`/`PlanTaskInput` en shared · `domain/plan-rules.ts`
(`planStatusFor`, `canStartSessions`, `findLeadingWords`, `suggestEquivalenceKey`) · módulo `plans` en
API (`POST/GET/PATCH /plans`, tareas, orden, `GET /plans/equivalence-keys?interfaceName=`) · páginas
`/plans/new` y `/plans/:id/edit` con React Hook Form · e2e de la API.

**Pruebas mínimas:** unitarias de `plan-rules` (cada RN con caso feliz y borde); e2e API: crear plan sin
consentimiento → `READY` pero `canStartSessions=false`; modificar tareas con sesiones → 409
`TASKS_LOCKED`; componente del asistente con axe.

**Fuera de alcance:** listado/búsqueda de planes (HU-03), plantillas de plan, duplicar plan completo.

---

## HU-02 — Ejecutar sesión de prueba (8 SP · S2)

**Historia:** Como evaluador, quiero registrar éxito, tiempo, errores y observaciones por tarea para
documentar cada sesión.

**Reglas:** RN-01, RN-03, RN-05, RN-08 (cronómetro), RN-17, RN-21.

**CA:**
1. **Nueva sesión** desde un plan `READY`/`IN_PROGRESS`: se crea un participante con código automático
   (`P-001`, `P-002`… por plan), perfil opcional (texto corto, sin datos personales) y casilla
   obligatoria "El participante otorgó su consentimiento" (registra `consentAt`). Bloqueada si el plan no
   tiene consentimiento preparado (RN-01) o si el cupo está completo (RN-03); en ese caso se muestra el
   motivo y se **destaca "Continuar"** en las sesiones abiertas.
2. Al iniciar la primera sesión el plan pasa a `IN_PROGRESS`.
3. **Pantalla de ejecución:** progreso "Tarea 2 de 3", consigna (para leer en voz alta), resultado
   esperado (visible solo para quien modera), cronómetro **Iniciar / Pausar / Reiniciar** con tiempo en
   `mm:ss` y anuncio accesible del estado (no cada segundo), resultado (`UNASSISTED` "Sin ayuda",
   `ASSISTED` "Con ayuda", `FAILED` "No completó"), contador de errores (+/−, mínimo 0), lista de
   observaciones (añadir, editar, eliminar).
4. **Guardado:** automático cada 10 s mientras hay cambios, al pausar, al cambiar de tarea y al pulsar
   "Guardar avance"; indicador "Guardado hace X s" / "Guardando…" / "Error al guardar — Reintentar".
5. **Recuperación:** si se recarga o se cierra la pestaña, al volver la sesión continúa en la misma tarea
   con el tiempo correcto (RN-08); antes de cerrar la pestaña con cambios sin guardar se avisa.
6. "Tarea anterior" y "Siguiente tarea" sin perder datos.
7. **Revisión antes del cierre:** tabla de tareas con resultado, tiempo, errores y nº de observaciones;
   las tareas sin resultado se marcan; "Volver a editar" por fila; la sesión pasa a `IN_REVIEW`.
8. **Cerrar sesión** solo si todas las tareas tienen resultado (RN-05), con diálogo de confirmación; la
   sesión pasa a `CLOSED` y ya no se edita.
9. Si dos personas editan la misma sesión, la segunda recibe "Otra persona actualizó esta sesión.
   Recarga para ver los cambios" (409 `VERSION_CONFLICT`).

**Tareas técnicas:** `domain/timer.ts` (`currentElapsedMs`, `start`, `pause`, `reset`) y
`domain/session-rules.ts` · módulo `sessions` en API (`POST /plans/:id/sessions`, `GET /sessions/:id`,
`PUT /sessions/:id/results/:taskId`, observaciones, `POST /sessions/:id/review`, `POST /sessions/:id/close`)
· página `/sessions/:id/run` y `/sessions/:id/review` · hook `useAutosave`.

**Pruebas mínimas:** unitarias del cronómetro (pausa, reanudar, recarga simulada con reloj falso); e2e
API: cupo lleno → 409 `QUOTA_FULL`, cerrar con tareas pendientes → 409 `INCOMPLETE_RESULTS`, versión
vieja → 409; componente de ejecución con axe y recorrido por teclado.

**Fuera de alcance:** evidencias (HU-03), SUS (HU-13), grabación de audio/video.

---

## HU-03 — Consultar planes y sesiones; adjuntar evidencias (5 SP · S2)

**Historia:** Como investigador, quiero consultar mis planes y sesiones y adjuntar evidencias para
conservar el contexto del test.

**Reglas:** RN-03, RN-15, RN-16.

**CA:**
1. **Mis planes:** tabla con nombre, interfaz, estado (insignia con texto), participantes (registrados/
   cupo) y fecha de actualización; búsqueda por nombre o interfaz; filtro por estado; orden por fecha o
   nombre; acciones Abrir y Editar; botón "Nuevo plan"; estado vacío con llamada a la acción.
2. **Detalle del plan / Sesiones:** datos del plan, tareas, y lista de sesiones (código, estado, progreso
   "2/3 tareas", fecha) con acciones Continuar (abiertas) o Ver (cerradas); resumen lateral: registradas,
   cerradas, en curso, cupo restante.
3. **Detalle de sesión (solo lectura si está cerrada):** resultados por tarea, observaciones y evidencias.
4. **Cerrar plan** (acción del detalle del plan, con confirmación): solo si no hay sesiones abiertas
   (RN-16); un plan cerrado no admite nuevas sesiones y sus datos quedan como evaluación terminada.
5. **Evidencias:** adjuntar desde la ejecución de la sesión o desde el detalle (por tarea u observación);
   tipos permitidos PNG, JPG, WEBP y PDF; máximo 10 MB por archivo y 20 por sesión (RN-15); vista previa
   de imágenes y enlace para PDF; eliminar con confirmación (solo si la sesión no está cerrada); mensajes
   claros si el archivo no es válido.

**Tareas técnicas:** `GET /plans` con filtros y paginación · `GET /plans/:id/sessions` · módulo
`evidence` (`POST /sessions/:id/evidence` multipart, `GET /evidence/:id`, `DELETE /evidence/:id`) con
verificación de tipo real (bytes) · páginas `/plans`, `/plans/:id`, `/sessions/:id`.

**Pruebas mínimas:** e2e API: subir PNG válido, rechazar `.exe` renombrado a `.png` (415
`INVALID_FILE_TYPE`), rechazar 11 MB (413 `FILE_TOO_LARGE`), nombre `../../x.png` se guarda con uuid;
listado con filtros; componentes con axe.

---

## HU-04 — Formularios accesibles (5 SP · S2)

**Historia:** Como evaluador, quiero formularios accesibles con mensajes claros para completar registros
sin confusión.

**CA:**
1. Todos los campos de HU-01..HU-03 tienen **label visible persistente** (no solo placeholder), ayuda
   cuando hace falta y obligatorios indicados con texto ("obligatorio"), no solo con `*`.
2. Errores: mensaje junto al campo, enlazado con `aria-describedby`, `aria-invalid`; al enviar con
   errores aparece un **resumen** arriba con enlaces a cada campo y el foco va al resumen.
3. Mensajes de error explican qué pasó y cómo corregirlo (H9). Ej.: "El cupo debe ser un número entre 1 y 50".
4. **Teclado:** todo operable sin ratón; orden de foco lógico; foco visible; diálogos atrapan el foco y
   se cierran con Esc devolviendo el foco al disparador; sin trampas de foco.
5. **Contraste** AA en textos, bordes de campos e iconos informativos.
6. **Sin pérdida de datos:** borradores guardados en servidor (HU-01, HU-02) y aviso antes de salir con
   cambios sin guardar.
7. Se documenta una **lista de verificación manual** (teclado + NVDA) en `docs/testing/a11y-checklist.md`
   con el resultado de cada pantalla del sprint.

**Pruebas mínimas:** `vitest-axe` en cada formulario; Playwright + axe en `/plans/new`, `/sessions/:id/run`,
`/plans`; prueba de teclado automatizada del asistente (completar el paso 1 solo con teclado).

---

## HU-05 — Dashboard de métricas (8 SP · S3)

**Historia:** Como investigador, quiero filtrar un dashboard de métricas para encontrar problemas
frecuentes y comparar tareas.

**Reglas:** RN-06, RN-07, RN-10.

**CA:**
1. Filtros: plan (obligatorio) y período (fecha de cierre de sesión, desde/hasta). Los filtros se
   reflejan en la URL (se puede compartir/recargar).
2. Indicadores: sesiones cerradas, **tasa de completitud**, **éxito sin ayuda**, **mediana de tiempo**,
   **errores promedio por tarea** y, si existe HU-13, **SUS promedio** con su interpretación (≥ 68
   aceptable). Cada indicador tiene una ayuda (ⓘ) con su fórmula.
3. Tabla por tarea (completitud, sin ayuda, con ayuda, no completó, mediana y media de tiempo, errores) y
   gráfico de barras de completitud por tarea. Todo gráfico tiene una **tabla alternativa** accesible.
4. **Observaciones más frecuentes** por tarea (conteo) y, cuando existan hallazgos aprobados, **matriz
   heurística × severidad** (H1–H10 × 0–4) con conteos.
5. Solo cuentan sesiones `CLOSED`; sin datos se muestra un estado vacío que explica qué hacer (RN-07).
6. Accesos a "Analizar observaciones con IA" (HU-06), "Comparar evaluaciones" (HU-12) y "Exportar" (HU-11).
7. Los números coinciden con un cálculo manual sobre el seed (prueba de aceptación).

**Tareas técnicas:** `domain/metrics.ts` (funciones puras) · `GET /metrics?planId&from&to` ·
`GET /metrics/heuristics-matrix?planId` · página `/results` con Recharts.

**Pruebas mínimas:** unitarias de métricas con casos borde (0 sesiones, todas fallidas, una sola tarea,
tiempos atípicos); e2e API contra el seed con valores esperados escritos a mano; axe.

---

## HU-06 — Motor de IA para observaciones (8 SP · S3)

**Historia:** Como investigador, quiero que la IA resuma y clasifique observaciones para reconocer
hallazgos de usabilidad.

**Reglas:** RN-09, RN-10, RN-17, RN-18. Contrato completo en [`AI_MODULE.md`](AI_MODULE.md).

**CA:**
1. **Seleccionar observaciones:** filtros por plan, sesión y tarea; casillas para elegir (y "seleccionar
   todas las filtradas"); aviso que explica qué hará la IA y que **toda sugerencia requiere revisión humana**.
2. Antes de enviar se muestra cuántas observaciones van y si se **ocultaron datos personales**
   detectados (RN-17).
3. Al enviar se crea un análisis (`AiRun`) que se procesa en grupos de hasta 20 observaciones; la
   pantalla muestra el estado por grupo (pendiente, procesando, listo, falló) y se actualiza sola.
4. Si un grupo falla, los demás continúan; el grupo fallido muestra el motivo en lenguaje claro y
   **Reintentar**. Un fallo parcial **no bloquea** revisar los grupos listos (ajuste del Sprint 1).
5. Cada propuesta (`Finding`, estado `DRAFT`) contiene: resumen, heurísticas (H1–H10), principios POUR,
   severidad 0–4, justificación, mejora sugerida, borrador de historia y criterios de aceptación, y las
   observaciones de origen.
6. Sin `GEMINI_API_KEY` el sistema usa el **modo simulado** y lo indica con la etiqueta "Simulado".
7. Respuestas inválidas de la IA (JSON roto, ids inexistentes, severidad fuera de rango) **nunca** se
   guardan como propuestas: el grupo queda como fallido con el error registrado.

**Tareas técnicas:** ver `AI_MODULE.md` §7.

**Pruebas mínimas:** contrato de IA con todos los casos de `AI_MODULE.md` §6; e2e API con
`MockProvider`; prueba de reinicio del servidor durante un análisis (RN-18).

---

## HU-07 — Curaduría humana de propuestas de IA (5 SP · S3)

**Historia:** Como investigador, quiero editar y aprobar sugerencias de IA para convertir hallazgos en
mejoras e historias revisadas.

**Reglas:** RN-09, RN-10.

**CA:**
1. Lista de propuestas por análisis con filtro por estado (Borrador, Aprobada, Descartada) y severidad.
2. **Pantalla de revisión:** a la izquierda las **observaciones originales** (evidencia, con sesión y
   tarea); a la derecha la propuesta editable: resumen, heurísticas, POUR, severidad (con la escala
   explicada), justificación, mejora, historia y criterios de aceptación.
3. El contenido generado por IA lleva la marca `AiBadge`; al editarlo cambia a "Editado por persona".
4. Acciones separadas y distinguibles: **Descartar** (lejos de Aprobar, con confirmación y motivo
   opcional), **Guardar borrador** y **Aprobar y añadir al backlog**.
5. Aprobar crea **una** historia MX vinculada al hallazgo y a sus observaciones (transacción); un doble
   clic no crea duplicados. Tras aprobar se ofrece "Ver en el backlog".
6. Severidad 0: "Aprobar y añadir al backlog" no está disponible; en su lugar "Marcar como revisado (sin
   historia)".
7. Un hallazgo descartado puede **restaurarse** a borrador (control y libertad, H3).
8. Se conserva la versión original de la IA (`aiOriginal`) para comparar con la editada.

**Pruebas mínimas:** e2e API: aprobar dos veces → una sola MX (segunda vez 409 `ALREADY_APPROVED`);
aprobar severidad 0 → 409 `SEVERITY_ZERO_NO_STORY`; componente de revisión con axe y teclado.

---

## HU-08 — Backlog de mejoras MX (5 SP · S3)

**Historia:** Como responsable de mejoras UX, quiero crear y priorizar historias ligadas a hallazgos
dentro del sistema.

**Reglas:** RN-10, RN-19.

**CA:**
1. Tabla del backlog: código MX, título, hallazgo de origen (enlace), severidad, prioridad, puntos,
   estado, sprint; filtros por prioridad, estado y plan.
2. Crear historia manual (formulario: título, "Como… quiero… para…", criterios de aceptación, prioridad,
   puntos, hallazgo opcional) y editar cualquier historia.
3. Puntos en escala Fibonacci (1, 2, 3, 5, 8, 13).
4. **Ordenar** arrastrando y con botones Subir/Bajar (teclado); el orden se guarda.
5. Se muestra la **puntuación sugerida** (severidad × frecuencia, RN-10) para ayudar a priorizar.
6. Códigos MX consecutivos y únicos (MX-001, MX-002…).

**Pruebas mínimas:** unitarias de priorización y numeración; e2e API de CRUD y orden; axe.

---

## HU-13 — Cuestionario SUS (extra · 2 SP · S3)

**Historia:** Como evaluador, quiero aplicar el cuestionario SUS al cerrar cada sesión para medir la
satisfacción del participante con la interfaz evaluada.

> Estado: **extra del equipo, no está en la matriz oficial** ([ADR-0004](adr/0004-sus.md)). Se hace con
> la holgura del S3 (William y Pablo), después de las líneas de la matriz. Si el PO no la acepta, se elimina
> sin afectar a otras historias.

**CA:**
1. Al pasar a revisión de cierre se ofrece el cuestionario de 10 ítems (escala 1–5, ver
   `BUSINESS_RULES.md` RN-20); se puede omitir indicando un motivo.
2. El puntaje (0–100) se calcula con `domain/sus.ts` y se guarda en la sesión.
3. El puntaje aparece en el detalle de sesión y su promedio en el dashboard (HU-05).
4. El SUS mide la **interfaz evaluada** (ej. el checkout), no al Dashboard.

**Pruebas mínimas:** unitarias de `sus.ts` (todos 3 → 50; óptimo → 100; peor → 0; ítems incompletos → error).

---

## HU-09 — Sprints de mejora y tablero Kanban (8 SP · S4)

**Historia:** Como responsable de proyecto UX, quiero crear sprints y asignar tareas en el módulo SCRUM
para seguir su avance.

**Reglas:** RN-11, RN-14, RN-19.

**CA:**
1. Gestión mínima de integrantes del equipo de mejoras (nombre y rol libre).
2. **Planificar sprint:** nombre*, objetivo*, fechas*, capacidad en puntos*; columnas "Disponibles"
   (backlog) y "Seleccionadas" con responsable por historia; suma visible "16 de 21 puntos"; no se puede
   superar la capacidad (RN-11) y se explica cuántos puntos quedan.
3. Solo un sprint `ACTIVE` a la vez; "Iniciar sprint" pasa las historias seleccionadas a `TODO`.
4. **Tablero Kanban:** Pendiente, En progreso, En revisión, Terminado; mover tarjetas arrastrando **y**
   con el menú "Mover a…" (teclado); barra de progreso de puntos terminados / comprometidos.
5. Las tarjetas muestran código, título, puntos, responsable y severidad de origen.

**Pruebas mínimas:** unitarias de `capacity.ts`; e2e API: exceder capacidad → 409 `CAPACITY_EXCEEDED`;
segundo sprint activo → 409; Playwright: mover tarjeta con teclado.

---

## HU-10 — Sprint Review y Retrospectiva (3 SP · S4)

**Historia:** Como responsable de proyecto UX, quiero registrar review y retrospectiva en el sistema
para conservar acuerdos.

**Reglas:** RN-14.

**CA:**
1. "Cerrar sprint" (con confirmación) calcula entregadas (DONE) y pendientes; las pendientes vuelven al
   backlog conservando su orden.
2. **Review:** historias completadas vs inconclusas (automático), puntos entregados, notas y decisiones.
3. **Retrospectiva:** qué salió bien, qué salió mal, acuerdos (lista con responsable opcional).
4. Historial de sprints cerrados con su review y retro (solo lectura).

**Pruebas mínimas:** e2e API del cierre (pendientes regresan a `BACKLOG`); review/retro solo en sprint
cerrado → 409 `SPRINT_NOT_CLOSED` si no.

---

## HU-11 — Exportar informe (5 SP · S4)

**Historia:** Como investigador, quiero exportar hallazgos e historias aprobados en PDF y Markdown para
compartir resultados.

**Reglas:** RN-13.

**CA:**
1. Elegir plan, formato (PDF o Markdown) y secciones: resumen ejecutivo, metodología, participantes
   (solo códigos y perfiles), métricas por tarea, satisfacción (SUS), hallazgos aprobados por severidad,
   historias MX, lista de evidencias.
2. Vista previa antes de descargar.
3. **Nunca** incluye borradores ni descartados de IA ni datos personales; se avisa en pantalla.
4. Markdown: descargar `.md` y copiar al portapapeles. PDF: descargar con tildes y ñ correctas.
5. Los números del informe coinciden con el dashboard (mismas funciones de dominio).

**Tareas técnicas:** `GET /reports/:planId?sections=` (modelo de informe saneado) · `domain/report-markdown.ts`
en shared · PDF con `@react-pdf/renderer` en la web con fuente incrustada.

**Pruebas mínimas:** snapshot del Markdown del seed; prueba de que un DRAFT nunca aparece; PDF se genera
sin error y contiene "Diseño" con tilde (extraer texto en la prueba).

---

## HU-12 — Comparar evaluaciones (5 SP · S4)

**Historia:** Como investigador, quiero comparar resultados de evaluaciones registradas para medir si una
interfaz mejoró.

**Reglas:** RN-12, RN-06.

**CA:**
1. Elegir evaluación base y evaluación actual (se sugieren planes con la misma interfaz evaluada).
2. Tabla por tarea **equivalente** (misma `equivalenceKey`): valores base, actual y diferencia de
   completitud (puntos porcentuales), mediana de tiempo (%), errores promedio; flechas con texto
   ("mejoró"/"empeoró"), no solo color.
3. Tareas sin equivalente se listan como "Sin datos comparables" y **no** entran en los indicadores globales.
4. Indicadores globales calculados **solo** sobre tareas equivalentes; SUS promedio de cada lado si existe.
5. Aviso de muestra pequeña si un lado tiene menos de 5 sesiones cerradas; la comparación es descriptiva.

**Pruebas mínimas:** unitarias de `comparison.ts` (sin tareas comunes, una común, distinto número de
sesiones); e2e con el seed: Piloto vs Actual compara 2 tareas y marca "completar-pago" sin datos comparables.
