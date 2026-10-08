# Equipo, roles y asignaciones

> **Fuente de verdad de la planificación:** la matriz oficial del grupo
> (`PJT_Dashboard_Usabilidad_IA_MATRIZ_PLANIFICACION_GRUPO6_CORREGIDA`). Las tablas de §4 reproducen sus
> tareas y horas **línea por línea**. Lo que el equipo agrega encima de la matriz está marcado como **extra** y
> nunca cambia sus líneas ni sus horas. Si la matriz cambia, se cambia este archivo en el mismo PR.

## 1. Roles

Los roles formales existen para la documentación Scrum y para repartir responsabilidades extra. La matriz
cuenta **5 desarrolladores**: todos programan, cada uno con su agente de código.

| Integrante | Rol formal | Responsabilidad extra (además de programar) |
|---|---|---|
| **Emilio Abril** | Developer | **Administrador del repositorio** (es el dueño en GitHub): ramas protegidas, colaboradores, GitHub Projects, etiquetas, CI, releases y tags. Revisar la arquitectura y la estructura del monorepo, `packages/shared/src/domain`, mantener `develop` en verde, resolver conflictos de integración. |
| **Jonathan Gamboa** | Developer | Revisa cambios de contratos compartidos. |
| **William Martínez** | QA | Dueño de `TESTING.md` y de la calidad: umbrales de cobertura, revisión de accesibilidad (axe + teclado + lector de pantalla), **visto bueno de QA** en cada rama `release/*`, triaje de bugs. Integración continua y estructura de UI (DI-05, dentro de su línea de HU-01). |
| **Pablo Lozada** | Tester | Esquema de BD y seed (su línea de HU-03). Escribe los **casos de prueba de aceptación** de cada HU; pruebas exploratorias; conduce las pruebas de usabilidad con personas (antes y después). |
| **Manuel Cusme** | Tester + **Scrum Master** | Ceremonias (planning, review, retro), tablero del proyecto, actas en `docs/sprints/`, **matriz de planificación de horas**, informe final; casos de prueba y reportes de bugs. Raíz del monorepo y Docker (su línea de HU-01). |

## 2. Capacidad y calendario

Matriz oficial: 2 h/día × 5 días/semana = 10 h/semana; sprint de 2 semanas = **20 h por persona** →
**100 h por sprint** para el equipo. Lo planificado en la matriz es 86 h (S2), 84 h (S3) y 84 h (S4); el resto
es holgura para imprevistos (hoja "Tareas no Planificadas").

| Sprint | Fechas (matriz) | Horas planificadas | SP | Congelamiento (`release/*`) | Review + Retro |
|---|---|---|---|---|---|
| S1 | 16 – 30 sep 2026 | 82 h | — (DI-01..03) | — | **pendientes de registrar** |
| S2 | 1 – 15 oct 2026 | 86 h | 26 | 14 oct | 15 oct |
| S3 | 16 – 30 oct 2026 | 84 h (+ 8 h del extra HU-13) | 26 (+ 2 del extra) | 29 oct | 30 oct |
| S4 | 2 – 16 nov 2026 | 84 h | 21 | 13 nov | 16 nov |

Los días de congelamiento son una propuesta (1 día hábil antes del cierre). Hoy es 6 oct: **el S2 ya
empezó y quedan 8 días hábiles**. Al ritmo de la matriz (2 h/día) son ≈ 16 h por persona y el S2 pide
16–18 h; si no se avanzó del 1 al 5 oct, hay que subir las horas diarias o recortar alcance con el PO.

Horas por persona (suma de sus líneas en la matriz):

| | Emilio | Jonathan | Pablo | Manuel | William | Total |
|---|---|---|---|---|---|---|
| S2 | 18 | 18 | 18 | 16 | 16 | 86 |
| S3 | 16 | 18 | 16 | 18 | 16 | 84 |
| S4 | 16 | 18 | 16 | 18 | 16 | 84 |

Extra no incluido en esa tabla: **HU-13 (SUS)**, S3, William 4 h y Pablo 4 h (usa la holgura).

## 3. Dueños de módulo

El dueño revisa con prioridad los PR que tocan su módulo y decide sobre cambios de su contrato.

| Módulo (carpetas) | Dueño | Respaldo |
|---|---|---|
| Raíz del monorepo, Docker, `apps/api` (endpoints de `sessions`, `results`, `ai`, `improvements`), `docs/` | Manuel | Pablo |
| BD: `apps/api/prisma`, persistencia de backlog y de review/retro, comparación | Pablo | Manuel |
| `apps/web` base (rutas, `components/ui`, layout, accesibilidad), CI, prompt y esquema de IA, métricas, `export` | William | Emilio |
| GitHub (ramas, Projects), `sessions` (web: ejecución), backlog MX (web), review y retro (web), filtros del dashboard, `packages/shared/src/domain` | Emilio | William |
| `plans` (web), `evidence`, `ai-review` (web), tablero de `improvements` (web) | Jonathan | Emilio |

