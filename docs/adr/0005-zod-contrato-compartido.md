# ADR-0005 — Zod como contrato compartido

- Estado: Aceptada
- Fecha: 2026-10-06
- Decisores: Grupo 6

## Contexto
NestJS suele validar con DTOs y `class-validator`. La web necesita las mismas validaciones en sus
formularios y la IA necesita un JSON Schema de la salida esperada. Mantener tres definiciones
(DTO, formulario, esquema de IA) garantiza que tarde o temprano se desincronicen.

## Decisión
Los esquemas viven en `packages/shared/src/schemas` con **Zod 4**:
- La API valida con un `ZodValidationPipe` global.
- La web valida con `@hookform/resolvers/zod`.
- El esquema de salida de la IA se convierte con `z.toJSONSchema()`.
- Los tipos TypeScript se derivan con `z.infer`.

## Consecuencias
- Cambiar un esquema afecta a web y API a la vez → se hace en un PR pequeño y separado (WORKFLOW §6).
- Swagger se documenta a partir de los esquemas (`z.toJSONSchema`) o con decoradores manuales simples;
  quien haga DI-04 elige la opción y la deja de ejemplo.
- No se usan `class-validator` ni `class-transformer`.
