# Plan de Diseño — Usability Test Dashboard

Base: bocetos (12) y pantallas de Figma (16) del Sprint 1. Este documento convierte ese diseño en una
especificación que se puede implementar sin adivinar, y agrega los estados que faltaban (vacío, error,
carga, IA parcial, SUS). Prototipo: ver enlace en [`CONTEXT.md`](CONTEXT.md).

## 1. Usuario y contexto

| Perfil | Tareas principales | Contexto y experiencia |
|---|---|---|
| **Investigación** | Crear y revisar planes, consultar métricas, comparar evaluaciones, exportar | Conoce conceptos de usabilidad; trabaja en escritorio con tiempo para analizar |
| **Moderación** | Iniciar o continuar sesiones, leer consignas, cronometrar, registrar resultados y observaciones | Atención dividida entre el participante y la pantalla; necesita acciones grandes, pocas decisiones y cero pérdida de datos |
| **Mejoras UX** | Revisar propuestas de IA contra la evidencia, aprobar, priorizar, planificar y seguir mejoras | Conoce Scrum; necesita trazabilidad (de dónde sale cada historia) |

Una misma persona puede tener los tres perfiles (en el curso, los estudiantes). Supuesto: usuarios con
formación básica en HCI (estudiantes de Ingeniería de Software); por eso se usan los nombres estándar
(heurísticas de Nielsen, POUR, SUS) acompañados siempre de una explicación corta.

## 2. Modelo conceptual y metáfora

| Metáfora | Dónde | Por qué conecta con el modelo mental |
|---|---|---|
| **Recorrido por pasos** | Asistente del plan | Como un formulario en papel por secciones: el usuario sabe dónde está y cuánto falta |
| **Bloc de observaciones con cronómetro** | Ejecución de sesión | Replica lo que hace un moderador con libreta y cronómetro |
| **Tablero de control** | Resultados | Indicadores grandes arriba, detalle abajo, como un tablero de instrumentos |
| **Semáforo de severidad** | Hallazgos y backlog | 0–4 con color **y** texto, como niveles de alerta conocidos |
| **Expediente con evidencia** | Revisión de sugerencia de IA | La propuesta se juzga al lado de la evidencia que la sustenta |
| **Tablero Kanban** | Gestión Scrum | Tarjetas en columnas, conocido por el equipo |

**Mapeo modelo conceptual ↔ mental:** Plan → *Sesiones (una por participante)* → *Resultados por
tarea + Observaciones* → *Métricas* → *Hallazgos (propuestas IA)* → *Historias MX* → *Sprints de
mejora*. La navegación sigue ese mismo orden de izquierda a derecha / arriba a abajo.

**Reducción de carga cognitiva:** una decisión principal por pantalla; datos ya ingresados visibles en
la revisión (reconocer en vez de recordar); valores por defecto razonables (clave de equivalencia
sugerida, prioridad desde la severidad); acciones destructivas separadas y con confirmación.

## 3. Arquitectura de información

```
Usability Test Dashboard
├─ Planes de prueba ........ /plans
│  ├─ Mis planes
│  ├─ Nuevo / Editar plan (Paso 1 Datos generales · Paso 2 Tareas y criterios · Paso 3 Revisar y guardar)
│  └─ Detalle del plan (datos, tareas, sesiones, cerrar plan)
├─ Sesiones ................ /sessions
│  ├─ Lista de sesiones (por plan)
│  ├─ Nueva sesión (diálogo)
│  ├─ Ejecutar tarea
│  ├─ Revisión antes del cierre (+ cuestionario SUS)
│  └─ Detalle de sesión (evidencias)
├─ Resultados .............. /results
│  ├─ Dashboard de métricas
│  ├─ Comparar evaluaciones
│  └─ Exportar resultados
├─ Hallazgos e IA .......... /ai
│  ├─ Seleccionar observaciones y analizar
│  ├─ Estado del análisis y propuestas
│  └─ Revisar sugerencia
└─ Gestión Scrum ........... /improvements
   ├─ Backlog de mejoras (MX)
   ├─ Planificar sprint
   ├─ Tablero del sprint
   └─ Review y retrospectiva (+ historial)
```

