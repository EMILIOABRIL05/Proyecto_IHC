# Prompts para los agentes de código

Copia el prompt que te corresponde y pégalo al iniciar una sesión con tu agente (Claude Code, Gemini
CLI, Copilot Chat en modo agente, Codex, Cursor…) **abierto en la raíz del repositorio**. Cambia solo
lo que está entre `<…>`. El agente obtiene todo lo demás de `AGENTS.md` y `docs/`.

## 0. Prompt corto (modo sprint) — el más simple

```text
Soy <NOMBRE> del Grupo 6 y estamos en el Sprint <n>. Lee AGENTS.md y haz lo que me corresponde en este
sprint siguiendo su "modo sprint" (§3.1). Empieza mostrándome el plan.
```

El agente busca tus ítems en `docs/TEAM.md`, revisa qué ya existe en `develop`, propone el orden y
trabaja línea por línea (una rama y un PR por línea de la matriz), pidiéndote aprobación en cada plan. Usa
los prompts de abajo cuando quieras dirigirlo a una sola historia o darle indicaciones específicas.

## 1. Prompt base (cualquier historia)

```text
Soy <NOMBRE>, integrante del Grupo 6 (rol: <Developer|QA|Tester>). Vamos a trabajar <HU-xx / DI-xx>
del Sprint <n>.

1. Lee AGENTS.md completo y sigue su orden de lectura de docs/.
2. En docs/TEAM.md confirma que <HU-xx> me corresponde y quién me apoya.
3. En docs/BACKLOG.md lee la historia completa; en docs/BUSINESS_RULES.md las reglas que cita.
4. Revisa las dependencias: si alguna HU necesaria no está fusionada en develop, dímelo antes de seguir.
5. Antes de escribir código, preséntame:
   - un resumen de lo que entendiste (en 5 líneas),
   - el nombre de la rama,
   - el plan de tareas pequeñas (cada una = un commit atómico, con su mensaje propuesto),
   - las pruebas que escribirás para cada criterio de aceptación y cada regla RN,
   - los riesgos de docs/RISKS.md que aplican y cómo los evitas.
6. Espera mi aprobación. Luego trabaja con TDD, un commit por tarea, y muéstrame la salida de
   `pnpm lint && pnpm typecheck && pnpm test` (y `pnpm test:e2e` si aplica) antes de decir que terminaste.
7. Al final redacta la descripción del PR con la plantilla de .github/PULL_REQUEST_TEMPLATE.md.

No implementes nada fuera de esta historia. Si encuentras una contradicción en los documentos, detente
y pregúntame.
```

## 2. Sprint 2 — qué le toca a cada quien (matriz)

Con el prompt corto de §0 el agente ya sabe qué hacer. Estos prompts son para **dirigirlo a una línea
concreta**. Donde aparece `[prompt base, pasos 1 a 7]`, pega el prompt base de §1 (con tus datos).
Orden del sprint: raíz (Emilio) → BD (Pablo) → API (Manuel) → pantallas.

**Manuel — HU-01 NestJS y raíz (8 h, va primero) y HU-02 endpoints (8 h):**
```text
Soy Manuel Cusme (Tester y Scrum Master). Sprint 2. (1) HU-01 "preparar NestJS, contratos de datos y
validación de entrada", que incluye la raíz del monorepo y el DI-04 de docs/BACKLOG.md: pnpm workspace,
TypeScript 6.0.x (no 7), tsconfig base, ESLint/Prettier, Husky + commitlint, packages/shared con tsup,
apps/api base (health, Swagger, ZodValidationPipe, filtro de errores), docker-compose.yml, .env.example y
scripts. Antes de instalar, consulta las versiones actuales y fíjalas exactas. Rama chore/DI-04-raiz; presenta
el plan de commits y espera mi aprobación. (2) HU-02 "endpoints de sesiones, tiempos, éxito y errores":
RN-08 (cronómetro con reloj del servidor), RN-21 (versiones), RN-03 y RN-05; lee
docs/diagrams/04-secuencias.md §1. Un PR por línea.
```

**William — HU-01 estructura React + DI-05 (8 h) y HU-03 persistencia (8 h):**
```text
Soy William Martínez (QA). Sprint 2. (1) HU-01 "estructura React, rutas y componentes del flujo", que incluye
DI-05 y el CI: apps/web base (Vite, Tailwind, shadcn, Router, Query, Vitest + axe, Playwright), layout, tokens
del Figma del Sprint 1 con contraste AA calculado, componentes base, página /design y .github/workflows/ci.yml
(docs/BACKLOG.md DI-05, docs/HCI_DESIGN.md, docs/TESTING.md §6). Depende de la raíz de Manuel. (2) HU-03
"persistencia y consulta de planes y sesiones" en la API, sobre el esquema de Pablo. Un PR por línea.
Crea también docs/testing/a11y-checklist.md.
```

**Pablo — HU-03 base de datos (10 h) y HU-04 pruebas (8 h):**
```text
Soy Pablo Lozada (Tester). Sprint 2. (1) HU-03 "diseñar base de datos": esquema Prisma completo de
docs/DATA_MODEL.md (Prisma 7 con prisma.config.ts y @prisma/adapter-pg), migración inicial y seed idempotente
de docs/BACKLOG.md §Seed; verifica con un clon limpio. Depende de la raíz de Manuel. Rama feature/HU-03-bd.
Eres el dueño de HU-03. (2) HU-04 "probar flujo integral": escribe primero los casos de aceptación Gherkin de
HU-01..HU-04 (docs/TESTING.md §3) y al final ejecuta el flujo T1 y corrige los fallos de registro.
```

