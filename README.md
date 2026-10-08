# Usability Test Dashboard

Aplicación web para **planificar pruebas de usabilidad, registrar sesiones, consolidar métricas,
analizar observaciones con IA** (heurísticas de Nielsen, POUR, severidad 0–4, con aprobación humana) y
**gestionar las mejoras con Scrum**, con comparación antes/después y exportación a PDF y Markdown.

Proyecto integrador de **Interacción Humano–Computador** — Universidad Técnica de Ambato, Carrera de
Ingeniería de Software. **Grupo 6:** Emilio Abril, Jonathan Gamboa, Pablo Lozada, Manuel Cusme (Scrum
Master), William Martínez. **Product Owner:** Ing. José Caiza, Mg.

> **Estado (6 oct 2026):** Sprint 1 (análisis y prototipo) cerrado; el Sprint 2 (1–15 oct) está en curso.
> El repositorio contiene la documentación base; el código comienza con la raíz del monorepo (DI-04).

## Si eres un agente de código

Lee [`AGENTS.md`](AGENTS.md) antes de hacer cualquier cosa.

## Si eres integrante del equipo

1. Busca tu asignación en [`docs/TEAM.md`](docs/TEAM.md).
2. Abre tu agente en la raíz del repo y dile: "Soy <tu nombre> del Grupo 6 y estamos en el Sprint <n>. Lee AGENTS.md y haz lo que me corresponde en este sprint" (más prompts en [`docs/AGENT_PROMPTS.md`](docs/AGENT_PROMPTS.md)).
3. Sigue el flujo de ramas y commits de [`docs/WORKFLOW.md`](docs/WORKFLOW.md).

## Documentación

| Documento | Para qué |
|---|---|
| [CONTEXT](docs/CONTEXT.md) | Visión, alcance, glosario, estado, rúbrica, fundamentos HCI |
| [TEAM](docs/TEAM.md) | Roles, capacidad, dueños de módulo, quién hace qué en cada sprint |
| [BACKLOG](docs/BACKLOG.md) | Historias con criterios de aceptación, tareas y dependencias |
| [BUSINESS_RULES](docs/BUSINESS_RULES.md) | Reglas RN-xx y catálogo de errores de la API |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Stack, carpetas, endpoints, rutas, configuración, estándares |
| [DATA_MODEL](docs/DATA_MODEL.md) | Esquema Prisma de referencia |
| [AI_MODULE](docs/AI_MODULE.md) | Contrato, prompt y manejo de fallos de la IA |
| [HCI_DESIGN](docs/HCI_DESIGN.md) | Plan de diseño: usuarios, metáforas, flujos, pantallas, justificación HCI |
| [WORKFLOW](docs/WORKFLOW.md) | GitFlow, commits atómicos, PR, releases, trabajo con agentes |
| [TESTING](docs/TESTING.md) | Estrategia de pruebas, accesibilidad, CI, evaluación antes/después |
| [RISKS](docs/RISKS.md) | Errores previstos y cómo se evitan |
| [AGENT_PROMPTS](docs/AGENT_PROMPTS.md) | Prompts listos para cada integrante |
| [diagrams/](docs/diagrams/README.md) | Arquitectura, ER, estados, secuencias, cronograma, gitflow, navegación, casos de uso |
| [adr/](docs/adr/README.md) | Decisiones de arquitectura |
| [sprints/](docs/sprints/README.md) | Actas de planning, review y retro |

## Stack

TypeScript · React + Vite + Tailwind + shadcn/ui · NestJS · PostgreSQL + Prisma · Zod · Gemini
(`@google/genai`) · Docker Compose · GitHub Actions · Vitest/Jest · Playwright + axe.
Ver [ADR-0001](docs/adr/0001-stack.md).

## Inicio rápido (disponible cuando DI-04 esté en `develop`)

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d db
pnpm db:migrate && pnpm db:seed
pnpm dev            # web: http://localhost:5173 · API: http://localhost:3000/api/v1 · Swagger: /api/docs
```
