# Riesgos y errores previstos (pre-mortem)

Ejercicio hecho **antes de programar**: imaginar que el proyecto falló y preguntarse por qué. Cada fila
indica cómo se previene y qué regla o prueba lo cubre. Probabilidad (P) e impacto (I): A/M/B.
Si aparece un riesgo nuevo durante el desarrollo, se agrega aquí.

## 1. Datos y lógica de negocio

| # | Qué puede fallar | P | I | Prevención | Cubierto por |
|---|---|---|---|---|---|
| D1 | Se recarga o cierra la pestaña con el cronómetro corriendo y se pierde el tiempo | A | A | Cronómetro con reloj del servidor (`elapsedMs` + `timerStartedAt`), autoguardado, aviso `beforeunload`, reanudar en la misma tarea | RN-08, pruebas de `timer.ts` |
| D2 | Cronómetro olvidado corriendo toda la noche | M | M | Aviso si lleva > 2 h y corrección manual registrada | RN-08 |
| D3 | Dos personas editan la misma sesión | B | A | `version` + `409 VERSION_CONFLICT` | RN-21 |
| D4 | El autoguardado choca consigo mismo (dos peticiones en paralelo con la misma versión) | A | M | Cola de escrituras en el cliente (una a la vez) y la versión se actualiza con cada respuesta | RN-21, prueba de `useAutosave` |
| D5 | Se editan tareas después de registrar resultados → métricas incoherentes | M | A | Tareas bloqueadas desde la primera sesión; `onDelete: Restrict` | RN-04 |
| D6 | Métricas con 0 sesiones → NaN o "0 %" engañoso | A | M | `null` + estado vacío | RN-07 |
| D7 | Tareas fallidas o tiempos atípicos distorsionan el promedio | A | M | Mediana y media solo de tareas completadas; fórmula visible en la ayuda | RN-06 |
| D8 | Promedio de promedios en indicadores globales | M | M | Agregación de todos los resultados | RN-06 |
| D9 | Comparar tareas distintas (el error "frente al piloto" del prototipo) | A | A | `equivalenceKey` desde HU-01; globales solo con tareas equivalentes | RN-12 |
| D10 | Conclusiones exageradas con 5–8 participantes | A | M | Comparación descriptiva y aviso de muestra pequeña | RN-12, ADR-0006 |
| D11 | Doble clic en "Aprobar" crea dos historias MX | M | A | `findingId @unique` + transacción + botón deshabilitado mientras procesa | RN-09 |
| D12 | Sprint con más puntos que la capacidad (por arrastre rápido o dos pestañas) | M | M | Validación en servidor, la UI revierte la tarjeta con mensaje | RN-11 |
| D13 | Fechas en el día equivocado por zona horaria | M | M | UTC en BD, `America/Guayaquil` al mostrar; filtros de período convierten a UTC | ARCHITECTURE §9 |
| D14 | Códigos MX repetidos o reutilizados | B | M | `autoincrement` único | RN-19 |

## 2. IA

| # | Qué puede fallar | P | I | Prevención | Cubierto por |
|---|---|---|---|---|---|
| I1 | JSON inválido, ids inventados, severidad fuera de rango | A | A | Zod estricto + verificación de ids; el grupo queda `FAILED` | AI_MODULE §4 y §6 |
| I2 | Timeout o cuota agotada (429) justo en la demo | M | A | Reintento con espera; demo con `MockProvider` como respaldo, marcado "Simulado" | RN-18 |
| I3 | Inyección de instrucciones dentro de una observación ("ignora las reglas…") | M | M | Observaciones delimitadas como datos, salida forzada por esquema, la IA no ejecuta acciones | Prompt v1, prueba con *fixture* |
| I4 | Datos personales enviados a un tercero | M | A | Sin campos de PII; redacción automática con aviso | RN-17 |
| I5 | Reinicio de la API a mitad del análisis deja grupos "procesando" para siempre | M | M | Al arrancar, `RUNNING` → `FAILED` reintentable | RN-18 |
| I6 | El modelo configurado deja de existir o cambia el nombre de los campos del SDK | M | M | Modelo en variable `GEMINI_MODEL`; adaptador aislado en `gemini.provider.ts`; probar con la clave real al inicio del S3 | AI_MODULE §5 |
| I7 | Gemini rechaza el esquema por palabras clave no soportadas | M | M | Enviar el esquema "de cable" simplificado; validar límites después con Zod | AI_MODULE §4 |
| I8 | Las sugerencias son genéricas y no aportan | M | M | Prompt con evidencia obligatoria en la justificación; medir % aprobadas/editadas/descartadas | AI_MODULE §8 |
| I9 | La clave de Gemini se sube a GitHub | B | A | `.env` ignorado, *secret scanning*; si ocurre, rotar la clave de inmediato | WORKFLOW, DI-04 |

## 3. Archivos y exportación

| # | Qué puede fallar | P | I | Prevención | Cubierto por |
|---|---|---|---|---|---|
| F1 | Archivo enorme llena el disco | M | M | 10 MB por archivo, 20 por sesión | RN-15 |
| F2 | Ejecutable renombrado a `.png` | B | A | Verificación por bytes con `file-type` | RN-15 |
| F3 | Nombre de archivo con `../` (path traversal) | B | A | Se guarda con UUID; el nombre original es solo un dato | RN-15 |
| F4 | El PDF sale sin tildes o con la ñ rota | M | M | Fuente incrustada; prueba que extrae texto del PDF | HU-11 |
| F5 | Un borrador de IA o datos personales aparecen en el informe | B | A | El informe se arma en el servidor con solo `APPROVED`; prueba explícita | RN-13 |

