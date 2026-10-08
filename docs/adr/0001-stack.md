# ADR-0001 — Stack tecnológico

- Estado: Aceptada
- Fecha: 2026-10-06
- Decisores: Grupo 6

## Contexto
El equipo maneja C#, Java, JavaScript y PHP. Ningún documento del Sprint 1 fijaba un stack; un intento
generado con Google AI Studio proponía React + Express sin base de datos. El proyecto necesita:
formularios complejos y accesibles, un contrato JSON estricto con la IA, persistencia relacional,
trabajo en paralelo de 5 personas (cada una con su agente de código) y entrega en ~6 semanas.

## Decisión
Monorepo **TypeScript** con pnpm:
- **Web:** React 19 + Vite + Tailwind 4 + shadcn/ui (Radix) + TanStack Query + React Hook Form + Recharts + dnd-kit.
- **API:** NestJS + Prisma 7 + PostgreSQL 17.
- **Compartido:** `packages/shared` con esquemas Zod 4, constantes y funciones de dominio puras.
- **IA:** Gemini mediante `@google/genai` con salida JSON por esquema, detrás de una interfaz
  `AiProvider` con un `MockProvider`.
- **Infraestructura:** Docker Compose para la BD (y perfil demo), GitHub Actions para CI.
- **TypeScript 6.0.x** (no 7) mientras `typescript-eslint` no soporte TS 7.

## Alternativas consideradas
- **Express (propuesta de AI Studio):** sin estructura impuesta; con 5 personas y decenas de endpoints se
  desordena. NestJS da módulos, inyección de dependencias y pruebas, y se parece a ASP.NET/Spring, que
  el equipo conoce.
- **ASP.NET Core o Spring Boot + React:** sólidos, pero dos lenguajes y el contrato (sobre todo el de la
  IA) se duplicaría y desincronizaría entre C#/Java y TypeScript.
- **Next.js full-stack:** más rápido al inicio, pero mezcla servidor y cliente y diluye la separación
  frontend/backend que se sustenta en la presentación.
- **Laravel/PHP:** sin ventaja para este caso; el ecosistema React + IA en TypeScript es más maduro.
- **SQLite:** más simple de instalar, pero sin enums ni arreglos nativos y con migraciones distintas.

## Consecuencias
- Un solo lenguaje; los tipos y las validaciones se definen una vez.
- Accesibilidad de base gracias a Radix (apoya HU-04 y la rúbrica).
- Curva de aprendizaje de NestJS y Prisma 7 (`prisma.config.ts`, adaptador `pg`) → DI-04 deja ejemplos.
- Versiones exactas en el lockfile; si una versión mayor rompe compatibilidad se fija la anterior aquí.
