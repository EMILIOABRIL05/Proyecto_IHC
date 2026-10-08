# Reglas de negocio

Cada regla tiene un identificador `RN-xx` que se cita en historias, código (comentario breve) y pruebas.
**Toda regla se valida en el servidor**; la interfaz además la anticipa (deshabilita la acción y explica
el motivo con texto). Las reglas puras viven en `packages/shared/src/domain/` y se prueban con TDD.

Diagramas de estado: [`diagrams/03-estados.md`](diagrams/03-estados.md).

## Planes y sesiones

**RN-01 — Consentimiento informado.** Un plan puede guardarse con `consentReady = false`, pero **no se
puede iniciar ninguna sesión** mientras: (a) el plan no tenga `consentReady = true`, o (b) el
participante no tenga `consentAt` registrado (casilla obligatoria al crear la sesión).
Error: `409 CONSENT_REQUIRED`. Una vez que el plan tiene sesiones, `consentReady` ya no puede volver a `false`.

**RN-02 — Consignas neutrales.** Al guardar una tarea se buscan expresiones que dirigen al participante
(sin distinguir mayúsculas ni tildes): `haz clic`, `hacer clic`, `clic en`, `pulsa`, `presiona`,
`botón`, `boton`, `menú`, `menu`, `pestaña`, `selecciona la opción`, `ícono`, `icono`. Si aparecen, se
devuelve una **advertencia** (no bloquea) con la sugerencia: "Describe el objetivo, no la ruta. Ej.:
'Compra el cuaderno A4' en lugar de 'Haz clic en el botón Comprar'".

**RN-03 — Cupo de participantes.** Si el número de sesiones del plan ≥ `targetParticipants`, no se
pueden crear sesiones nuevas (`409 QUOTA_FULL`), pero sí **continuar** las que están abiertas; la UI
destaca "Continuar" en esas sesiones.

**RN-04 — Tareas bloqueadas.** Desde que el plan tiene su primera sesión (`IN_PROGRESS`), no se pueden
agregar, eliminar ni reordenar tareas ni cambiar su `equivalenceKey` (`409 TASKS_LOCKED`). Sí se puede
corregir la ortografía de consigna/resultado esperado/criterio.

**RN-05 — Cierre de sesión.** Una sesión pasa a `CLOSED` solo si **todas** las tareas del plan tienen
resultado (`409 INCOMPLETE_RESULTS`) y tras una confirmación explícita. Una sesión `CLOSED` no se
modifica (`409 SESSION_CLOSED`).

**RN-16 — Estados del plan.**
- `DRAFT → READY`: todos los campos obligatorios y ≥ 1 tarea completa (cálculo automático al guardar).
- `READY → DRAFT`: si deja de cumplirse lo anterior (solo antes de tener sesiones).
- `READY → IN_PROGRESS`: al crear la primera sesión.
- `IN_PROGRESS → CLOSED`: acción manual "Cerrar plan", solo si ninguna sesión está `IN_PROGRESS` o
  `IN_REVIEW` (`409 OPEN_SESSIONS`). `CLOSED` es final: no admite sesiones (`409 PLAN_CLOSED`).
- No se crean sesiones en planes `DRAFT` (`409 PLAN_NOT_READY`).

**Estados de sesión:** `IN_PROGRESS → IN_REVIEW` (revisión previa al cierre) · `IN_REVIEW →
IN_PROGRESS` (volver a editar) · `IN_REVIEW → CLOSED` (RN-05).

**RN-08 — Cronómetro confiable.** Cada resultado de tarea guarda `elapsedMs` (acumulado) y
`timerStartedAt` (no nulo mientras corre). Tiempo actual = `elapsedMs + (ahora − timerStartedAt)`.
- Iniciar/pausar/reiniciar se envían al servidor como **acciones**; el servidor usa **su** reloj y
  responde `serverNow`, con el que el cliente calcula su desfase. Así una recarga o un reloj local
  desajustado no altera el tiempo.
- Pausar consolida: `elapsedMs += ahora − timerStartedAt; timerStartedAt = null`.
- Cambiar de tarea pausa automáticamente la tarea actual.
- Si al reanudar el cronómetro lleva corriendo más de **2 horas**, se pregunta si se olvidó pausarlo
  y se permite corregir el tiempo manualmente (queda registrado `timeAdjusted = true`).

**RN-21 — Concurrencia.** `TestPlan` y `Session` tienen `version`. Toda escritura envía la versión
leída; si no coincide → `409 VERSION_CONFLICT` con mensaje "Otra persona actualizó este registro.
Recarga para ver los cambios". El cliente **serializa** sus propias escrituras (una a la vez) para no
generar conflictos consigo mismo durante el autoguardado.

## Métricas

