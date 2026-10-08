# AGENTS.md — Instrucciones para agentes de código

> Este archivo es la **fuente única de instrucciones** para cualquier agente de IA que trabaje en este
> repositorio (Claude Code, Gemini CLI, GitHub Copilot, Codex, Cursor u otro). `CLAUDE.md`, `GEMINI.md`
> y `.github/copilot-instructions.md` solo apuntan aquí. Si algo de este archivo contradice a otro
> documento, **gana este archivo**; si dos documentos de `docs/` se contradicen, detente y pregunta.

## 1. Qué es este proyecto (en 5 líneas)

**Usability Test Dashboard**: aplicación web para planificar pruebas de usabilidad, registrar sesiones
con participantes, consolidar métricas, analizar observaciones con IA (heurísticas de Nielsen, POUR,
severidad 0–4) con **aprobación humana obligatoria**, gestionar las mejoras con un módulo Scrum interno
y exportar/comparar resultados. Proyecto académico de HCI, Universidad Técnica de Ambato, Grupo 6.
Contexto completo: [`docs/CONTEXT.md`](docs/CONTEXT.md).

## 2. Orden de lectura obligatorio antes de escribir código

1. Este archivo completo.
2. [`docs/CONTEXT.md`](docs/CONTEXT.md) — visión, alcance, glosario (no confundas **HU** con **MX**).
3. [`docs/TEAM.md`](docs/TEAM.md) — busca el nombre de la persona que te habla y **su asignación del sprint actual**.
4. [`docs/BACKLOG.md`](docs/BACKLOG.md) — la historia (HU) que vas a implementar: criterios de aceptación, tareas, dependencias.
5. [`docs/BUSINESS_RULES.md`](docs/BUSINESS_RULES.md) — reglas RN-xx que aplican a esa HU.
6. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) y [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — dónde va cada archivo y cómo son los datos.
7. Si la HU toca IA: [`docs/AI_MODULE.md`](docs/AI_MODULE.md). Si toca UI: [`docs/HCI_DESIGN.md`](docs/HCI_DESIGN.md).
8. [`docs/WORKFLOW.md`](docs/WORKFLOW.md) (ramas, commits, PR) y [`docs/TESTING.md`](docs/TESTING.md) (qué probar y cómo).
9. [`docs/RISKS.md`](docs/RISKS.md) — errores ya previstos; tu implementación debe evitarlos.

No leas todo de golpe si no hace falta: los pasos 1–5 siempre; 6–9 en la parte que toque tu HU.

## 3. Cómo trabajas una historia (procedimiento fijo)

1. **Confirma** con la persona: "Voy a trabajar HU-xx (<título>) en la rama `feature/HU-xx-…`". Si la HU
   depende de otra que aún no está en `develop` (ver dependencias en `BACKLOG.md`), avísalo antes de empezar.
2. **Rama**: `git checkout develop && git pull && git checkout -b feature/HU-xx-descripcion-corta`.
3. **Plan corto**: lista de tareas pequeñas (cada una = 1 commit atómico), qué reglas RN aplican y qué
   pruebas escribirás. Muéstraselo a la persona antes de programar.
4. **TDD** para dominio y servicios: primero el test que falla, luego el código mínimo, luego refactor.
5. **Commits atómicos** con Conventional Commits en español (ver `WORKFLOW.md` §3). Cada commit compila
   y pasa sus tests.
6. **Verifica antes de decir "listo"**: ejecuta y muestra la salida de
   `pnpm lint && pnpm typecheck && pnpm test` (y `pnpm test:e2e` si tocaste la API o un flujo).
   Nunca afirmes que algo funciona sin haber ejecutado la verificación.
7. **PR** hacia `develop` usando la plantilla, con `Closes #<issue>`. Pega el resumen de la verificación.

## 3.1 Modo sprint ("haz lo que me toca en el Sprint n")

Si la persona solo dice su nombre y el sprint (por ejemplo: "Soy Pablo, estamos en el Sprint 3, haz lo
que me corresponde"):

1. Si no dijo su nombre, **pregúntalo** antes de nada: la asignación depende de la persona.
2. En `docs/TEAM.md` §4 lista **todas las líneas** del sprint donde aparece esa persona. Cada línea es
   una tarea de la matriz oficial con sus horas (una historia reparte sus líneas entre 2–3 personas).
3. Revisa qué ya está hecho: `git fetch origin && git log origin/develop --oneline`, ramas remotas
   `feature/HU-xx-*` existentes y, si tienes acceso, los Issues y PR abiertos. No repitas trabajo hecho
   ni empieces una HU que otra persona ya tiene en curso.
4. Ordena los ítems según las dependencias de `docs/BACKLOG.md` y presenta un **plan del sprint**: orden,
   rama de cada ítem, qué depende de otra persona (y si ya está en `develop`) y las horas de la matriz
   (capacidad: 20 h por persona por sprint; avisa si la suma supera 20 h). Espera la aprobación.
5. Ejecuta **una línea a la vez** con el procedimiento de §3: una rama y un PR por línea
   (`feature/HU-xx-<capa>`, p. ej. `feature/HU-01-asistente-web`). Solo el dueño de la HU (TEAM.md §4)
   pone `Closes #n`; los demás `Refs #n`. Al abrir el PR de una, pasa a la siguiente solo si no depende
   de la anterior; si depende, avisa que hay que esperar la revisión y fusión.
6. Para ítems sin código (casos de aceptación, guion de prueba con usuarios, actas), produce el
   documento en la carpeta indicada en `docs/TESTING.md` o `docs/sprints/` y deja claro qué parte
   requiere personas reales (no inventes resultados de pruebas con usuarios).
7. Al terminar la sesión, deja un resumen: qué quedó en PR, qué falta y qué está bloqueado y por quién.

## 4. Reglas no negociables

- **No** hagas push a `main` ni a `develop`; todo entra por PR.
- **No** implementes funciones que no estén en `docs/BACKLOG.md`. Si algo falta, propón una HU nueva.
- **HU-13 (SUS)** es un **extra** fuera de la matriz: se hace al final del S3, con la holgura, después de las
  líneas de la matriz de esa persona. Si el PO la rechaza, se elimina.
- La planificación oficial es la **matriz del grupo** (reproducida en `TEAM.md` §4). Si la persona te pide
  algo que cambia sus tareas u horas, díselo: hay que actualizar la matriz y `TEAM.md`.
- **No** edites una migración de Prisma ya fusionada en `develop`; crea una nueva.
- **No** cambies esquemas de `packages/shared/src/schemas` sin decirlo explícitamente en el PR
  (rompe a otros módulos). Cambios de contrato → avisa al dueño del módulo afectado (`TEAM.md` §3).
- **No** modifiques código de otro módulo salvo lo mínimo para integrar; explícalo en el PR.
- **No** subas secretos. `.env` nunca se commitea; usa `.env.example`.
- **No** uses `any`, `@ts-ignore` ni desactives reglas de lint para "hacer pasar" algo.
- **No** borres ni debilites tests existentes para que pase el CI.
- **No** agregues dependencias sin justificarlas en el PR (qué resuelve y por qué no basta lo que hay).
- **No** guardes datos personales de participantes (nombres, correos, cédulas): solo códigos `P-001`.
- **La IA del producto sugiere, la persona decide**: nada generado por IA se guarda como definitivo ni
  entra al backlog sin una acción explícita de aprobación humana (RN-09).
- Las reglas de negocio se validan **en el servidor**; la UI además las anticipa (deshabilita y explica).

## 5. Idioma y estilo

- Identificadores de código, nombres de tablas y enums: **inglés**.
- Textos de la interfaz: **español (es-EC)**, claros y sin jerga técnica.
- Comentarios: español, breves, solo para explicar el *porqué*.
- Mensajes de commit y PR: español (tipo de commit en inglés: `feat`, `fix`…).
- TypeScript `strict`; formato con Prettier; lint con ESLint (incluye `jsx-a11y`).

## 6. Comandos del proyecto

Estos scripts los crea el trabajo técnico base **DI-04** (ver `BACKLOG.md`), que se cumple dentro de las
líneas de HU-01 (Manuel y William) y HU-03 (Pablo). Hasta que esté en `develop`, el repositorio solo
contiene documentación; quien haga su parte debe crear la estructura exactamente como dice
`ARCHITECTURE.md`.

```bash
corepack enable                 # activa pnpm según package.json
pnpm install                    # instala todo el monorepo
docker compose up -d db         # levanta PostgreSQL (dev) en el puerto 5432
pnpm db:migrate                 # aplica migraciones de Prisma
pnpm db:seed                    # carga el caso demo "Checkout tienda universitaria"
pnpm dev                        # API (http://localhost:3000) + web (http://localhost:5173)
pnpm lint && pnpm typecheck     # calidad estática
pnpm test                       # unitarias (shared, api, web)
pnpm test:e2e                   # e2e de API (BD de prueba) + Playwright
```

## 7. Cuándo detenerte y preguntar a la persona

- Dos documentos se contradicen o un criterio de aceptación es ambiguo.
- La tarea exige cambiar el modelo de datos o un contrato compartido de otro módulo.
- Una dependencia (otra HU) no está lista.
- La verificación falla y la causa está fuera de tu HU.
- Te piden algo fuera del backlog o que viola §4.

Cuando se tome una decisión nueva de diseño, se registra como ADR en `docs/adr/` (ver plantilla en
`docs/adr/README.md`).

## 8. Definición de terminado (DoD)

Una HU está terminada cuando: cumple **todos** sus criterios de aceptación; tiene pruebas según
`TESTING.md` y pasan; `axe` no reporta violaciones en sus pantallas; funciona solo con teclado; el PR
fue revisado y aprobado por otra persona; está fusionada en `develop`; se puede demostrar con los datos
del seed; y la documentación afectada está actualizada.
