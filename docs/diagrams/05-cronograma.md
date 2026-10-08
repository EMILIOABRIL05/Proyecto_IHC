# Cronograma y dependencias

## Cronograma (Sprints 2–4)

Fechas de la matriz oficial (S2 1–15 oct, S3 16–30 oct, S4 2–16 nov). El S2 se dibuja desde el 7 oct
porque el repositorio recién recibe el código esa semana. Cada barra agrupa las líneas de la matriz de
esa historia (las personas entre paréntesis). Solo se cuentan días hábiles.

```mermaid
gantt
  title Usability Test Dashboard — Sprints 2 a 4 (2026)
  dateFormat YYYY-MM-DD
  axisFormat %d %b
  excludes weekends

  section Sprint 2 (1–15 oct)
  Review y retro del Sprint 1            :milestone, s1r, 2026-10-07, 0d
  Raíz del monorepo, API base y Docker (Manuel) :di04a, 2026-10-07, 2d
  Esquema de BD y seed (Pablo)           :di04b, 2026-10-08, 3d
  HU-01 Plan (William, Manuel, Jonathan) :hu01, 2026-10-08, 6d
  HU-03 Consultas y evidencias (Pablo, William, Jonathan) :hu03, 2026-10-09, 5d
  HU-02 Sesión (Manuel, Emilio)          :hu02, 2026-10-12, 4d
  HU-04 Accesibilidad y pruebas (Emilio, Pablo) :hu04, 2026-10-13, 3d
  Congelamiento release/sprint-2         :milestone, f2, 2026-10-14, 0d
  Review y retro S2                      :milestone, r2, 2026-10-15, 0d

  section Sprint 3 (16–30 oct)
  HU-06 Motor IA (William, Pablo, Manuel) :hu06, 2026-10-16, 6d
  HU-05 Dashboard (William, Manuel, Jonathan, Emilio) :hu05, 2026-10-16, 8d
  HU-07 Curaduría (Jonathan)             :hu07, 2026-10-22, 4d
  HU-08 Backlog MX (Emilio, Pablo)       :hu08, 2026-10-26, 4d
  HU-13 SUS, extra (William, Pablo)       :hu13, 2026-10-26, 3d
  Congelamiento release/sprint-3         :milestone, f3, 2026-10-29, 0d
  Review y retro S3                      :milestone, r3, 2026-10-30, 0d

  section Sprint 4 (2–16 nov)
  HU-09 Sprints y Kanban (William, Manuel, Jonathan) :hu09, 2026-11-02, 6d
  HU-10 Review y retro (Emilio, Pablo)   :hu10, after hu09, 3d
  HU-11 Exportación (William, Manuel)    :hu11, 2026-11-02, 7d
  HU-12 Comparador (Pablo)               :hu12, 2026-11-02, 5d
  Test del sistema "después" (Jonathan)  :des, 2026-11-09, 3d
  Ajustes de interfaz (Emilio)           :aju, after des, 2d
  Suite E2E y auditoría a11y (William, Pablo) :e2e, 2026-11-06, 5d
  Congelamiento release/sprint-4         :milestone, f4, 2026-11-13, 0d
  Review final y presentación            :milestone, r4, 2026-11-16, 0d
```

> **Aviso de capacidad:** la matriz supone 2 h por persona por día. Del 7 al 15 oct son 7 días hábiles
> (≈ 14 h por persona) y el plan del S2 pide 18–20 h. Si parte del trabajo ya se hizo del 1 al 6 oct, cabe;
> si no, hay que subir las horas diarias o recortar alcance con el PO (ver `RISKS.md` P1).

## Dependencias entre historias

```mermaid
flowchart LR
  DI04[DI-04 Configuración técnica] --> DI05[DI-05 UI base]
  DI04 --> HU01[HU-01 Plan]
  DI05 --> HU01
  HU01 --> HU02[HU-02 Sesión]
  HU01 --> HU03[HU-03 Consultas y evidencias]
  HU02 --> HU03
  DI05 --> HU04[HU-04 Accesibilidad]
  HU02 --> HU05[HU-05 Métricas]
  HU02 --> HU13[HU-13 SUS, extra]
  HU02 --> HU06[HU-06 Motor IA]
  HU06 --> HU07[HU-07 Curaduría]
  HU07 --> HU08[HU-08 Backlog MX]
  HU08 --> HU09[HU-09 Sprints y Kanban]
  HU09 --> HU10[HU-10 Review y retro]
  HU05 --> HU11[HU-11 Exportación]
  HU07 --> HU11
  HU08 --> HU11
  HU01 --> HU12[HU-12 Comparador]
  HU05 --> HU12

  classDef critica fill:#fde2e1,stroke:#b42318,color:#1f1f1f;
  class DI04,HU01,HU02,HU06,HU07,HU08,HU09,HU10 critica;
```

En rojo: ruta crítica. El seed de DI-04 incluye sesiones cerradas y observaciones para que HU-05 y
HU-06 puedan empezar el 16 de octubre aunque HU-02 tenga ajustes pendientes.
