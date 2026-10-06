import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { seedDemo } from '../prisma/seed-demo.js';
import { TEST_DATABASE_URL } from './test-database-url.js';

describe('seed del caso demo "Checkout tienda universitaria"', () => {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL }),
  });

  beforeAll(async () => {
    await prisma.$connect();
    await seedDemo(prisma);
  });
  afterAll(() => prisma.$disconnect());

  it('crea el plan Piloto cerrado con 2 tareas y 5 sesiones cerradas', async () => {
    const plan = await prisma.testPlan.findFirstOrThrow({
      where: { name: 'Piloto' },
      include: { tasks: { orderBy: { order: 'asc' } }, sessions: true },
    });

    expect(plan.status).toBe('CLOSED');
    expect(plan.tasks.map((t) => t.equivalenceKey)).toEqual(['buscar-producto', 'anadir-carrito']);
    expect(plan.sessions).toHaveLength(5);
    expect(plan.sessions.every((s) => s.status === 'CLOSED')).toBe(true);
  });

  it('crea el plan Evaluación actual en curso, cupo 8, con 7 sesiones (6 cerradas)', async () => {
    const plan = await prisma.testPlan.findFirstOrThrow({
      where: { name: 'Evaluación actual' },
      include: { tasks: { orderBy: { order: 'asc' } }, sessions: true },
    });

    expect(plan.status).toBe('IN_PROGRESS');
    expect(plan.targetParticipants).toBe(8);
    expect(plan.consentReady).toBe(true);
    expect(plan.tasks.map((t) => t.equivalenceKey)).toEqual([
      'buscar-producto',
      'anadir-carrito',
      'completar-pago',
    ]);
    expect(plan.sessions).toHaveLength(7);
    expect(plan.sessions.filter((s) => s.status === 'CLOSED')).toHaveLength(6);
  });

  it('deja a P-008 en curso con 3 errores y 08:42 acumulado, sin cronómetro corriendo', async () => {
    const session = await prisma.session.findFirstOrThrow({
      where: { participant: { code: 'P-008' } },
      include: { results: { include: { task: true } } },
    });
    const pago = session.results.find((r) => r.task.equivalenceKey === 'completar-pago');

    expect(session.status).toBe('IN_PROGRESS');
    expect(pago?.errorCount).toBe(3);
    expect(pago?.elapsedMs).toBe(8 * 60_000 + 42_000);
    expect(pago?.timerStartedAt).toBeNull();
    expect(pago?.outcome).toBeNull();
    expect(session.results.filter((r) => r.outcome === 'ASSISTED')).toHaveLength(1);
  });

  it('crea un resultado por tarea en cada sesión (RN-05)', async () => {
    const sesiones = await prisma.session.findMany({
      include: { results: true, plan: { include: { tasks: true } } },
    });

    for (const sesion of sesiones) {
      expect(sesion.results).toHaveLength(sesion.plan.tasks.length);
    }
  });

  it('solo guarda códigos P-xxx de participantes, sin datos personales (RN-17)', async () => {
    const participantes = await prisma.participant.findMany();

    expect(participantes.length).toBe(12);
    for (const p of participantes) {
      expect(p.code).toMatch(/^P-\d{3}$/);
      expect(p.consentAt).not.toBeNull();
    }
  });

  it('crea al menos 20 observaciones, 2 sobre el vencimiento de la tarjeta', async () => {
    const total = await prisma.observation.count();
    const vencimiento = await prisma.observation.count({
      where: { text: { contains: 'vencimiento', mode: 'insensitive' } },
    });

    expect(total).toBeGreaterThanOrEqual(20);
    expect(vencimiento).toBe(2);
  });

  it('crea hallazgos: 1 aprobado (con MX-014), 1 borrador y 1 descartado (RN-09)', async () => {
    const hallazgos = await prisma.finding.findMany({ include: { story: true } });
    const aprobado = hallazgos.find((f) => f.status === 'APPROVED');

    expect(hallazgos).toHaveLength(3);
    expect(hallazgos.filter((f) => f.status === 'DRAFT')).toHaveLength(1);
    expect(hallazgos.filter((f) => f.status === 'DISCARDED')).toHaveLength(1);
    expect(aprobado?.story?.number).toBe(14);
    expect(hallazgos.every((f) => f.severity >= 0 && f.severity <= 4)).toBe(true);
  });

  it('crea 7 historias MX numeradas de MX-008 a MX-014', async () => {
    const historias = await prisma.improvementStory.findMany({ orderBy: { number: 'asc' } });

    expect(historias.map((h) => h.number)).toEqual([8, 9, 10, 11, 12, 13, 14]);
  });

  it('crea el sprint de mejoras activo: capacidad 21, 16 comprometidos, 13 terminados', async () => {
    const sprint = await prisma.improvementSprint.findFirstOrThrow({
      include: { stories: true },
    });
    const comprometidos = sprint.stories.reduce((suma, h) => suma + (h.points ?? 0), 0);
    const terminados = sprint.stories
      .filter((h) => h.status === 'DONE')
      .reduce((suma, h) => suma + (h.points ?? 0), 0);

    expect(sprint.status).toBe('ACTIVE');
    expect(sprint.capacityPoints).toBe(21);
    expect(comprometidos).toBe(16);
    expect(terminados).toBe(13);
    expect(sprint.stories.map((h) => h.number).sort((a, b) => a - b)).toEqual([9, 11, 14]);
    expect(sprint.stories.find((h) => h.number === 9)?.status).toBe('IN_PROGRESS');
  });

  it('crea 3 integrantes del equipo de mejoras', async () => {
    expect(await prisma.teamMember.count()).toBe(3);
  });

  it('continúa la numeración MX desde MX-015 (RN-19)', async () => {
    const nueva = await prisma.improvementStory.create({
      data: { title: 'nueva', storyText: 'x', priority: 'LOW', rank: 99_000 },
    });

    expect(nueva.number).toBe(15);
  });

  it('es idempotente: sembrar de nuevo deja el mismo estado', async () => {
    await seedDemo(prisma);

    expect(await prisma.testPlan.count()).toBe(2);
    expect(await prisma.session.count()).toBe(12);
    expect(await prisma.improvementStory.count()).toBe(7);
    const mx = await prisma.improvementStory.findMany({ orderBy: { number: 'asc' } });
    expect(mx.map((h) => h.number)).toEqual([8, 9, 10, 11, 12, 13, 14]);
  });
});