Mapa de navegación: [`diagrams/07-navegacion.md`](diagrams/07-navegacion.md).

## 4. Flujos de usuario

**F1 Configurar** (HU-01): Mis planes → Nuevo plan → Paso 1 → Paso 2 → Paso 3 → Guardar plan.
- Error de validación → resumen arriba + foco + mensaje junto al campo; no se pierde nada.
- Falta consentimiento → se guarda; "Guardar e iniciar" deshabilitado con motivo.
- Salir con cambios → diálogo "Tienes cambios sin guardar: Guardar borrador / Salir sin guardar / Cancelar".

**F2 Registrar** (HU-02): Detalle del plan → Nueva sesión (código automático + consentimiento) →
Ejecutar tarea 1..n → Revisión → (SUS) → Cerrar sesión → Resultados.
- Cupo completo → "Nueva sesión" deshabilitado con motivo; "Continuar P-008" destacado.
- Falla el guardado → indicador "Error al guardar — Reintentar"; los datos siguen en pantalla.
- Recarga → vuelve a la misma tarea con el tiempo correcto.
- Cerrar con tareas pendientes → la revisión las marca y "Cerrar sesión" explica qué falta.

**F3 Interpretar** (HU-05, HU-12, HU-11): Resultados → filtros → indicadores y tabla → Comparar o Exportar.
- Sin sesiones cerradas → estado vacío con enlace a Sesiones.

**F4 Mejorar** (HU-06, HU-07, HU-08): Hallazgos e IA → filtrar y seleccionar → vista previa de datos
ocultos → Analizar → estado por grupo → Revisar sugerencia → Aprobar → Backlog.
- Grupo fallido → motivo + Reintentar; los demás grupos se pueden revisar.
- Sin clave de IA → banda "Modo simulado".

**F5 Planificar** (HU-09, HU-10): Backlog → Planificar sprint → Iniciar → Tablero → Cerrar → Review y retro.
- Exceder capacidad → la historia no se agrega; mensaje con puntos disponibles.
- Historia sin puntos → no se puede seleccionar; enlace "Estimar".

Diagramas de secuencia de F2 y F4: [`diagrams/04-secuencias.md`](diagrams/04-secuencias.md).

## 5. Wireframes (especificación por pantalla)

Estructura común (DI-05): barra superior · navegación lateral con 5 áreas · área principal con título,
migas de pan y, a la derecha del título, la acción principal de la pantalla.

### 5.1 Mis planes (`/plans`)
- **Propósito:** encontrar y retomar evaluaciones.
- **Regiones:** título + botón primario "Nuevo plan" · barra de búsqueda, filtro de estado, orden · tabla.
- **Interacción:** fila → Abrir; acción Editar; estados en insignia con texto (Borrador, Listo, En curso, Cerrado).
- **Estados:** carga (esqueleto de tabla), vacío ("Aún no tienes planes. Crea el primero"), error con Reintentar.
- **Ejemplo:** "Checkout tienda universitaria — Evaluación actual · En curso · 7/8 participantes".

### 5.2 Asistente del plan (`/plans/new`)
- **Regiones:** indicador "Paso 1 de 3" con nombres de pasos · formulario · panel de ayuda lateral (ejemplos) · pie con Volver / Guardar borrador / Continuar.
- **Paso 1:** campos de HU-01 CA-2, agrupados en tarjetas "Qué se evalúa" y "Con quién y cómo".
- **Paso 2:** lista de tarjetas de tarea (consigna, resultado esperado, métrica, criterio, clave de
  equivalencia), con Editar, Duplicar, Eliminar, Subir, Bajar; "Añadir tarea" al final; advertencia de
  consigna que dirige dentro de la tarjeta (icono + texto).
- **Paso 3:** resumen por secciones con "Editar" · lista de comprobación con ✓/⚠ y texto · Guardar plan
  (secundario) y Guardar e iniciar (primario; deshabilitado con motivo).
- **Estados:** guardado ("Borrador guardado 10:42"), error de validación (resumen), tareas bloqueadas (aviso RN-04).

### 5.3 Detalle del plan (`/plans/:id`)
- **Regiones:** encabezado con estado y acciones (Editar, Cerrar plan) · tarjeta de datos · lista de
  tareas · tabla de sesiones · panel lateral: registradas / cerradas / en curso / cupo restante.
