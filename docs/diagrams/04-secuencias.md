# Diagramas de secuencia

## 1. Registrar una tarea con cronómetro y autoguardado (HU-02, RN-08, RN-21)

```mermaid
sequenceDiagram
  actor M as Moderación
  participant W as Web (ejecutar tarea)
  participant A as API sessions
  participant D as PostgreSQL

  M->>W: Iniciar cronómetro
  W->>A: POST /sessions/:id/results/:taskId/timer {action:"start", version}
  A->>D: timerStartedAt = ahora (servidor), version+1
  A-->>W: 200 {elapsedMs, timerStartedAt, serverNow, version}
  W->>W: muestra tiempo con desfase serverNow
  loop cada 10 s si hay cambios (una petición a la vez)
    W->>A: PUT /sessions/:id/results/:taskId {outcome, errorCount, version}
    alt versión coincide
      A->>D: actualizar, version+1
      A-->>W: 200 {version}
      W-->>M: "Guardado hace 2 s"
    else versión distinta
      A-->>W: 409 VERSION_CONFLICT
      W-->>M: "Otra persona actualizó esta sesión. Recarga para ver los cambios"
    end
  end
  M->>W: Recarga la página por error
  W->>A: GET /sessions/:id
  A-->>W: currentTaskId, elapsedMs, timerStartedAt, serverNow
  W-->>M: misma tarea, tiempo correcto (sigue corriendo)
  M->>W: Siguiente tarea
  W->>A: POST .../timer {action:"pause"} y luego PUT de la tarea
```

## 2. Análisis con IA y fallo parcial (HU-06, RN-17, RN-18)

```mermaid
sequenceDiagram
  actor I as Investigación
  participant W as Web (Hallazgos e IA)
  participant A as API ai
  participant P as AiProvider (Gemini o Mock)
  participant D as PostgreSQL

  I->>W: Selecciona 35 observaciones
  W->>A: POST /ai/redaction-preview {observationIds}
  A-->>W: {redactions: 2}
  W-->>I: "Se ocultarán 2 datos personales. La IA solo propone, tú decides"
  I->>W: Analizar
  W->>A: POST /ai/runs {planId, observationIds}
  A->>D: AiRun PENDING + 2 grupos (20 + 15)
  A-->>W: 202 {runId}
  par Grupo 1
    A->>P: analyzeGroup(grupo 1 saneado)
    P-->>A: JSON
    A->>A: validar con Zod + ids
    A->>D: Findings DRAFT, grupo DONE
  and Grupo 2
    A->>P: analyzeGroup(grupo 2 saneado)
    P--xA: timeout
    A->>P: reintento tras 2 s
    P--xA: timeout
    A->>D: grupo FAILED ("La IA no respondió a tiempo")
  end
  A->>D: AiRun PARTIAL
  loop cada 2 s mientras haya grupos pendientes
    W->>A: GET /ai/runs/:id
    A-->>W: estado de grupos y propuestas
  end
  W-->>I: Grupo 1 listo (propuestas revisables) · Grupo 2 falló [Reintentar]
  I->>W: Reintentar grupo 2
  W->>A: POST /ai/runs/:id/groups/:g/retry
```

## 3. Aprobar una propuesta y crear la historia MX (HU-07, HU-08, RN-09, RN-10)

```mermaid
sequenceDiagram
  actor U as Mejoras UX
  participant W as Web (Revisar sugerencia)
  participant A as API findings
  participant D as PostgreSQL

  U->>W: Compara evidencia y propuesta, edita la severidad 2 → 3
  W->>A: PATCH /findings/:id {severity:3, ...}
  A->>D: editedByHuman = true
  U->>W: Aprobar y añadir al backlog
  W->>W: deshabilita el botón (evita doble clic)
  W->>A: POST /findings/:id/approve
  A->>D: BEGIN
  A->>D: ¿existe historia con findingId? 
  alt no existe
    A->>D: INSERT ImprovementStory (MX-015, prioridad HIGH, rank al final)
    A->>D: UPDATE Finding status = APPROVED, reviewedAt
    A->>D: COMMIT
    A-->>W: 201 {storyCode: "MX-015"}
    W-->>U: "Historia MX-015 creada" [Ver en el backlog]
  else ya existe
    A->>D: ROLLBACK
    A-->>W: 409 ALREADY_APPROVED
  end
```
