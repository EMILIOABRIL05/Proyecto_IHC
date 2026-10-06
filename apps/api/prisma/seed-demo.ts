import type { PrismaClient } from '../src/generated/prisma/client.js';

// Caso demo "Checkout tienda universitaria". Todos los datos son FICTICIOS (docs/BACKLOG.md §Seed).
// Es idempotente: vacía las tablas y vuelve a sembrar, así `db:reset` + `db:seed` deja siempre lo mismo.

type Outcome = 'UNASSISTED' | 'ASSISTED' | 'FAILED';
type TaskKey = 'buscar-producto' | 'anadir-carrito' | 'completar-pago';

const PLAN_PILOTO_ID = '00000000-0000-4000-8000-000000000001';
const PLAN_ACTUAL_ID = '00000000-0000-4000-8000-000000000002';

const TABLAS = [
  'finding_observations',
  'findings',
  'ai_groups',
  'ai_runs',
  'evidence',
  'observations',
  'task_results',
  'sessions',
  'participants',
  'plan_tasks',
  'test_plans',
  'improvement_stories',
  'sprint_reviews',
  'retrospectives',
  'improvement_sprints',
  'team_members',
];

const TAREAS: Record<
  TaskKey,
  { instruction: string; expectedResult: string; successCriterion: string }
> = {
  'buscar-producto': {
    instruction: 'Encuentra un cuaderno A4 de 100 hojas en la tienda.',
    expectedResult: 'El participante llega a la ficha del producto.',
    successCriterion: 'Abre la ficha del cuaderno en menos de 2 minutos.',
  },
  'anadir-carrito': {
    instruction: 'Deja el cuaderno listo para comprarlo.',
    expectedResult: 'El producto aparece en el carrito con la cantidad correcta.',
    successCriterion: 'El carrito muestra 1 cuaderno A4.',
  },
  'completar-pago': {
    instruction: 'Termina la compra pagando con tarjeta.',
    expectedResult: 'La tienda muestra la confirmación del pedido.',
    successCriterion: 'Llega a la pantalla de confirmación sin ayuda del moderador.',
  },
};

// [resultado, segundos, errores] por tarea, en el orden del plan.
type Fila = [Outcome, number, number];

const PILOTO: Fila[][] = [
  [
    ['UNASSISTED', 70, 1],
    ['ASSISTED', 120, 2],
  ],
  [
    ['ASSISTED', 110, 2],
    ['FAILED', 300, 4],
  ],
  [
    ['UNASSISTED', 80, 0],
    ['UNASSISTED', 95, 1],
  ],
  [
    ['FAILED', 240, 3],
    ['ASSISTED', 150, 2],
  ],
  [
    ['UNASSISTED', 66, 1],
    ['UNASSISTED', 88, 0],
  ],
];

const ACTUAL: Fila[][] = [
  [
    ['UNASSISTED', 42, 0],
    ['UNASSISTED', 35, 0],
    ['ASSISTED', 210, 2],
  ],
  [
    ['UNASSISTED', 55, 1],
    ['UNASSISTED', 48, 0],
    ['FAILED', 380, 4],
  ],
  [
    ['ASSISTED', 95, 1],
    ['UNASSISTED', 40, 0],
    ['UNASSISTED', 150, 1],
  ],
  [
    ['UNASSISTED', 38, 0],
    ['ASSISTED', 85, 1],
    ['FAILED', 420, 5],
  ],
  [
    ['UNASSISTED', 61, 0],
    ['UNASSISTED', 52, 0],
    ['ASSISTED', 260, 3],
  ],
  [
    ['UNASSISTED', 47, 0],
    ['UNASSISTED', 44, 1],
    ['UNASSISTED', 175, 2],
  ],
];