**RN-06 — Definiciones** (`domain/metrics.ts`). Solo se usan resultados de sesiones `CLOSED` (filtradas
por `closedAt` dentro del período). Para cada tarea *t* con *n* resultados:
U = sin ayuda, A = con ayuda, F = no completó.

| Métrica | Fórmula |
|---|---|
| Tasa de completitud | (U + A) / n |
| Éxito sin ayuda | U / n |
| Con ayuda / No completó | A / n · F / n |
| Tiempo (mediana y media) | sobre `elapsedMs` de resultados U o A (las fallidas no cuentan); mediana con número par = promedio de los dos centrales |
| Errores promedio | Σ errores / n |
| Indicadores globales | agregación de **todos** los resultados (no promedio de promedios) |
| SUS promedio | media de `susScore` de las sesiones que lo tienen (RN-20) |

Se calcula con precisión completa y se **redondea solo al mostrar** (porcentajes con 1 decimal,
tiempos en `mm:ss`).

**RN-07 — Sin datos no hay números inventados.** Si *n* = 0 la métrica es `null` y la interfaz muestra
"Sin datos" o un estado vacío que explica qué hacer ("Cierra al menos una sesión para ver métricas").
Nunca `NaN`, `Infinity` ni 0 % falsos.

**RN-12 — Comparación de evaluaciones** (`domain/comparison.ts`).
- Tareas equivalentes = claves `equivalenceKey` presentes en **ambos** planes con ≥ 1 resultado en cada uno.
- Por tarea equivalente: valores base y actual (RN-06) y diferencias: completitud en puntos porcentuales
  (actual − base); mediana de tiempo en % ((actual − base) / base × 100, `null` si base es `null` o 0);
  errores promedio (actual − base).
- Indicadores globales de la comparación: **solo** con resultados de tareas equivalentes.
- Tareas sin equivalente → lista "Sin datos comparables".
- Si algún lado tiene < 5 sesiones cerradas → aviso de muestra pequeña. La comparación es **descriptiva**
  (ver ADR-0006); no se afirma significancia estadística.

**RN-20 — SUS** (`domain/sus.ts`). 10 respuestas enteras 1–5, todas obligatorias. Ítems impares:
`v − 1`; pares: `5 − v`; puntaje = suma × 2.5 (0–100). Interpretación: < 68 "Por debajo del promedio",
68–80.2 "Aceptable", ≥ 80.3 "Excelente". Ítems (versión en español):
1. Creo que me gustaría usar este sistema con frecuencia.
2. Encontré el sistema innecesariamente complejo.
3. Pensé que el sistema era fácil de usar.
4. Creo que necesitaría el apoyo de una persona técnica para poder usar este sistema.
5. Encontré que las distintas funciones del sistema estaban bien integradas.
6. Pensé que había demasiada inconsistencia en el sistema.
7. Imagino que la mayoría de las personas aprendería a usar este sistema muy rápidamente.
8. Encontré el sistema muy engorroso de usar.
9. Me sentí con mucha confianza al usar el sistema.
10. Necesité aprender muchas cosas antes de poder empezar a usar este sistema.

## IA y hallazgos

**RN-09 — La IA asiste, la persona decide.**
- Todo hallazgo nace `DRAFT`. Solo una acción humana lo cambia.
- **Aprobar** (`severity` 1–4): en **una transacción** crea una historia MX (título, historia y criterios
  tomados de la versión editada), la vincula al hallazgo (relación única) y marca el hallazgo `APPROVED`.
  Si ya existe historia para ese hallazgo → `409 ALREADY_APPROVED`.
- Con `severity = 0` no se crea historia (`409 SEVERITY_ZERO_NO_STORY`); se usa "Marcar como revisado"
  (`APPROVED` sin historia).
- **Descartar**: `DISCARDED` con motivo opcional; se puede **restaurar** a `DRAFT`.
- Un hallazgo `APPROVED` ya no se edita: lo editable pasa a ser la historia MX.
- Se guarda siempre `aiOriginal` (respuesta original de la IA) para trazabilidad.

**RN-10 — Prioridad.**
- Frecuencia de un hallazgo = sesiones distintas de sus observaciones / sesiones `CLOSED` del plan
  (`null` si el plan no tiene sesiones cerradas).
- Puntuación sugerida = severidad × frecuencia (0–4; si frecuencia es `null`, se usa la severidad).
- Prioridad inicial de la historia MX según severidad: 4 → `CRITICAL`, 3 → `HIGH`, 2 → `MEDIUM`,
  1 → `LOW`. La persona puede cambiarla.

**RN-17 — Datos personales.**
- El sistema **no tiene campos** para nombres, correos ni cédulas de participantes: solo `P-xxx` y un
  perfil genérico.