- **Interacción:** "Nueva sesión" (diálogo) o deshabilitado con motivo; "Continuar" destacado en sesiones abiertas.

### 5.4 Nueva sesión (diálogo)
- Código asignado (solo lectura, ej. P-009) · perfil (opcional, sin datos personales) · casilla
  obligatoria de consentimiento · Cancelar / Iniciar sesión. Foco atrapado; Esc cierra.

### 5.5 Ejecutar tarea (`/sessions/:id/run`)
- **Propósito:** registrar sin perder la atención del participante.
- **Regiones:** izquierda: progreso de tareas (lista vertical con estado) · centro: consigna grande (para
  leer) y resultado esperado (colapsable, "solo para quien modera") · derecha: panel de registro.
- **Panel de registro (de arriba a abajo):** cronómetro grande con Iniciar/Pausar (botón grande, mismo
  lugar) y Reiniciar (pequeño, con confirmación) · resultado (3 opciones grandes) · errores (− 0 +) ·
  observaciones (campo + Añadir; lista editable) · adjuntar evidencia.
- **Pie:** Tarea anterior · indicador de guardado · Guardar avance · Siguiente tarea (primario).
- **Estados:** guardando / guardado / error al guardar; conflicto de versión; aviso de cronómetro > 2 h.

### 5.6 Revisión antes del cierre (`/sessions/:id/review`)
- Tabla: tarea, resultado, tiempo, errores, observaciones, "Volver a editar" · tareas pendientes
  marcadas con texto · bloque SUS (10 ítems en escala 1–5 como grupos de radio, o "Omitir con motivo")
  · Guardar borrador / Cerrar sesión (primario, con confirmación).

### 5.7 Detalle de sesión (`/sessions/:id`)
- Resultados por tarea, observaciones, puntaje SUS, galería de evidencias (miniaturas con texto
  alternativo = nombre y tarea; PDF como enlace).

### 5.8 Dashboard de resultados (`/results`)
- **Regiones:** filtros (plan, desde, hasta) · fila de 5–6 indicadores con ayuda ⓘ · gráfico de
  completitud por tarea + botón "Ver como tabla" · tabla por tarea · observaciones frecuentes · matriz
  heurística × severidad (si hay hallazgos aprobados) · acciones: Analizar con IA, Comparar, Exportar.
- **Estados:** vacío (sin sesiones cerradas), carga, error.

### 5.9 Comparar evaluaciones (`/results/compare`)
- Selectores Base y Actual · aviso de muestra pequeña · tabla de tareas equivalentes (base, actual,
  diferencia con flecha + texto "mejoró/empeoró") · lista "Sin datos comparables" · indicadores globales.

### 5.10 Exportar resultados (`/results/export`)
- Izquierda: plan, formato (PDF/Markdown), casillas de secciones, aviso "No incluye borradores de IA
  ni datos personales" · derecha: vista previa · acciones Descargar y (Markdown) Copiar.

### 5.11 Hallazgos e IA — seleccionar (`/ai`)
- Filtros (plan, sesión, tarea) · lista de observaciones con casilla, código de participante y tarea ·
  "Seleccionar todas las filtradas" · panel lateral: qué hará la IA, nº seleccionadas, vista previa de
  datos ocultos, aviso de revisión humana obligatoria, botón "Analizar" · banda "Modo simulado" si aplica.

### 5.12 Estado del análisis (`/ai/runs/:id`)
- Lista de grupos con estado en texto + icono (Pendiente, Procesando, Listo, Falló) y "Reintentar" en
  los fallidos · región `aria-live` que anuncia cambios · lista de propuestas con resumen, severidad,
  heurísticas y estado; botón "Revisar".

### 5.13 Revisar sugerencia (`/ai/findings/:id`)
- **Izquierda (evidencia):** observaciones originales con código, tarea y fecha; evidencias adjuntas.
- **Derecha (propuesta, marcada con `AiBadge`):** resumen, heurísticas (multiselección con nombres),
  POUR, severidad (radio 0–4 con la escala explicada), justificación, mejora, historia, criterios.
