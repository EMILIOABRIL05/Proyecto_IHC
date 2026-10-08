# Instrucciones para GitHub Copilot

Las instrucciones de este repositorio están en `AGENTS.md` (raíz). Léelo antes de proponer código y
sigue su orden de lectura de `docs/`. Resumen mínimo:

- Monorepo pnpm: `apps/web` (React + Vite + TS), `apps/api` (NestJS + Prisma + PostgreSQL),
  `packages/shared` (esquemas Zod, constantes y funciones de dominio puras).
- Código en inglés, interfaz en español, TypeScript `strict`, sin `any`.
- Reglas de negocio en `docs/BUSINESS_RULES.md`; se validan en el servidor.
- Commits: Conventional Commits en español; ramas `feature/HU-xx-…` desde `develop`.
- Nada generado por IA entra al backlog sin aprobación humana.
