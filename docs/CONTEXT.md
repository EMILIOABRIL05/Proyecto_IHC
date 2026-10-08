# Contexto del proyecto — Usability Test Dashboard

| Dato | Valor |
|---|---|
| Asignatura | Interacción Humano–Computador (HCI) |
| Institución | Universidad Técnica de Ambato — Carrera de Ingeniería de Software |
| Equipo | Grupo 6: Emilio Abril, Jonathan Gamboa, Pablo Lozada, Manuel Cusme, William Martínez |
| Product Owner | Ing. José Caiza, Mg. |
| Scrum Master | Manuel Cusme |
| Período | Julio – Diciembre 2026 (Sprints 1–4: 16 sep – 16 nov 2026, según la matriz del grupo) |
| Repositorio | https://github.com/EMILIOABRIL05/Proyecto_IHC |
| Prototipo (Figma) | [Usability Test Dashboard con IA y Scrum — Prototipo navegable](https://www.figma.com/design/ivPHjdwRsm1rR2fL8mYDmQ/Usability-Test-Dashboard-con-IA-y-Scrum-%E2%80%94-Prototipo-navegable?node-id=0-1) |

## 1. Visión del producto

**Product Goal:** disponer de una aplicación web para planificar pruebas de usabilidad, registrar
sesiones, analizar resultados, revisar sugerencias de IA y organizar mejoras.

El sistema acompaña el ciclo completo de una evaluación de usabilidad:

1. **Planificar** — plan de prueba con objetivo, perfil de participantes, modalidad, cupo y tareas con
   consignas neutrales y criterios de éxito. El consentimiento informado es obligatorio para iniciar sesiones.
2. **Registrar sesiones** — por participante anónimo (`P-001`), tarea por tarea: cronómetro
   (iniciar/pausar/reiniciar), resultado (sin ayuda / con ayuda / no completó), errores, observaciones y
   evidencias. Cuestionario SUS al cerrar (HU-13, extra).
3. **Consolidar métricas** — tasa de completitud, éxito sin ayuda, tiempo (mediana y media), errores,
   satisfacción (SUS, extra) y hallazgos recurrentes, con filtros por plan y período.
4. **Analizar con IA** — la IA agrupa y resume observaciones seleccionadas, las relaciona con las
   **10 heurísticas de Nielsen** y los **principios POUR (WCAG 2.2)**, asigna **severidad 0–4** con
   justificación y propone una historia de mejora. **La IA asiste, la persona decide.**
5. **Gestionar mejoras con Scrum** — los hallazgos aprobados se convierten en historias de mejora
   (**MX**), que se priorizan, se planifican en sprints con capacidad en puntos, se siguen en un tablero
   Kanban y se cierran con Sprint Review y Retrospectiva.
6. **Comparar y exportar** — comparación antes/después entre dos evaluaciones sobre **tareas
   equivalentes** y exportación del informe en PDF y Markdown, sin datos personales ni borradores de IA.

## 2. Glosario (importante para no confundir conceptos)

| Término | Significado |
|---|---|
| **HU-xx** | Historia de usuario **del producto académico** (lo que el Grupo 6 programa). Ver `BACKLOG.md`. |
| **MX-xxx** | Historia de mejora **dentro de la app**: la crean los usuarios del Dashboard a partir de hallazgos sobre la interfaz que están evaluando. No son tareas del Grupo 6. |
| **DI-xx** | Ítem de diseño del Sprint 1 (DI-01..03), como figura en la matriz. |
| **DI-04 / DI-05** | Listas de verificación técnicas (monorepo, BD, Docker, CI; layout y componentes base) que se cumplen **dentro** de las líneas de HU-01, HU-03 y HU-04 de la matriz. No son ítems de la matriz ni suman horas o puntos. |
| **Evaluación** | Un plan de prueba (`TestPlan`) con sus sesiones cerradas. Comparar = comparar dos planes. |
| **Tarea equivalente** | Tarea de dos planes distintos con la misma `equivalenceKey`; solo estas se comparan. |
| **Observación** | Texto registrado por quien modera durante una sesión, ligado a una tarea. |
| **Hallazgo (Finding)** | Propuesta generada por la IA a partir de una o más observaciones. Nace como borrador. |
| **Interfaz evaluada** | El producto que el usuario del Dashboard prueba (en la demo: "Checkout tienda universitaria"). |
| **Sprint académico** | Sprint del Grupo 6 (S1–S4). **Sprint de mejoras**: sprint dentro de la app (módulo Scrum). |

## 3. Estado actual

### Sprint 1 (16–30 sep 2026) — cerrado documentalmente
- Hecho: requisitos, 3 perfiles de uso, mapa de navegación, flujos, backlog HU-01..HU-12 con
  criterios y estimaciones, **12 bocetos de baja fidelidad**, **16 pantallas de alta fidelidad** en Figma
  enlazadas, guion y ensayo de escritorio (casos construidos S01–S03), informe de 35 páginas.
- **Pendiente** (se arrastra al inicio del Sprint 2):
  - Sprint Review con el PO y Retrospectiva del Sprint 1.
  - Validación del prototipo **con personas reales** (el ensayo fue de escritorio). Este test será la
    medición **"antes"** del proyecto (ver `TEAM.md`, tareas de testers).
  - Dos ajustes detectados: destacar **Continuar P-008** cuando el cupo está completo, y aclarar que
    **un fallo parcial de la IA no bloquea** revisar los grupos procesados.
  - Inconsistencia: la pantalla Resultados muestra una variación "frente al piloto" que contradice la
    regla de tareas equivalentes (se resuelve con RN-12).
  - La guía docente pide prototipos de **fidelidad media**; documentar una versión en escala de grises
    del Figma como evidencia de fidelidad media.

### Sprints 2–4 — desarrollo
| Sprint | Fechas | Meta | Historias |
|---|---|---|---|
| S2 | 1 – 15 oct 2026 | Núcleo de pruebas: planes, sesiones, evidencias, formularios accesibles | HU-01..HU-04 (26 SP) |
| S3 | 16 – 30 oct 2026 | Métricas, motor de IA, curaduría humana y backlog de mejoras | HU-05..HU-08 (26 SP) + HU-13 extra (2 SP) |
| S4 | 2 – 16 nov 2026 | Módulo Scrum de mejoras, comparativa, exportación, evaluación final | HU-09..HU-12 (21 SP) |

Detalle completo en [`BACKLOG.md`](BACKLOG.md) y asignaciones en [`TEAM.md`](TEAM.md).

## 4. Alcance

**Incluye:** todo lo descrito en §1; evaluación antes/después del propio sistema; módulo IA funcional
con modo simulado; módulo Scrum de mejoras completo; accesibilidad WCAG 2.2 AA en las pantallas propias.

**No incluye (decisiones tomadas):**
- Login, usuarios ni roles → [ADR-0002](adr/0002-sin-login.md). Se reconsidera solo si el PO lo pide.
- Despliegue en producción (la guía docente no lo requiere). Se entrega con Docker Compose.
- Entrenamiento de modelos de IA; integración con Jira/Azure DevOps.
- Pruebas estadísticas inferenciales: la comparación es **descriptiva** (muestras pequeñas) → [ADR-0006](adr/0006-metricas-descriptivas.md).

## 5. Lo que evalúa el docente (guía del proyecto integrador)

Rúbrica (10 puntos): diagnóstico 1.5 · UX/DCU 1.5 · prototipado y rediseño 1.5 · **implementación
funcional 2.0** · integración de IA 1.0 · módulo SCRUM 1.0 · evaluación y validación 1.0 · presentación 0.5.

Evidencias mínimas que el proyecto debe producir:
- Lista de problemas detectados y matriz de usabilidad aplicada a la versión inicial (prototipo).
- User flow, wireframes y prototipos de baja, media y alta fidelidad.
- Pantallas funcionales del sistema.
- Demostración del módulo IA con ejemplos de recomendaciones generadas.
- Demostración del módulo SCRUM con backlog, tablero y retrospectiva.
- Evaluación final y **comparación antes/después** (prototipo del Sprint 1 vs sistema implementado en S4,
  mismas tareas T1–T5, matriz + SUS).
- Presentación final con sustento técnico y UX.

Instrumentos: matriz de usability test, evaluación heurística, prueba de tareas con compañeros,
revisión de accesibilidad y comparativa antes/después.

## 6. Fundamentos HCI que usa el producto

### 10 heurísticas de Nielsen (códigos usados en el sistema)
| Código | Heurística |
|---|---|
| H1 | Visibilidad del estado del sistema |
| H2 | Correspondencia entre el sistema y el mundo real |
| H3 | Control y libertad del usuario |
| H4 | Consistencia y estándares |
| H5 | Prevención de errores |
| H6 | Reconocimiento antes que recuerdo |
| H7 | Flexibilidad y eficiencia de uso |
| H8 | Diseño estético y minimalista |
| H9 | Ayudar a reconocer, diagnosticar y recuperarse de errores |
| H10 | Ayuda y documentación |

### Principios POUR (WCAG 2.2)
`PERCEIVABLE` (Perceptible) · `OPERABLE` (Operable) · `UNDERSTANDABLE` (Comprensible) · `ROBUST` (Robusto).

### Escala de severidad (Nielsen) → [ADR-0003](adr/0003-escala-severidad.md)
| Valor | Nombre | Significado | Prioridad MX | Equivalencia plantillas (Alta/Media/Baja) |
|---|---|---|---|---|
| 0 | Sin problema | No es un problema de usabilidad | — (no genera historia) | — |
| 1 | Cosmético | Solo estética; arreglar si sobra tiempo | LOW | Baja |
| 2 | Menor | Causa duda o lentitud leve | MEDIUM | Media |
| 3 | Mayor | Confusión seria, errores o frustración | HIGH | Alta |
| 4 | Catastrófico | Impide completar la tarea o pierde datos | CRITICAL | Alta (crítica) |

### Métricas ISO 9241-11
Efectividad (completitud, errores) · Eficiencia (tiempo) · Satisfacción (SUS, extra). Definiciones exactas en
`BUSINESS_RULES.md` RN-06 y RN-20.

## 7. Fuentes de este contexto

- Informe técnico del Sprint 1 (Grupo 6, 35 págs., 27 sep 2026) — fuente principal de requisitos.
- Guía docente "Proyecto Integrador Final — Usability Test Dashboard 2.0" — alcance, rúbrica y evidencias.
- Plantilla "Usability Test Plan Dashboard" (xlsx) — campos del plan, guion, registro y hallazgos.
- Plantilla "Printed Usability Test Plan Dashboard" (Maya El Murr, Sketch) — checklist previo al test
  (aprobación ética, consentimiento, recordatorios). Solo referencia; no se copia su diseño.
- Presentación "Asistente IA para Pruebas de Usabilidad" — referencia del enfoque de IA (JSON
  estricto, validación, modo simulado, pruebas de fallos). No es código de este proyecto.
- Matriz de planificación Scrum (plantilla xlsx del docente) — formato de horas por sprint.
- Un intento previo generado con Google AI Studio se descartó como código; solo inspiró ideas de pantallas.
