# Registro de decisiones de arquitectura (ADR)

Un ADR deja escrita una decisión importante para que personas y agentes no la vuelvan a discutir ni la
contradigan sin saberlo. Se crea uno cuando una decisión cambia el stack, el modelo de datos, una regla
de negocio, el alcance o el flujo de trabajo.

| # | Decisión | Estado |
|---|---|---|
| [0001](0001-stack.md) | Stack: TypeScript, React, NestJS, PostgreSQL, Prisma, Gemini | Aceptada |
| [0002](0002-sin-login.md) | Sin login ni roles en la aplicación | Aceptada (a confirmar con el PO) |
| [0003](0003-escala-severidad.md) | Escala de severidad 0–4 y equivalencia con Alta/Media/Baja | Aceptada |
| [0004](0004-sus.md) | Cuestionario SUS como HU-13 (extra a la matriz) | Aceptada por el equipo |
| [0005](0005-zod-contrato-compartido.md) | Zod como contrato compartido (en lugar de class-validator) | Aceptada |
| [0006](0006-metricas-descriptivas.md) | Métricas y comparación descriptivas | Aceptada |

## Plantilla

```markdown
# ADR-000N — Título corto

- Estado: Propuesta | Aceptada | Reemplazada por ADR-000M
- Fecha: AAAA-MM-DD
- Decisores: nombres

## Contexto
Qué problema o fuerza obliga a decidir.

## Decisión
Qué se decidió, en una o dos frases claras.

## Alternativas consideradas
- Opción A — por qué no.
- Opción B — por qué no.

## Consecuencias
Qué se gana, qué se pierde, qué hay que hacer a partir de ahora.
```
