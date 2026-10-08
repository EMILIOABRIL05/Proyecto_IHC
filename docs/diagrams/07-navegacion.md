# Mapa de navegación

Basado en los recorridos del Sprint 1 (Configurar, Registrar, Interpretar, Mejorar, Planificar).
Especificación de cada pantalla en [`../HCI_DESIGN.md`](../HCI_DESIGN.md) §5.

```mermaid
flowchart TB
  nav{{"Navegación lateral persistente"}}
  nav --> P[Planes de prueba]
  nav --> S[Sesiones]
  nav --> R[Resultados]
  nav --> H[Hallazgos e IA]
  nav --> G[Gestión Scrum]

  P --> P1[Mis planes] --> P2[Asistente: Paso 1 Datos generales] --> P3[Paso 2 Tareas y criterios] --> P4[Paso 3 Revisar y guardar]
  P4 -- Guardar plan --> P5[Detalle del plan]
  P4 -- Guardar e iniciar --> S2
  P1 --> P5
  P5 -- Editar --> P2

  S --> S1[Lista de sesiones]
  P5 -- Nueva sesión --> S2[Diálogo nueva sesión] --> S3[Ejecutar tarea]
  S1 -- Continuar --> S3
  P5 -- Continuar P-008 --> S3
  S3 -- Revisar --> S4[Revisión antes del cierre + SUS]
  S4 -- Volver a editar --> S3
  S4 -- Cerrar sesión --> S5[Detalle de sesión]
  S1 -- Ver --> S5
  S5 --> R1

  R --> R1[Dashboard de resultados]
  R1 --> R2[Comparar evaluaciones]
  R1 --> R3[Exportar resultados]
  R1 -- Analizar con IA --> H1

  H --> H1[Seleccionar observaciones] --> H2[Estado del análisis] --> H3[Revisar sugerencia]
  H3 -- Aprobar --> G1
  H3 -- Descartar o guardar --> H2

  G --> G1[Backlog de mejoras MX] --> G2[Planificar sprint] --> G3[Tablero del sprint] --> G4[Review y retrospectiva]
  G4 --> G1
```
