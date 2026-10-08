# ADR-0002 — Sin login ni roles

- Estado: Aceptada por el equipo; **a confirmar con el PO** en la Review del Sprint 1 (7 oct 2026)
- Fecha: 2026-10-06
- Decisores: Grupo 6

## Contexto
Ninguna historia HU-01..HU-12 pide autenticación. La guía docente indica que no se requieren "roles
avanzados innecesarios" ni "infraestructura de despliegue en producción". La aplicación se ejecuta en
local o con Docker Compose para la demo.

## Decisión
La aplicación funciona como **un único espacio de trabajo sin login**. Los perfiles (Investigación,
Moderación, Mejoras UX) son formas de uso, no roles con permisos.

## Alternativas consideradas
- Login simple (correo + contraseña, sin roles): ~5–8 SP (registro, hash, sesión, rutas protegidas,
  pruebas) que no suman en la rúbrica y restan tiempo a IA y Scrum.
- Login con roles: más costo aún y fuera de lo pedido.

## Consecuencias
- No hay datos de usuarios que proteger; los participantes ya son anónimos (RN-17).
- "Mis planes" significa "los planes de este espacio".
- Si el PO lo pide: nueva historia HU-14 (estimada en el planning), una migración que agrega `User` y
  `ownerId` opcional en `TestPlan`, y un guard global en la API. El resto del diseño no cambia.
- No se debe desplegar públicamente sin agregar autenticación.
