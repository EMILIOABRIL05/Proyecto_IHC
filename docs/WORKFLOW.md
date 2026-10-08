# Flujo de trabajo: Git, GitHub y agentes

Diagrama de ramas: [`diagrams/06-gitflow.md`](diagrams/06-gitflow.md).

## 1. Ramas (GitFlow adaptado)

| Rama | Sale de | Entra a | Para qué |
|---|---|---|---|
| `main` | — | — | Versión estable. Solo recibe `release/*` y `hotfix/*`. Cada sprint termina con un tag. |
| `develop` | `main` | — | Integración diaria. **Siempre compila y pasa CI.** Rama por defecto del repo. |
| `feature/HU-xx-descripcion` | `develop` | `develop` | Una historia (o una parte grande de ella). |
| `chore/DI-xx-descripcion` | `develop` | `develop` | Habilitadores e infraestructura. |
| `fix/HU-xx-descripcion` | `develop` | `develop` | Corrección de un bug encontrado antes del release. |
| `docs/descripcion` | `develop` | `develop` | Solo documentación. |
| `release/sprint-n` | `develop` | `main` y `develop` | Congelamiento 2 días antes de la Review: solo `fix`. |
| `hotfix/descripcion` | `main` | `main` y `develop` | Error grave en `main` después de un release. |

Nombres en minúsculas, palabras con guion, sin tildes ni ñ: `feature/HU-02-cronometro-sesion`.

**Versiones:** fin de S2 → `v0.2.0`, fin de S3 → `v0.3.0`, fin de S4 → `v1.0.0`. Hotfix → `v0.2.1`.

### Protección (la configura Emilio, admin del repo, en DI-04)
- `main` y `develop`: PR obligatorio, 1 aprobación, CI en verde, rama actualizada antes de fusionar, sin
  push directo ni force-push, sin borrar.
- Tipo de fusión permitido: **merge commit** (conserva los commits atómicos). Squash y rebase-merge
  desactivados para que la historia de cada HU quede visible.

## 2. Ciclo de una historia

```
Issue HU-xx (To Do)
  → Pablo/Manuel escriben los casos de prueba de aceptación en el Issue
  → responsable crea la rama feature/HU-xx-… desde develop  (Issue → In Progress)
  → plan corto + TDD + commits atómicos
  → git fetch && git rebase origin/develop  (antes de abrir el PR y cuando develop avance)
  → PR a develop con la plantilla: "Closes #n" solo el dueño de la HU, los demás "Refs #n"  (Issue → Review)
  → CI verde + revisión (rotación de TEAM.md §5) + revisión de accesibilidad si hay UI
  → merge commit → se borra la rama                       (Issue → Done cuando se fusiona el PR del dueño, por "Closes")
```

Reglas prácticas:
- **PR pequeños**: idealmente < 400 líneas cambiadas. Una HU de 8 SP puede ir en 2–3 PR
  (por ejemplo: dominio + API → pantalla → ajustes).
- Antes de pedir revisión: el autor ejecuta la verificación completa y pega el resultado en el PR.
- El revisor ejecuta la rama localmente si toca UI y prueba con teclado.
- Comentarios de revisión: se resuelven con commits nuevos (no se reescribe historia tras la revisión).
- **Migraciones:** una por PR. Si al hacer rebase otra rama ya agregó una migración, se borra la propia
  (aún no fusionada), se hace rebase y se **regenera**. Nunca se edita una migración fusionada.

## 3. Commits atómicos (Conventional Commits)

**Formato:**
```
<tipo>(<alcance>): <descripción en imperativo, minúscula, sin punto, ≤ 72 caracteres>

<cuerpo opcional: el porqué, no el qué>

Refs #12        (o Closes #12 en el último commit de la línea del dueño de la HU; ver TEAM.md §4)
```

**Tipos:** `feat` (funcionalidad), `fix` (corrección), `test` (solo pruebas), `refactor` (sin cambiar
comportamiento), `docs`, `style` (formato), `chore` (mantenimiento), `build` (dependencias o build),
`ci`, `perf`.

**Alcances:** `plans`, `sessions`, `evidence`, `metrics`, `ai`, `findings`, `improvements`, `sprints`,
`reports`, `shared`, `db`, `web`, `ui`, `a11y`, `infra`, `docs`.

