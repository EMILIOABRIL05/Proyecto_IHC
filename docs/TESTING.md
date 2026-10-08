# Estrategia de pruebas y calidad

Dueño: **William (QA)**. Casos de aceptación y pruebas con usuarios: **Pablo y Manuel (testers)**.
Regla de oro: **nada está terminado sin evidencia ejecutada** (salida de los comandos en el PR).

## 1. Niveles

| Nivel | Herramienta | Dónde | Qué cubre | Meta |
|---|---|---|---|---|
| Unitarias de dominio | Vitest | `packages/shared/src/domain/*.test.ts` | Todas las RN puras: métricas, comparación, SUS, cronómetro, estados, capacidad, prioridad, redacción de PII, Markdown | **≥ 90 %** de líneas y ramas |
| Servicios API | Jest o Vitest (el que deje DI-04) | `apps/api/src/modules/**/*.spec.ts` | Orquestación, transacciones, estados, IA con `MockProvider` | lógica crítica cubierta |
| API e2e | supertest + BD `utd_test` | `apps/api/test/*.e2e-spec.ts` | Cada endpoint: caso feliz + cada código de error de su RN | 1 prueba por regla |
| Contrato de IA | Jest/Vitest + *fixtures* | `apps/api/src/modules/ai/**` | Todas las filas de `AI_MODULE.md` §6 | 100 % de los casos |
| Componentes | Vitest + Testing Library + axe-core | `apps/web/src/features/**/*.test.tsx` | Formularios, asistente, cronómetro, revisión de IA, tablero; **0 violaciones axe** | pantallas clave |
| E2E | Playwright + `@axe-core/playwright` | `apps/web/e2e` | Flujos T1–T5 (§4) contra el seed | 5 flujos en verde |
| Manual | Lista de verificación | `docs/testing/` | Teclado, NVDA, contraste, exploratorias | cada sprint |
| Usabilidad | Matriz + SUS | `docs/testing/usability/` | Antes (prototipo) y después (sistema) | S1/S2 y S4 |

Cobertura global mínima: **70 %** (el CI falla por debajo). La meta no es el número: cada RN y cada
criterio de aceptación debe tener al menos una prueba que falle si se rompe.

## 2. Convenciones

- Nombre de prueba en español describiendo el comportamiento:
  `it('no permite iniciar sesión si falta el consentimiento (RN-01)')`.
- Estructura Preparar / Ejecutar / Verificar.
- **Reloj fijo**: las funciones de dominio reciben `now`; en pruebas de UI se usan *fake timers*.
- Nada de llamadas reales a Gemini en CI: `AI_PROVIDER=mock` y *fixtures*.
- BD de prueba: `db_test` (puerto 5433). Antes de la suite e2e: `prisma migrate reset --force` +
  seed mínimo; cada prueba crea sus propios datos con *factories* (`apps/api/test/factories.ts`) y no
  depende del orden.
- Pruebas de accesibilidad: `expect(await axe(container)).toHaveNoViolations()` (o el helper que defina
  DI-04 si `vitest-axe` no es compatible con la versión de Vitest; alternativa: `axe-core` directo).
- Una prueba que falla de forma intermitente se arregla o se marca `skip` con un Issue `bug`; nunca se
  ignora en silencio.

## 3. Casos de aceptación (testers)

Antes de que empiece una HU, Pablo o Manuel escriben sus casos en el Issue con este formato:

```gherkin
Escenario: Guardar plan sin consentimiento (HU-01, CA-6, RN-01)
  Dado un plan con datos generales completos y una tarea
  Y el consentimiento NO está preparado
  Cuando guardo el plan
  Entonces el plan queda en estado "Listo"
  Y el botón "Guardar e iniciar" está deshabilitado
  Y se lee el motivo "Falta preparar el consentimiento informado"
```

El desarrollador convierte los escenarios en pruebas (e2e de API o Playwright). En el release, los
testers ejecutan los escenarios a mano y marcan el resultado en el Issue.

## 4. Flujos E2E (mismos de la evaluación del Sprint 1)

