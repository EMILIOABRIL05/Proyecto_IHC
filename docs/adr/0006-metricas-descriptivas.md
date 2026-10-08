# ADR-0006 — Métricas y comparación descriptivas

- Estado: Aceptada
- Fecha: 2026-10-06
- Decisores: Grupo 6

## Contexto
El contexto inicial hablaba de "comparación estadística" entre evaluaciones. Las pruebas del curso
tienen entre 5 y 8 participantes por evaluación; con muestras así, una prueba de significancia sería
poco fiable y fácil de malinterpretar.

## Decisión
- Las métricas y la comparación son **descriptivas**: tasas, mediana y media de tiempo, errores
  promedio, SUS promedio, y diferencias entre evaluaciones (RN-06, RN-12).
- Se muestra un **aviso de muestra pequeña** cuando un lado tiene menos de 5 sesiones cerradas.
- Solo se comparan **tareas equivalentes** (`equivalenceKey`).

## Consecuencias
- Interpretación honesta en el informe y en la sustentación ("mejoró en esta muestra", no "mejoró
  significativamente").
- Si en el futuro se agregan intervalos de confianza (por ejemplo, Wilson para tasas), se hace como
  nueva HU y nuevo ADR.
