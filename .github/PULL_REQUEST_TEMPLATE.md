## Historia

Closes #<issue> (solo si eres el dueño de la HU; si no, `Refs #<issue>`) · **HU-xx / DI-xx**: <título>

## Qué cambia

- …

## Criterios de aceptación

- [ ] CA-1 …
- [ ] CA-2 …

## Reglas de negocio cubiertas

- [ ] RN-xx — prueba: `<archivo de prueba>`

## Verificación (pega la salida resumida)

```
pnpm lint        →
pnpm typecheck   →
pnpm test        →
pnpm test:e2e    →  (si aplica)
```

## Accesibilidad (si hay UI)

- [ ] axe sin violaciones
- [ ] Recorrido completo con teclado y foco visible
- [ ] Estados y errores comunicados con texto, no solo color

## Cambios de contrato

- [ ] No toca `packages/shared/src/schemas` ni `schema.prisma`
- [ ] Sí los toca (explica qué y avisa al dueño del módulo afectado): …

## Capturas (si hay UI)

## Checklist del autor

- [ ] Rama actualizada con `develop` (rebase)
- [ ] Commits atómicos con Conventional Commits
- [ ] Documentación actualizada (`docs/`), si aplica
