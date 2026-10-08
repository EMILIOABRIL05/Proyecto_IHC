# Diagramas

Escritos en **Mermaid** para que GitHub los dibuje y queden versionados junto al código. Para el informe
se exportan con [Mermaid Live](https://mermaid.live) o `npx @mermaid-js/mermaid-cli`, o se redibujan en
draw.io.

| Archivo | Contenido | Responsable de mantenerlo |
|---|---|---|
| [01-arquitectura.md](01-arquitectura.md) | C4 contexto y contenedores, módulos de la API, despliegue | Emilio |
| [02-entidad-relacion.md](02-entidad-relacion.md) | Modelo de datos | Emilio |
| [03-estados.md](03-estados.md) | Plan, sesión, cronómetro, IA, hallazgo, historia, sprint | Manuel |
| [04-secuencias.md](04-secuencias.md) | Autoguardado de sesión, análisis IA con fallo parcial, aprobación | Pablo |
| [05-cronograma.md](05-cronograma.md) | Gantt de S2–S4 y dependencias | Manuel |
| [06-gitflow.md](06-gitflow.md) | Flujo de ramas | Jonathan |
| [07-navegacion.md](07-navegacion.md) | Mapa de navegación | William |
| [08-casos-de-uso.md](08-casos-de-uso.md) | Casos de uso por perfil | Manuel |

Si un PR cambia el modelo de datos, los estados o los endpoints, actualiza el diagrama en el mismo PR.