// Respuestas SUS (1–5) de algunas sesiones cerradas del plan actual.
const SUS: Record<string, number[]> = {
  'P-001': [4, 2, 4, 2, 4, 2, 5, 2, 4, 1],
  'P-003': [5, 1, 5, 2, 4, 1, 5, 1, 4, 2],
  'P-004': [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  'P-006': [4, 2, 4, 1, 4, 2, 4, 2, 5, 2],
};

// Fórmula de RN-20; la versión oficial vivirá en @utd/shared (HU-13).
function puntajeSus(respuestas: number[]): number {
  const suma = respuestas.reduce((acc, v, i) => acc + (i % 2 === 0 ? v - 1 : 5 - v), 0);
  return suma * 2.5;
}

// [código de participante, tarea | null, texto]
const OBSERVACIONES_ACTUAL: [string, TaskKey | null, string][] = [
  ['P-001', 'buscar-producto', 'Usó la barra de búsqueda de inmediato y escribió "cuaderno a4".'],
  [
    'P-001',
    'completar-pago',
    'Dudó en el paso de envío; preguntó si debía elegir retiro en tienda.',
  ],
  [
    'P-002',
    'buscar-producto',
    'Se confundió con las categorías del menú y volvió atrás dos veces.',
  ],
  [
    'P-002',
    'completar-pago',
    'Escribió mal la fecha de la tarjeta y el mensaje de error no explicó cómo corregirla.',
  ],
  [
    'P-002',
    'completar-pago',
    'Abandonó el pago tras el cuarto error; dijo que no sabía qué estaba mal.',
  ],
  ['P-003', 'buscar-producto', 'Tardó en notar el botón de filtros; pidió ayuda al moderador.'],
  [
    'P-003',
    'anadir-carrito',
    'Añadió el producto sin dudar; el aviso de "añadido" se vio claramente.',
  ],
  ['P-003', null, 'Comentó que le gustaría ver el precio total antes de llegar al último paso.'],
  [
    'P-004',
    'buscar-producto',
    'Buscó "cuadernos" y no encontró resultados; no había sugerencia de búsqueda alternativa.',
  ],
  [
    'P-004',
    'anadir-carrito',
    'No vio el botón "Añadir al carrito" porque quedaba debajo del pliegue en su pantalla.',
  ],
  [
    'P-004',
    'completar-pago',
    'No supo en qué formato escribir el vencimiento de la tarjeta (MM/AA o MM/AAAA).',
  ],
  [
    'P-004',
    'completar-pago',
    'Pidió volver al carrito y el botón "Atrás" borró los datos ya escritos.',
  ],
  [
    'P-005',
    'buscar-producto',
    'Encontró el producto rápido por la búsqueda; elogió los resultados con foto.',
  ],
  [
    'P-005',
    'completar-pago',
    'Pidió ayuda: no entendía la diferencia entre "pagar ahora" y "reservar".',
  ],
  ['P-005', 'completar-pago', 'Releyó tres veces los términos de envío antes de continuar.'],
  [
    'P-006',
    'buscar-producto',
    'Navegó sin problemas; usó el teclado para moverse entre resultados.',
  ],
  ['P-006', 'anadir-carrito', 'Cambió la cantidad a 2 por error y la corrigió sin ayuda.'],
  [
    'P-006',
    'completar-pago',
    'Completó el pago pero comentó que los mensajes de validación aparecían muy abajo.',
  ],
  ['P-008', 'buscar-producto', 'Encontró el cuaderno directamente desde la página principal.'],
  [
    'P-008',
    'anadir-carrito',
    'Necesitó una pista del moderador para ubicar el carrito en la barra superior.',
  ],
  [
    'P-008',
    'completar-pago',
    'Ingresó el vencimiento de la tarjeta con otro formato y el campo lo rechazó sin explicar el formato esperado.',
  ],
  ['P-008', 'completar-pago', 'Se frustró después del tercer error y pidió una pausa.'],
  [
    'P-008',
    null,
    'Dijo que el proceso de pago le parecía "más largo de lo normal" para una compra pequeña.',
  ],
];

const OBSERVACIONES_PILOTO: [string, TaskKey | null, string][] = [
  ['P-001', 'buscar-producto', 'Prefirió navegar por categorías en lugar de usar la búsqueda.'],
  ['P-002', 'anadir-carrito', 'No encontró el carrito; el ícono no tenía texto.'],
  ['P-004', 'buscar-producto', 'No halló el producto y desistió tras cuatro minutos.'],
];

export async function seedDemo(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLAS.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );

  const clave = (planId: string, tareaKey: TaskKey) => `${planId}:${tareaKey}`;
  const idTarea = new Map<string, string>();

  // ---------- Planes y tareas ----------
  const crearPlan = async (
    id: string,
    nombre: string,
    objetivo: string,
    estado: 'CLOSED' | 'IN_PROGRESS',
    tareas: TaskKey[],
    cupo: number,
    cerradoEn: Date | null,
  ) => {
    await prisma.testPlan.create({
      data: {
        id,
        name: nombre,
        interfaceName: 'Checkout tienda universitaria',
        objective: objetivo,
        participantProfile: 'Estudiantes universitarios que compran útiles en línea',
        modality: 'MODERATED_IN_PERSON',
        targetParticipants: cupo,
        consentReady: true,
        consentText: 'Formulario de consentimiento verbal leído al inicio de cada sesión.',
        moderatorNotes: 'No guiar al participante; anotar dudas y errores.',
        status: estado,
        closedAt: cerradoEn,
        createdAt: new Date('2026-09-28T15:00:00Z'),
      },
    });
    for (const [i, key] of tareas.entries()) {
      const tarea = await prisma.planTask.create({
        data: {
          planId: id,
          order: i + 1,
          instruction: TAREAS[key].instruction,
          expectedResult: TAREAS[key].expectedResult,
          primaryMetric: key === 'completar-pago' ? 'SUCCESS_ERRORS' : 'SUCCESS_TIME',
          successCriterion: TAREAS[key].successCriterion,
          equivalenceKey: key,
        },
      });
      idTarea.set(clave(id, key), tarea.id);
    }
  };

  await crearPlan(
    PLAN_PILOTO_ID,
    'Piloto',
    'Detectar problemas graves en la búsqueda y el carrito antes de la evaluación completa.',
    'CLOSED',
    ['buscar-producto', 'anadir-carrito'],
    5,
    new Date('2026-10-02T22:00:00Z'),
  );
  await crearPlan(
    PLAN_ACTUAL_ID,
    'Evaluación actual',
    'Medir la facilidad de completar una compra, de la búsqueda al pago.',
    'IN_PROGRESS',
    ['buscar-producto', 'anadir-carrito', 'completar-pago'],
    8,
    null,
  );

  // ---------- Sesiones ----------
  const idParticipante = new Map<string, string>();
  const idSesion = new Map<string, string>();
  const idObservacion = new Map<string, string>();

  const crearSesion = async (
    planId: string,
    claveMapa: string,
    codigo: string,
    tareas: TaskKey[],
    filas: Fila[],
    dia: number,
    cerrada = true,
  ) => {
    const inicio = new Date(Date.UTC(2026, 9, dia, 15, 0, 0));
    const participante = await prisma.participant.create({
      data: {
        planId,
        code: codigo,
        profile: 'Estudiante universitario',
        consentAt: inicio,
      },
    });
    idParticipante.set(claveMapa, participante.id);

    const respuestas = planId === PLAN_ACTUAL_ID ? SUS[codigo] : undefined;
    const sesion = await prisma.session.create({
      data: {
        planId,
        participantId: participante.id,
        status: cerrada ? 'CLOSED' : 'IN_PROGRESS',
        startedAt: inicio,
        closedAt: cerrada ? new Date(inicio.getTime() + 25 * 60_000) : null,
        susAnswers: respuestas ?? [],
        susScore: respuestas ? puntajeSus(respuestas) : null,
      },
    });
    idSesion.set(claveMapa, sesion.id);

    for (const [i, key] of tareas.entries()) {
      const fila = filas[i];
      await prisma.taskResult.create({
        data: {
          sessionId: sesion.id,
          taskId: idTarea.get(clave(planId, key)) as string,
          outcome: fila?.[0] ?? null,
          elapsedMs: (fila?.[1] ?? 0) * 1000,
          errorCount: fila?.[2] ?? 0,
        },
      });
    }
    return sesion;
  };

  const TAREAS_PILOTO: TaskKey[] = ['buscar-producto', 'anadir-carrito'];
  const TAREAS_ACTUAL: TaskKey[] = ['buscar-producto', 'anadir-carrito', 'completar-pago'];

  for (const [i, filas] of PILOTO.entries()) {
    const codigo = `P-${String(i + 1).padStart(3, '0')}`;
    await crearSesion(PLAN_PILOTO_ID, `piloto:${codigo}`, codigo, TAREAS_PILOTO, filas, 1 + i);
  }
  for (const [i, filas] of ACTUAL.entries()) {
    const codigo = `P-${String(i + 1).padStart(3, '0')}`;
    await crearSesion(PLAN_ACTUAL_ID, `actual:${codigo}`, codigo, TAREAS_ACTUAL, filas, 5 + i);
  }

  // P-008: sesión en curso. Dos tareas hechas (una con ayuda) y el pago pendiente, con
  // 3 errores y 08:42 acumulados; el cronómetro está en pausa (RN-08).
  const p008 = await crearSesion(
    PLAN_ACTUAL_ID,
    'actual:P-008',
    'P-008',
    TAREAS_ACTUAL,
    [
      ['UNASSISTED', 48, 0],
      ['ASSISTED', 92, 1],
      ['UNASSISTED', 0, 0],
    ],
    12,
    false,
  );
  await prisma.taskResult.updateMany({
    where: { sessionId: p008.id, task: { equivalenceKey: 'completar-pago' } },
    data: { outcome: null, elapsedMs: 8 * 60_000 + 42_000, errorCount: 3 },
  });
  await prisma.session.update({
    where: { id: p008.id },
    data: { currentTaskId: idTarea.get(clave(PLAN_ACTUAL_ID, 'completar-pago')) ?? null },
  });

  // ---------- Observaciones ----------
  const crearObservaciones = async (
    prefijo: 'piloto' | 'actual',
    planId: string,
    lista: [string, TaskKey | null, string][],
  ) => {
    for (const [i, [codigo, tarea, texto]] of lista.entries()) {
      const observacion = await prisma.observation.create({
        data: {
          sessionId: idSesion.get(`${prefijo}:${codigo}`) as string,
          taskId: tarea ? (idTarea.get(clave(planId, tarea)) ?? null) : null,
          text: texto,
        },
      });
      idObservacion.set(`${prefijo}:${i}`, observacion.id);
    }
  };
  await crearObservaciones('piloto', PLAN_PILOTO_ID, OBSERVACIONES_PILOTO);
  await crearObservaciones('actual', PLAN_ACTUAL_ID, OBSERVACIONES_ACTUAL);

  // ---------- Hallazgos de IA (proveedor mock) ----------
  const indices = (predicado: (o: [string, TaskKey | null, string]) => boolean) =>
    OBSERVACIONES_ACTUAL.flatMap((o, i) =>
      predicado(o) ? [idObservacion.get(`actual:${i}`)!] : [],
    );
  const obsVencimiento = indices(([, , t]) => t.includes('vencimiento'));
  const obsBusqueda = indices(
    ([, , t]) => t.includes('no encontró resultados') || t.includes('categorías'),
  );
  const obsPagoLargo = indices(([, , t]) => t.includes('"más largo de lo normal"'));

  const corrida = await prisma.aiRun.create({
    data: {
      planId: PLAN_ACTUAL_ID,
      status: 'DONE',
      provider: 'MOCK',
      model: 'mock',
      promptVersion: 'v1',
      redactions: 0,
      finishedAt: new Date('2026-10-12T20:00:00Z'),
    },
  });
  const grupo = await prisma.aiGroup.create({
    data: {
      runId: corrida.id,
      index: 0,
      status: 'DONE',
      attempts: 1,
      observationIds: [...idObservacion.entries()]
        .filter(([clave]) => clave.startsWith('actual:'))
        .map(([, id]) => id),
    },
  });

  const crearHallazgo = async (datos: {
    resumen: string;
    heuristicas: ('H1' | 'H5' | 'H6' | 'H9')[];
    severidad: number;
    justificacion: string;
    sugerencia: string;
    titulo: string;
    historia: string;
    criterios: string[];
    observaciones: string[];
    estado: 'DRAFT' | 'APPROVED' | 'DISCARDED';
    motivo?: string;
  }) => {
    const original = {
      summary: datos.resumen,
      heuristics: datos.heuristicas,
      severity: datos.severidad,
      suggestion: datos.sugerencia,
    };
    return prisma.finding.create({
      data: {
        runId: corrida.id,
        groupId: grupo.id,
        summary: datos.resumen,
        heuristics: datos.heuristicas,
        pour: ['UNDERSTANDABLE'],
        severity: datos.severidad,
        justification: datos.justificacion,
        suggestion: datos.sugerencia,
        storyTitle: datos.titulo,
        storyText: datos.historia,
        acceptanceCriteria: datos.criterios,
        confidence: 0.8,
        aiOriginal: original,
        status: datos.estado,
        discardReason: datos.motivo ?? null,
        reviewedAt: datos.estado === 'DRAFT' ? null : new Date('2026-10-13T14:00:00Z'),
        observations: { create: datos.observaciones.map((observationId) => ({ observationId })) },
      },
    });
  };

  const aprobado = await crearHallazgo({
    resumen: 'El campo de vencimiento de la tarjeta no indica el formato esperado.',
    heuristicas: ['H5', 'H9'],
    severidad: 3,
    justificacion: 'Dos participantes cometieron errores en el mismo campo y uno abandonó el pago.',
    sugerencia: 'Mostrar el formato "MM/AA" como ayuda visible y aceptar ambos formatos.',
    titulo: 'Indicar el formato del vencimiento de la tarjeta',
    historia:
      'Como comprador quiero ver el formato esperado del vencimiento para pagar sin cometer errores.',
    criterios: [
      'El campo muestra "MM/AA" de forma visible.',
      'Si el formato es incorrecto, el mensaje explica cómo corregirlo.',
    ],
    observaciones: obsVencimiento,
    estado: 'APPROVED',
  });
  await crearHallazgo({
    resumen: 'La búsqueda sin resultados no ofrece alternativas ni ayuda.',
    heuristicas: ['H1', 'H9'],
    severidad: 2,
    justificacion: 'Un participante buscó "cuadernos" y no recibió ninguna sugerencia.',
    sugerencia: 'Mostrar términos similares y categorías cuando no hay resultados.',
    titulo: 'Sugerir alternativas cuando la búsqueda no tiene resultados',
    historia:
      'Como comprador quiero recibir sugerencias cuando no hay resultados para encontrar mi producto.',
    criterios: ['Se muestran términos similares.', 'Se enlazan las categorías principales.'],
    observaciones: obsBusqueda,
    estado: 'DRAFT',
  });
  await crearHallazgo({
    resumen: 'El proceso de pago parece largo para compras pequeñas.',
    heuristicas: ['H6'],
    severidad: 1,
    justificacion: 'Un único comentario subjetivo, sin errores asociados.',
    sugerencia: 'Evaluar un pago en una sola pantalla.',
    titulo: 'Acortar el proceso de pago',
    historia: 'Como comprador quiero pagar en menos pasos para terminar rápido.',
    criterios: ['El pago se completa en una sola pantalla.'],
    observaciones: obsPagoLargo,
    estado: 'DISCARDED',
    motivo: 'Comentario aislado; no se repite en otras sesiones.',
  });

  // ---------- Equipo, historias MX y sprint de mejoras ----------
  const [ana, luis, sofia] = await Promise.all([
    prisma.teamMember.create({ data: { name: 'Ana Vera', role: 'Desarrolladora' } }),
    prisma.teamMember.create({ data: { name: 'Luis Mora', role: 'Diseñador UX' } }),
    prisma.teamMember.create({ data: { name: 'Sofía Paredes', role: 'QA' } }),
  ]);

  const sprint = await prisma.improvementSprint.create({
    data: {
      name: 'Sprint de mejoras 1',
      goal: 'Reducir los errores en el pago y la búsqueda.',
      startDate: new Date('2026-10-05'),
      endDate: new Date('2026-10-16'),
      capacityPoints: 21,
      status: 'ACTIVE',
    },
  });

  const historia = (
    number: number,
    titulo: string,
    prioridad: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    puntos: number | null,
    estado: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE',
    extra: { sprintId?: string; assigneeId?: string; findingId?: string } = {},
  ) =>
    prisma.improvementStory.create({
      data: {
        number,
        title: titulo,
        storyText: `Como comprador quiero ${titulo.toLowerCase()} para completar mi compra sin fricción.`,
        acceptanceCriteria: ['Se cumple en el flujo de compra.', 'Hay una prueba que lo verifica.'],
        priority: prioridad,
        points: puntos,
        status: estado,
        rank: (number - 7) * 1000,
        ...extra,
      },
    });

  await historia(8, 'Agregar autocompletado al buscador', 'MEDIUM', 5, 'BACKLOG');
  await historia(9, 'Mostrar el total antes del último paso', 'MEDIUM', 3, 'IN_PROGRESS', {
    sprintId: sprint.id,
    assigneeId: ana.id,
  });
  await historia(10, 'Guardar los datos al volver al carrito', 'HIGH', 2, 'BACKLOG');
  await historia(11, 'Hacer visible el botón de añadir al carrito', 'HIGH', 8, 'DONE', {
    sprintId: sprint.id,
    assigneeId: luis.id,
  });
  await historia(12, 'Explicar la diferencia entre pagar y reservar', 'LOW', null, 'BACKLOG');
  await historia(13, 'Rediseñar los mensajes de validación', 'MEDIUM', 5, 'BACKLOG', {
    assigneeId: sofia.id,
  });
  await historia(14, 'Indicar el formato del vencimiento de la tarjeta', 'HIGH', 5, 'DONE', {
    sprintId: sprint.id,
    assigneeId: ana.id,
    findingId: aprobado.id,
  });

  // Las historias demo empiezan en MX-008; la siguiente que se cree será MX-015 (RN-19).
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('improvement_stories', 'number'), 14)`,
  );
}