| ID | Flujo | Criterio de éxito | Disponible desde |
|---|---|---|---|
| T1 | Crear y guardar un plan de prueba | Llega a la revisión y el plan aparece en "Mis planes" | S2 |
| T2 | Continuar P-008, completar y cerrar la sesión, consultar resultados | Sesión `CLOSED` y métricas actualizadas | S2 (cierre) / S3 (resultados) |
| T3 | Analizar observaciones con IA (mock), revisar una sugerencia y aprobarla | Aparece la historia MX en el backlog | S3 |
| T4 | Planificar un sprint, mover una historia en el tablero con teclado y cerrar con review | Puntos entregados correctos | S4 |
| T5 | Exportar el informe en Markdown y PDF | Archivo descargado sin borradores de IA | S4 |

Cada flujo también ejecuta axe en cada pantalla que recorre.

## 5. Accesibilidad (HU-04 y transversal)

Lista manual por pantalla (`docs/testing/a11y-checklist.md`, la crea William en S2):
1. Recorrido completo solo con teclado (Tab, Shift+Tab, Enter, Espacio, flechas, Esc); orden lógico; sin trampas.
2. Foco siempre visible.
3. Contraste AA medido (texto 4.5:1; texto grande, iconos y bordes de campos 3:1).
4. Ninguna información solo por color (estados y severidad con texto).
5. Lector de pantalla (NVDA + Chrome/Firefox): cada control anuncia nombre, rol y estado; errores
   anunciados; cambios importantes con región `aria-live` (guardado, estado de IA).
6. Zoom al 200 % sin pérdida de contenido; ancho de 320 px usable en pantallas de consulta.
7. Objetivos de clic de al menos 24 × 24 px (WCAG 2.2) y 44 × 44 px en acciones principales.
8. Respeta `prefers-reduced-motion`.

## 6. Integración continua (`.github/workflows/ci.yml`)

En cada PR hacia `develop`, `release/*` y `main`:
1. `pnpm install --frozen-lockfile` (con caché).
2. `pnpm lint` · `pnpm typecheck`.
3. `pnpm test` (unitarias + componentes) con reporte de cobertura y umbrales.
4. Servicio PostgreSQL 17 → `pnpm --filter @utd/api test:e2e`.
5. `pnpm build`.
6. Solo en `develop`, `release/*` y `main`: Playwright (navegador Chromium) contra API + web levantadas
   con el seed; sube el reporte HTML como artefacto si falla.

## 7. Evaluación de usabilidad del propio sistema (antes / después)

Responsables según la matriz: **William** (recorrido del prototipo, DI-03 del Sprint 1) y **Jonathan**
(aplicar las tareas al sistema con participantes, HU-12). Pablo y Manuel apoyan con la plantilla y el
análisis. Materiales en `docs/testing/usability/`.

- **Antes:** el recorrido del **prototipo de Figma** con usuarios de prueba ya está en la matriz (DI-03,
  Sprint 1). Se registra con la plantilla del docente (éxito, tiempo, errores, comentarios, problema,
  severidad, mejora) y consentimiento verbal. Si faltan datos para poder comparar, se completan con 3–5
  personas ajenas al grupo y se anota en la hoja "Tareas no Planificadas".
- **Después (S4, 2.ª semana):** misma prueba sobre el **sistema implementado** (HU-12, Jonathan), mismas
  tareas T1–T5, perfil similar de participantes. El SUS (HU-13, extra) se aplica al final de cada sesión y
  su resultado se anota también en la matriz de usabilidad.
- **Comparación:** los dos conjuntos se cargan en el propio Dashboard como dos evaluaciones con las
  mismas `equivalenceKey` (t1…t5) y se usa HU-12 para compararlos. Resultado → informe final.
- Los hallazgos del "antes" se analizan también con el módulo de IA (HU-06/07) y las mejoras aprobadas
  pueden entrar como historias del S4 si hay capacidad.

## 8. Checklist de release (QA)

- [ ] CI verde en `release/sprint-n`, incluida la suite E2E.
- [ ] Casos de aceptación del sprint ejecutados por los testers y marcados.
- [ ] Lista de accesibilidad completada para las pantallas nuevas.
- [ ] `pnpm db:reset && pnpm db:seed` deja la demo lista.
- [ ] Sin bugs abiertos de severidad 3–4 del sprint.
- [ ] Notas de la versión redactadas.