**Qué es "atómico":**
- Un commit = un cambio lógico que se entiende solo y se puede revertir solo.
- Cada commit **compila y pasa sus pruebas**.
- No mezclar formato con lógica, ni migración con pantallas, ni dos HU en un commit.
- Prueba y código de una regla pueden ir juntos (`feat`) o en commits consecutivos (`test` → `feat`).

**Ejemplo (HU-01):**
```
feat(shared): agrega constantes de métricas y esquema PlanCreateInput
test(shared): cubre canStartSessions sin consentimiento (RN-01)
feat(shared): implementa reglas de estado del plan (RN-16)
feat(shared): detecta consignas que dirigen al participante (RN-02)
feat(plans): expone POST y PATCH /plans con validación Zod
feat(plans): bloquea cambios de tareas con sesiones iniciadas (RN-04)
test(plans): agrega e2e de creación de plan y tareas bloqueadas
feat(web): agrega paso 1 del asistente "Datos generales"
feat(web): agrega paso 2 "Tareas y criterios" con reordenar por teclado
feat(web): agrega paso 3 "Revisar y guardar" con lista de comprobación
fix(web): explica por qué "Guardar e iniciar" está deshabilitado
```

**Herramientas:** commitlint rechaza mensajes fuera de formato; lint-staged formatea y hace lint de los
archivos del commit; el *hook* `pre-push` ejecuta `pnpm typecheck`.

## 4. Issues y tablero (GitHub Projects)

- Un Issue por HU (plantilla `historia`), con sub-issues por tarea técnica (plantilla `tarea`) y
  estimación en horas (alimenta la matriz de planificación del docente).
- Etiquetas: `HU-xx`/`DI-xx`, `sprint-n`, `tipo:*`, `bug`, `bloqueado`.
- Columnas: **To Do → In Progress → Review → Done**. Un Issue `bloqueado` explica qué lo bloquea.
- Bugs: plantilla `bug` con pasos para reproducir, resultado esperado y real, captura. El QA (William)
  los prioriza.

## 5. Release de fin de sprint

1. Dos días antes de la Review: `git checkout -b release/sprint-n develop` y se publica.
2. Solo entran `fix/*` contra la rama `release`. Testers ejecutan los casos de aceptación y la suite E2E.
3. **Visto bueno de QA** (William) en el PR `release/sprint-n → main`.
4. Merge a `main`, tag `v0.n.0` con notas de la versión (HU incluidas), y merge de vuelta a `develop`.
5. La demo de la Review se hace desde el tag, con `pnpm db:reset && pnpm db:seed`.

## 6. Trabajo con agentes de código

Cada integrante trabaja su HU con su agente usando el prompt de [`AGENT_PROMPTS.md`](AGENT_PROMPTS.md).
El agente sigue `AGENTS.md`. Proceso recomendado (inspirado en la metodología *superpowers*):

1. **Entender** — el agente lee la HU, sus RN y dependencias, y repite en sus palabras qué va a hacer.
2. **Planificar** — lista de pasos de 2–5 minutos, cada uno con su prueba y su commit. La persona
   aprueba el plan.
3. **TDD** — rojo → verde → refactor en dominio y servicios; en UI, prueba de componente + axe.
4. **Verificar con evidencia** — ejecutar los comandos y mostrar la salida; nada se da por terminado
   "porque debería funcionar".
5. **Revisión** — antes del PR, pedir al agente una auto-revisión contra los CA, las RN y `RISKS.md`;
   luego la revisión humana de la rotación.
6. **Depuración sistemática** — ante un error: reproducir, aislar la causa raíz con evidencia, corregir
   y agregar una prueba que lo cubra. No "probar cosas" al azar.

**Para evitar que los agentes se pisen:**
- Cada persona trabaja solo en su rama y en las carpetas de su módulo (`TEAM.md` §3).
- Los contratos compartidos (`packages/shared/src/schemas`, `schema.prisma`) se cambian en un PR
  pequeño y separado, que se fusiona primero y se anuncia en el chat del equipo.
- Si un agente propone cambiar algo fuera de su HU, la persona decide y lo anota en el PR.
- Las decisiones nuevas se registran como ADR, para que el siguiente agente las conozca.
