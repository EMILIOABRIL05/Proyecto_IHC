# Máquinas de estado

Reglas en [`../BUSINESS_RULES.md`](../BUSINESS_RULES.md).

## Plan de prueba (RN-16)

```mermaid
stateDiagram-v2
  [*] --> DRAFT: crear
  DRAFT --> READY: campos completos y al menos 1 tarea
  READY --> DRAFT: deja de cumplirse (sin sesiones)
  READY --> IN_PROGRESS: primera sesión (requiere consentimiento, RN-01)
  IN_PROGRESS --> CLOSED: Cerrar plan (sin sesiones abiertas)
  CLOSED --> [*]
  note right of IN_PROGRESS: tareas bloqueadas (RN-04)
```

## Sesión (RN-05)

```mermaid
stateDiagram-v2
  [*] --> IN_PROGRESS: crear (consentimiento + cupo)
  IN_PROGRESS --> IN_REVIEW: Revisar antes del cierre
  IN_REVIEW --> IN_PROGRESS: Volver a editar
  IN_REVIEW --> CLOSED: Cerrar (todas las tareas con resultado + confirmación)
  CLOSED --> [*]
```

## Cronómetro de una tarea (RN-08)

```mermaid
stateDiagram-v2
  [*] --> Detenido
  Detenido --> Corriendo: start (timerStartedAt = ahora del servidor)
  Corriendo --> Detenido: pause (elapsedMs += ahora - timerStartedAt)
  Corriendo --> Detenido: cambiar de tarea (pausa automática)
  Detenido --> Detenido: reset (elapsedMs = 0, con confirmación)
  Corriendo --> Corriendo: recarga de página (se recalcula, no se pierde)
```

## Análisis de IA (RN-18)

```mermaid
stateDiagram-v2
  [*] --> PENDING
  PENDING --> RUNNING: inicia el procesamiento
  RUNNING --> DONE: todos los grupos listos
  RUNNING --> PARTIAL: algún grupo falló
  RUNNING --> FAILED: todos fallaron o reinicio
  PARTIAL --> RUNNING: Reintentar grupo
  FAILED --> RUNNING: Reintentar grupo
  DONE --> [*]
```

## Hallazgo (RN-09)

```mermaid
stateDiagram-v2
  [*] --> DRAFT: generado por la IA
  DRAFT --> DRAFT: editar / guardar borrador
  DRAFT --> APPROVED: Aprobar (severidad 1-4, crea MX) o Marcar revisado (severidad 0)
  DRAFT --> DISCARDED: Descartar
  DISCARDED --> DRAFT: Restaurar
  APPROVED --> [*]
```

## Historia MX y sprint de mejoras (RN-11, RN-14, RN-19)

```mermaid
stateDiagram-v2
  [*] --> BACKLOG: aprobar hallazgo o crear manual
  BACKLOG --> TODO: el sprint que la incluye se inicia
  TODO --> IN_PROGRESS
  IN_PROGRESS --> IN_REVIEW
  IN_REVIEW --> DONE
  IN_REVIEW --> IN_PROGRESS
  DONE --> IN_REVIEW
  TODO --> BACKLOG: cierre del sprint sin terminar
  IN_PROGRESS --> BACKLOG: cierre del sprint sin terminar
  IN_REVIEW --> BACKLOG: cierre del sprint sin terminar
  DONE --> [*]
```

```mermaid
stateDiagram-v2
  [*] --> PLANNED: crear sprint
  PLANNED --> ACTIVE: Iniciar (solo uno activo)
  ACTIVE --> CLOSED: Cerrar (pendientes vuelven al backlog)
  CLOSED --> [*]: review y retrospectiva registradas
```