## 4. Entorno, herramientas e integración

| # | Qué puede fallar | P | I | Prevención | Cubierto por |
|---|---|---|---|---|---|
| E1 | "En mi máquina sí funciona": distintas versiones de Node/pnpm | A | M | `.nvmrc`, `engines`, `packageManager`, corepack; el CI es la referencia | DI-04 |
| E2 | Saltos de línea CRLF en Windows rompen scripts y diffs | A | B | `.gitattributes` con `eol=lf`, `.editorconfig` | raíz del repo |
| E3 | Docker no funciona en algún equipo (Windows sin WSL2) | M | M | PostgreSQL en la nube (Neon/Supabase) con `DATABASE_URL`; **no** SQLite | ARCHITECTURE §8 |
| E4 | **TypeScript 7** instalado por defecto rompe `typescript-eslint` (soporta `< 6.1`) | A | M | Fijar TypeScript 6.0.x | ARCHITECTURE §2 |
| E5 | **Prisma 7** ya no acepta `url` en `schema.prisma` | A | M | `prisma.config.ts` + `@prisma/adapter-pg`; esquema de referencia ya validado | DATA_MODEL |
| E6 | Una versión mayor nueva (Nest, Vite, Router) cambia APIs y el agente usa la sintaxis antigua | M | M | Versiones exactas en el lockfile; el agente consulta la documentación de la versión instalada | AGENTS §4 |
| E7 | Dos ramas crean migraciones a la vez | A | M | Esquema completo en DI-04; una migración por PR; regenerar tras rebase | WORKFLOW §2 |
| E8 | Conflictos en `packages/shared` porque todos lo tocan | A | M | Cambios de contrato en PR pequeño y separado; revisión de Emilio | WORKFLOW §6 |
| E9 | Un agente "arregla" el CI borrando o debilitando pruebas | M | A | Prohibido en AGENTS §4; el revisor verifica que no bajen las pruebas | revisión de PR |
| E10 | Un agente implementa funciones fuera del backlog o de otro módulo | M | M | AGENTS §4 y §7; dueños de módulo | revisión de PR |
| E11 | Paquete `shared` sin compilar → la API no encuentra los tipos | M | M | `tsup` en modo watch dentro de `pnpm dev`; `build` de shared antes de api/web en CI | DI-04 |

## 5. Proceso y académicos

| # | Qué puede fallar | P | I | Prevención |
|---|---|---|---|---|
| P1 | La raíz del monorepo y la BD (DI-04) se retrasan y bloquean a todos | A | A | Es lo primero y está en las líneas de Manuel (raíz, API, Docker), William (web, CI) y Pablo (BD); mientras tanto cada quien escribe contratos, casos de aceptación y pantallas sin datos. Emilio apoya. El S2 ya empezó el 1 oct: quedan 8 días hábiles y la matriz supone 2 h/día |
| P2 | HU-02 (ruta crítica) se atrasa y arrastra S3 y S4 | M | A | Línea de endpoints (Manuel) primero y pantalla (Emilio) después; un PR por línea; seed con sesiones cerradas para que HU-05/06 no esperen |
| P3 | Crece el alcance (login, Jira, gráficos extra) | A | A | Todo lo nuevo entra al backlog con SP y lo decide el PO; nada a mitad de sprint |
| P4 | El SUS (HU-13, extra fuera de la matriz) no lo acepta el PO o no cabe en la holgura | M | B | Historia independiente de 2 SP; se hace al final del S3 y se elimina sin afectar a otras |
| P5 | Accesibilidad se deja para el final | A | A | Componentes accesibles desde DI-05; axe en CI desde el S2 |
| P6 | Falta la evidencia de prototipo de fidelidad media que pide la guía | M | M | Documentar versión en grises del Figma en el S2 |
| P7 | No hay medición "antes" para el antes/después | A | A | Usar el recorrido del prototipo de DI-03 (Sprint 1) con la plantilla del docente; si faltan datos, completarlos con 3–5 personas (TESTING §7) |
| P8 | Review o retro del Sprint 1 nunca se registran | M | M | Se hacen el 7 oct junto con el planning del S2 |
| P9 | El S4 dura 2 semanas pero coincide con exámenes | M | M | HU-11 y HU-12 son independientes entre sí; congelamiento el 13 nov |
| P10 | Los documentos y la matriz oficial divergen (horas, tareas, fechas) | M | A | La matriz manda; `TEAM.md` §4 la reproduce línea por línea y se cambia en el mismo PR que la matriz |
| P11 | La base técnica (DI-04, DI-05) no cabe en las líneas de HU-01 y HU-03 y se desbordan las horas | M | M | Registrar el exceso en "Tareas no Planificadas"; priorizar lo mínimo: raíz, BD y esqueleto de la API; Emilio apoya |
| P12 | 2 y 3 nov (inicio del S4) pueden ser feriado | M | B | Confirmar con el equipo; si lo son, HU-09 arranca el 4 nov y la holgura del S4 absorbe el día |