- **Pie:** Descartar (izquierda, estilo secundario destructivo, confirmación) · Guardar borrador ·
  Aprobar y añadir al backlog (derecha, primario). Severidad 0 → "Marcar como revisado".

### 5.14 Backlog de mejoras (`/improvements`)
- Filtros · "Nueva historia" · tabla ordenable (arrastrar o Subir/Bajar): MX, título, hallazgo, severidad,
  prioridad, puntuación sugerida, puntos, estado, sprint · edición en panel lateral.

### 5.15 Planificar sprint
- Formulario (nombre, objetivo, fechas, capacidad) · dos columnas: Disponibles / Seleccionadas (con
  responsable) · medidor "16 de 21 puntos" con texto · Guardar / Iniciar sprint.

### 5.16 Tablero del sprint (`/improvements/board`)
- Encabezado con objetivo y progreso "13 de 16 puntos terminados" · 4 columnas · tarjetas (MX, título,
  puntos, responsable, severidad) con menú "Mover a…" · Cerrar sprint.

### 5.17 Review y retrospectiva
- Resumen automático (entregadas/pendientes, puntos) · notas de review · tres listas de retro (Bien,
  Mal, Acuerdos con responsable) · historial de sprints anteriores.

## 6. Justificación HCI

**Heurísticas de Nielsen**
- H1 Visibilidad: "Paso n de 3", indicador de guardado, cronómetro, estado de grupos de IA, progreso de puntos.
- H2 Mundo real: nombres de tareas del usuario (Crear plan, Continuar sesión); fechas y tiempos locales.
- H3 Control y libertad: Volver, Editar desde la revisión, reabrir sesión en revisión, restaurar hallazgo descartado, Reintentar.
- H4 Consistencia: mismos componentes y verbos en todo el sistema; la acción principal siempre a la derecha.
- H5 Prevención de errores: RN-01, RN-03, RN-04, RN-05, RN-11; confirmación en acciones irreversibles.
- H6 Reconocer antes que recordar: resumen en el paso 3, evidencia al lado de la propuesta, claves de equivalencia sugeridas.
- H7 Flexibilidad: atajos con modificador en la ejecución (Alt+I iniciar/pausar, Alt+→ siguiente tarea), visibles en la ayuda y sin atajos de una sola letra (WCAG 2.1.4); "seleccionar todas las filtradas".
- H8 Minimalismo: una acción principal por pantalla; detalles colapsables.
- H9 Errores: mensajes con causa y solución (catálogo de `BUSINESS_RULES.md`).
- H10 Ayuda: panel de ayuda del asistente, ⓘ con fórmulas en métricas, escala de severidad explicada.

**Gestalt:** proximidad (campos de una tarea juntos en su tarjeta); región común (tarjetas y paneles);
similitud (un estilo por jerarquía de botón y por estado); continuidad (progreso de tareas en columna);
figura-fondo (la consigna resalta sobre el resto en la ejecución).

**Ley de Fitts:** Iniciar/Pausar y Siguiente tarea grandes y en posiciones fijas cerca del registro;
Reiniciar pequeño y separado; Descartar lejos de Aprobar; navegación lateral pegada al borde.

**POUR / WCAG 2.2 AA:** contraste 4.5:1 / 3:1; severidad y estados con texto; navegación completa por
teclado y foco visible; `aria-live` para guardado e IA; HTML semántico y componentes Radix; objetivos
≥ 24 px (≥ 44 px en acciones principales); sin dependencia del arrastre (alternativa "Mover a…").

**ISO 9241-11 (lo que se optimiza y se medirá en el "después"):** efectividad (completitud de T1–T5),
eficiencia (tiempo por tarea, sobre todo T2 registrar sesión) y satisfacción (SUS ≥ 68).

## 7. Handoff

- **A Figma (DI-05 / testers):** completar en el prototipo los estados nuevos de esta especificación
  (vacíos, errores, IA parcial, SUS, conflicto de versión) y una versión en escala de grises de los
  recorridos como evidencia de **fidelidad media**.
- **A implementación:** cada pantalla de §5 corresponde a una ruta de `ARCHITECTURE.md` §5 y a una HU de
  `BACKLOG.md`; los componentes base salen de DI-05; los textos de error salen del catálogo de
  `BUSINESS_RULES.md`.