**Jonathan — HU-01 formulario (10 h) y HU-03 evidencias (8 h):**
```text
Soy Jonathan Gamboa (Developer). Sprint 2. (1) HU-01 "formulario guiado para configurar planes y tareas",
con la equivalenceKey; RN-01, RN-02, RN-04, RN-16. Eres el dueño de HU-01 (Closes #n). (2) HU-03 "carga de
evidencias con validación" (RN-15). Un PR por línea.
```

**Emilio — HU-02 ejecución (10 h) y HU-04 formularios (8 h) + GitHub:**
```text
Soy Emilio Abril (Developer y admin del repo). Sprint 2. (0) Antes del primer PR, deja listo GitHub según
docs/BACKLOG.md DI-04 (último punto): develop por defecto, protecciones, etiquetas y GitHub Project; dime los
pasos manuales que yo deba hacer en la web. (1) HU-02 "ejecución de tareas y captura de observaciones": la pantalla
de ejecución con cronómetro, resultado, errores y observaciones, sobre los endpoints de Manuel. Eres el dueño de
HU-02. Presta atención a RN-08, RN-21 y a los riesgos D1–D4 de docs/RISKS.md. (2) HU-04 "estados, errores y
accesibilidad básica de formularios" en HU-01 y HU-02 (docs/TESTING.md §5). Mientras la raíz de Manuel no esté
en develop, ofrécete a ayudar con ella (tienes 2 h de holgura).
```

## 3. Sprints 3 y 4

Usa el prompt base con la línea que te asigna `TEAM.md` §4 (cada HU se reparte en 2–3 personas). Añade según el caso:
- **HU-05 (William: métricas) / HU-12 (Pablo: comparación):** "Las fórmulas están en BUSINESS_RULES.md RN-06 y RN-12; implementa primero
  `shared/domain/metrics.ts` y `comparison.ts` con TDD y valores calculados a mano sobre el seed."
- **HU-06 (Pablo proveedor, William prompt y esquema, Manuel endpoint):** "Lee docs/AI_MODULE.md completo. Empieza por el MockProvider y las pruebas de cada
  fila de §6; el GeminiProvider va al final. Confirma en la documentación oficial de Structured outputs
  el nombre de los campos de configuración del SDK instalado."
- **HU-07 (Jonathan) y HU-08 (Emilio interfaz, Pablo persistencia):** "Lee RN-09, RN-10, RN-19 y docs/diagrams/04-secuencias.md §3. La
  aprobación es una transacción idempotente."
- **HU-09 (William, Manuel, Jonathan) / HU-10 (Emilio, Pablo):** "Lee RN-11, RN-14, RN-19 y docs/diagrams/03-estados.md. El tablero debe operarse sin
  arrastrar (menú 'Mover a…')."
- **HU-11 (William exportación, Manuel verificación):** "Lee RN-13. El modelo del informe se arma en el servidor; el Markdown en shared; el
  PDF en la web con fuente incrustada."
- **HU-13 (extra: William y Pablo, al final del S3):** "Lee RN-20 y ADR-0004."

## 4. Prompts de apoyo

**Testers — casos de aceptación antes de programar:**
```text
Lee AGENTS.md, docs/BACKLOG.md (<HU-xx>), docs/BUSINESS_RULES.md y docs/TESTING.md §3.
Escribe los escenarios Gherkin en español para cada criterio de aceptación y cada regla RN de <HU-xx>,
incluyendo casos borde y de error (con el código de error esperado). No escribas código.
Entrégalos en Markdown para pegarlos en el Issue de la historia.
```

**Revisor de PR (cualquier integrante):**
```text
Lee AGENTS.md. Revisa el PR de la rama <rama> contra develop:
1. ¿Cumple cada criterio de aceptación de <HU-xx> (docs/BACKLOG.md)? Señala los que falten.
2. ¿Respeta las reglas RN que aplican y los riesgos de docs/RISKS.md?
3. ¿Hay pruebas para cada regla y pasan? Ejecuta `pnpm lint && pnpm typecheck && pnpm test`.
4. ¿Commits atómicos y con formato correcto? ¿Toca archivos fuera de su módulo?
5. Accesibilidad: ¿labels, foco, teclado, contraste, estados con texto?
Devuelve una lista de hallazgos ordenada por gravedad, con archivo y línea. No cambies código.
```

**QA — auditoría de accesibilidad de una pantalla:**
```text
Lee docs/TESTING.md §5 y docs/HCI_DESIGN.md §6. Audita la pantalla <ruta> ejecutando axe con Playwright
y revisando el código de sus componentes. Entrega una tabla: problema, criterio WCAG 2.2, severidad 0–4,
archivo y corrección propuesta. Después agrega el resultado a docs/testing/a11y-checklist.md.
```

**Scrum Master — actas:**
```text
Lee docs/TEAM.md y docs/sprints/README.md. Con estas notas <pega tus notas>, redacta
docs/sprints/sprint-<n>/<planning|review|retro>.md usando la plantilla. No inventes datos: si falta
algo, déjalo marcado como pendiente.
```