## 4. Asignación por sprint (tareas de la matriz)

Cada **línea** es una tarea de una persona con sus horas. Una historia reparte sus líneas entre 2–3
personas; **cada línea tiene su propia rama y PR** (`feature/HU-xx-<capa>`, por ejemplo
`feature/HU-01-asistente-web`). El **dueño de la HU** es quien cierra el Issue: su PR (el último en
fusionarse) lleva `Closes #n`; los demás usan `Refs #n`. Las líneas se ordenan por las dependencias de
[`BACKLOG.md`](BACKLOG.md).

### Sprint 2 — Núcleo de pruebas (1–15 oct) · 86 h

> **Objetivo (matriz):** Entregar el flujo funcional de planificación y ejecución de pruebas.  
> **Criterio de terminado (matriz):** Planes y sesiones se guardan y consultan; formularios y errores están verificados.

| HU | Persona | Tarea (matriz) | Horas | Incluye / depende de |
|---|---|---|---|---|
| HU-01 | Manuel | Preparar NestJS, contratos de datos y validación de entrada | 8 | **Va primero.** Incluye la raíz del monorepo, `packages/shared`, `apps/api` base y Docker (DI-04, ver BACKLOG) |
| HU-01 | William | Preparar estructura React, rutas y componentes del flujo | 8 | Incluye `apps/web` base, CI y DI-05 (layout, tokens, componentes). Depende de la raíz |
| HU-03 | **Pablo** (dueño) | Diseñar base de datos para planes, sesiones y evidencias | 10 | Esquema Prisma completo, migración y seed. Depende de la raíz |
| HU-01 | **Jonathan** (dueño) | Implementar formulario guiado para configurar planes y tareas | 10 | Incluye `equivalenceKey`. Depende de la estructura web y los contratos |
| HU-03 | William | Implementar persistencia y consulta de planes y sesiones | 8 | Depende del esquema de BD |
| HU-02 | Manuel | Crear endpoints para sesiones, tiempos, éxito y errores | 8 | Depende del esquema de BD y los contratos |
| HU-02 | **Emilio** (dueño) | Implementar ejecución de tareas y captura de observaciones | 10 | Depende de los endpoints de sesiones |
| HU-03 | Jonathan | Agregar carga opcional de evidencias con validación (RN-15) | 8 | Depende de la persistencia |
| HU-04 | **Emilio** (dueño) | Añadir estados, errores y accesibilidad básica a formularios | 8 | Depende de los formularios de HU-01 y HU-02 |
| HU-04 | Pablo | Probar flujo integral y corregir fallos de registro | 8 | Casos de aceptación desde el día 1; flujo al final |

Emilio, como admin del repo, también deja listo `develop`, las protecciones, las etiquetas y el
GitHub Project antes del primer PR (no suma horas de la matriz). Si Manuel se retrasa con la raíz, Emilio
apoya (tiene 2 h de holgura).

**Estado al 6 oct:** la raíz, la BD y la estructura web ya están construidas por Emilio (apoyo) en tres PR; a Manuel, Pablo y William les queda revisar su PR y completar su línea. Detalle por línea en [`BACKLOG.md`](BACKLOG.md) (sección DI-04).

Ruta crítica del S2: raíz → BD (Pablo) → endpoints (Manuel) → ejecución (Emilio). Mientras la raíz y la BD
no estén en `develop`, el resto escribe contratos, casos de aceptación y pantallas sin datos.

### Sprint 3 — Métricas e IA (16–30 oct) · 84 h

> **Objetivo (matriz):** Entregar análisis de resultados, asistencia de IA y backlog dentro del sistema.  
> **Criterio de terminado (matriz):** Métricas verificadas; IA maneja errores y permite revisión humana; backlog funciona.

