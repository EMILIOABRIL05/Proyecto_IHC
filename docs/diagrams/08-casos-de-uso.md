# Casos de uso

Mermaid no tiene diagrama UML de casos de uso; se representa con actores y casos agrupados por
módulo. Para el informe formal puede redibujarse en draw.io con la misma información.

```mermaid
flowchart LR
  inv(["Investigación"])
  mod(["Moderación"])
  mej(["Mejoras UX"])
  ia(["Servicio de IA"])

  subgraph sys["Usability Test Dashboard"]
    direction TB
    subgraph m1["Planes"]
      UC1(["Configurar plan (HU-01)"])
      UC2(["Consultar planes y sesiones (HU-03)"])
    end
    subgraph m2["Sesiones"]
      UC3(["Ejecutar sesión (HU-02)"])
      UC4(["Adjuntar evidencias (HU-03)"])
      UC5(["Aplicar SUS (HU-13)"])
    end
    subgraph m3["Resultados"]
      UC6(["Consultar métricas (HU-05)"])
      UC7(["Comparar evaluaciones (HU-12)"])
      UC8(["Exportar informe (HU-11)"])
    end
    subgraph m4["Hallazgos e IA"]
      UC9(["Analizar observaciones (HU-06)"])
      UC10(["Revisar y aprobar propuestas (HU-07)"])
    end
    subgraph m5["Gestión Scrum"]
      UC11(["Priorizar backlog MX (HU-08)"])
      UC12(["Planificar sprint y tablero (HU-09)"])
      UC13(["Registrar review y retro (HU-10)"])
    end
  end

  inv --- UC1
  inv --- UC2
  inv --- UC6
  inv --- UC7
  inv --- UC8
  inv --- UC9
  mod --- UC3
  mod --- UC4
  mod --- UC5
  mej --- UC10
  mej --- UC11
  mej --- UC12
  mej --- UC13
  UC9 --- ia
  UC3 -. "include: formularios accesibles (HU-04)" .-> UC1
```