- Antes de enviar texto a la IA se reemplazan por `[DATO OCULTO]`: correos, secuencias de 7 o más
  dígitos (teléfonos, cédulas) y URLs con parámetros. La pantalla informa cuántos reemplazos hubo y
  recuerda que los nombres propios no se detectan automáticamente.

**RN-18 — Ejecución de la IA.** Grupos de máximo `AI_GROUP_SIZE` (20) observaciones; un grupo que falla
no detiene a los demás; timeout por grupo `AI_TIMEOUT_MS` (30 s); 1 reintento automático ante timeout o
429/5xx, luego queda `FAILED` con "Reintentar" manual. Al arrancar la API, los análisis o grupos que
quedaron `RUNNING` (por un reinicio) pasan a `FAILED` con el motivo "Interrumpido por reinicio".
Estado del análisis: `DONE` (todos los grupos listos), `PARTIAL` (alguno falló), `FAILED` (todos fallaron).

## Mejoras y Scrum interno

**RN-19 — Historias MX.** Código consecutivo global `MX-001`, `MX-002`… (nunca se reutiliza). Puntos en
Fibonacci {1, 2, 3, 5, 8, 13} (opcionales en el backlog, **obligatorios** para entrar a un sprint).
Estados: `BACKLOG` (sin sprint o en sprint planificado), y dentro de un sprint activo `TODO`,
`IN_PROGRESS`, `IN_REVIEW`, `DONE` (se puede mover entre cualquiera de estos cuatro).

**RN-11 — Capacidad.** Σ puntos de las historias del sprint ≤ `capacityPoints`. Agregar una historia
que la supere → `409 CAPACITY_EXCEEDED` con los puntos disponibles en `details`.

**RN-14 — Ciclo del sprint de mejoras.** `PLANNED → ACTIVE → CLOSED`. Solo un sprint `ACTIVE` a la vez
(`409 SPRINT_ALREADY_ACTIVE`). Al iniciar, sus historias pasan a `TODO`. Al cerrar (con confirmación),
las historias que no están `DONE` vuelven a `BACKLOG` sin sprint, conservando su orden. Review y
retrospectiva solo se registran con el sprint `CLOSED` (`409 SPRINT_NOT_CLOSED`).

## Evidencias y exportación

**RN-15 — Evidencias.** Tipos permitidos: PNG, JPEG, WEBP, PDF, verificados por su contenido real
(bytes), no por la extensión (`415 INVALID_FILE_TYPE`). Máximo 10 MB por archivo (`413
FILE_TOO_LARGE`) y 20 por sesión (`409 TOO_MANY_FILES`). Se guardan con nombre UUID en `UPLOAD_DIR`
(el nombre original solo se guarda como dato). No se borran evidencias de sesiones cerradas.

**RN-13 — Exportación.** El informe incluye solo hallazgos `APPROVED`, historias MX y métricas de
sesiones `CLOSED`. Nunca incluye `DRAFT`/`DISCARDED`, `aiOriginal`, ni texto de observaciones sin pasar
por el filtro de RN-17. Se construye en el servidor (`GET /reports/:planId`) para que la regla no
dependa de la interfaz.

## Códigos de error de la API

Formato único: `{ "code": "QUOTA_FULL", "message": "texto para personas, en español", "details": {…} }`.

| HTTP | `code` | Regla |
|---|---|---|
| 400 | `VALIDATION_ERROR` (con `details.fields`) | Zod |
| 404 | `NOT_FOUND` | — |
| 409 | `CONSENT_REQUIRED`, `QUOTA_FULL`, `TASKS_LOCKED`, `INCOMPLETE_RESULTS`, `SESSION_CLOSED`, `PLAN_NOT_READY`, `PLAN_CLOSED`, `OPEN_SESSIONS` | RN-01..05, RN-16 |
| 409 | `VERSION_CONFLICT` | RN-21 |
| 409 | `ALREADY_APPROVED`, `SEVERITY_ZERO_NO_STORY`, `FINDING_LOCKED` | RN-09 |
| 409 | `CAPACITY_EXCEEDED`, `SPRINT_ALREADY_ACTIVE`, `SPRINT_NOT_CLOSED`, `POINTS_REQUIRED` | RN-11, RN-14, RN-19 |
| 409 | `TOO_MANY_FILES` | RN-15 |
| 413 | `FILE_TOO_LARGE` | RN-15 |
| 415 | `INVALID_FILE_TYPE` | RN-15 |
| 502 | `AI_PROVIDER_ERROR` | RN-18 (solo en endpoints síncronos; en análisis el error queda en el grupo) |
| 500 | `INTERNAL_ERROR` (sin detalles técnicos al cliente; sí en el log) | — |