| HU | Persona | Tarea (matriz) | Horas | Depende de |
|---|---|---|---|---|
| HU-06 | William | Definir prompt, esquema JSON y validación de respuestas (`docs/AI_MODULE.md`) | 8 | — **(contrato de IA primero)** |
| HU-05 | William | Definir métricas y consultas con datos de sesiones (`domain/metrics.ts`) | 8 | seed de S2 |
| HU-06 | **Pablo** (dueño) | Integrar proveedor IA y modo demostración controlado (`MockProvider` y luego Gemini) | 8 | contrato de IA |
| HU-06 | Manuel | Crear endpoint de resumen, categorías y severidad | 8 | contrato de IA |
| HU-05 | Manuel | Crear endpoints de indicadores y filtros de resultados | 10 | `domain/metrics.ts` |
| HU-05 | **Jonathan** (dueño) | Implementar dashboard de resultados y gráficos | 10 | endpoints de indicadores |
| HU-05 | Emilio | Agregar filtros, etiquetas y estados vacíos del dashboard | 8 | dashboard base |
| HU-07 | **Jonathan** (dueño) | Mostrar sugerencias IA editables y aprobación humana (RN-09, RN-10) | 8 | endpoint de IA |
| HU-08 | **Emilio** (dueño) | Crear interfaz de historias y prioridades del backlog | 8 | aprobación de HU-07 |
| HU-08 | Pablo | Persistir historias y vínculo con hallazgos de usabilidad | 8 | aprobación de HU-07 |
| HU-13 (extra) | William, Pablo | Cuestionario SUS al cerrar la sesión (no está en la matriz; usa la holgura: William 4 h, Pablo 4 h) | 8 | HU-02 |

### Sprint 4 — Scrum de mejoras, comparativa, exportación (2–16 nov) · 84 h

> **Objetivo (matriz):** Completar la gestión de sprints, exportación y evaluación del sistema.  
> **Criterio de terminado (matriz):** Sprints, tablero y retrospectiva funcionan; exportación y evaluación están documentadas.

| HU | Persona | Tarea (matriz) | Horas | Depende de |
|---|---|---|---|---|
| HU-09 | William | Definir objetivo, capacidad y tareas de cada sprint (`domain/capacity.ts`, RN-11, RN-14) | 8 | HU-08 |
| HU-09 | Manuel | Crear servicios para sprints, responsables y tablero | 10 | dominio de capacidad |
| HU-09 | **Jonathan** (dueño) | Implementar tablero con estados y responsables (con "Mover a…" por teclado) | 10 | servicios de sprints |
| HU-10 | **Emilio** (dueño) | Implementar vistas de review y retrospectiva | 8 | HU-09 |
| HU-10 | Pablo | Persistir entregas, pendientes y acuerdos del sprint | 8 | HU-09 |
| HU-11 | **William** (dueño) | Generar informe exportable en Markdown y PDF (RN-13) | 8 | HU-05, HU-07, HU-08 |
| HU-11 | Manuel | Verificar integración, exportación y manejo de errores | 8 | exportación |
| HU-12 | **Pablo** (dueño) | Implementar comparación de dos evaluaciones y documentar evidencias | 8 | `equivalenceKey` (HU-01), HU-05 |
| HU-12 | Jonathan | Aplicar tareas de usabilidad al sistema con participantes (medición "después") | 8 | sistema casi completo (2.ª semana) |
| HU-12 | Emilio | Ajustar interfaz según hallazgos y accesibilidad | 8 | resultados de la prueba |

Con la holgura del S4 (2–4 h por persona) se hacen la suite E2E T1–T5 y la auditoría de accesibilidad
final (William y Pablo) y el informe final (Manuel, con la sección de cada quien).

## 5. Revisión de PR (rotación)

Cada PR necesita 1 aprobación. Revisor por defecto (rotación circular):

| Autor del PR | Revisa |
|---|---|
| Emilio | Jonathan |
| Jonathan | Pablo |
| Pablo | William |
| William | Manuel |
| Manuel | Emilio |

Además: cambios en `packages/shared/src/schemas` o `prisma/schema.prisma` → también revisa Emilio;
cambios en pantallas → William revisa accesibilidad (puede ser segunda aprobación opcional).

## 6. Ceremonias

| Ceremonia | Cuándo | Duración | Registro |
|---|---|---|---|
| Sprint Planning | Primer día del sprint | 1 h | `docs/sprints/sprint-n/planning.md` + Issues en GitHub Projects |
| Daily (asíncrona) | Cada día de trabajo | 5 min | Mensaje: ayer / hoy / impedimentos (grupo de chat o comentario en el Issue) |
| Sprint Review | Último día | 45 min | `docs/sprints/sprint-n/review.md` (demo con el seed) |
| Retrospectiva | Último día, tras la review | 30 min | `docs/sprints/sprint-n/retro.md` |

La matriz de horas (xlsx del docente) se llena con las tareas de los Issues: estimado al planificar, real
al cerrar. Lo no previsto va en la hoja "Tareas no Planificadas".
