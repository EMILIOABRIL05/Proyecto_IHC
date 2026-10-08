# ADR-0003 — Escala de severidad 0–4

- Estado: Aceptada
- Fecha: 2026-10-06
- Decisores: Grupo 6

## Contexto
Las plantillas del docente registran severidad como Alta/Media/Baja; el contexto del proyecto y la
literatura de HCI usan la escala de Nielsen 0–4. La IA y el dashboard necesitan una sola escala.

## Decisión
Se usa la **escala de Nielsen 0–4** en todo el sistema, con esta equivalencia para leer o presentar
datos en el formato de las plantillas:

| Nielsen | Nombre | Plantilla | Prioridad MX inicial |
|---|---|---|---|
| 0 | Sin problema | — | no genera historia |
| 1 | Cosmético | Baja | LOW |
| 2 | Menor | Media | MEDIUM |
| 3 | Mayor | Alta | HIGH |
| 4 | Catastrófico | Alta (crítica) | CRITICAL |

## Consecuencias
- `Finding.severity` es entero 0–4 (Zod + CHECK en BD).
- La UI siempre muestra número + nombre + color (nunca solo color).
- La prioridad sugerida combina severidad y frecuencia (RN-10).
