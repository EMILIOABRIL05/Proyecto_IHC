import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { TEST_DATABASE_URL } from './test-database-url.js';

describe('esquema de la base de datos (migración inicial)', () => {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL }),
  });

  beforeAll(() => prisma.$connect());
  afterAll(() => prisma.$disconnect());

  async function crearPlan(targetParticipants: number) {
    return prisma.testPlan.create({
      data: {
        name: 'Plan de prueba',
        interfaceName: 'Tienda',
        objective: 'Probar el checkout',
        participantProfile: 'Estudiantes',
        modality: 'MODERATED_IN_PERSON',
        targetParticipants,
      },
    });
  }

  it('crea un plan con estado DRAFT y versión 1 por defecto (RN-16, RN-21)', async () => {
    const plan = await crearPlan(8);

    expect(plan.status).toBe('DRAFT');
    expect(plan.version).toBe(1);
  });

  it('rechaza un cupo de participantes fuera de 1–50 (CHECK)', async () => {
    await expect(crearPlan(51)).rejects.toThrow();
    await expect(crearPlan(0)).rejects.toThrow();
  });

  it('rechaza una severidad fuera de 0–4 (CHECK)', async () => {
    const plan = await crearPlan(5);
    const run = await prisma.aiRun.create({
      data: { planId: plan.id, provider: 'MOCK', model: 'mock', promptVersion: 'v1' },
    });
    const group = await prisma.aiGroup.create({ data: { runId: run.id, index: 0 } });

    await expect(
      prisma.finding.create({
        data: {
          runId: run.id,
          groupId: group.id,
          summary: 'x',
          severity: 9,
          justification: 'x',
          suggestion: 'x',
          storyTitle: 'x',
          storyText: 'x',
          aiOriginal: {},
        },
      }),
    ).rejects.toThrow();
  });

  it('rechaza puntos que no son de Fibonacci en una historia MX (RN-19)', async () => {
    await expect(
      prisma.improvementStory.create({
        data: {
          title: 'x',
          storyText: 'x',
          priority: 'LOW',
          points: 4,
          rank: 1000,
        },
      }),
    ).rejects.toThrow();
  });

  it('asigna números MX consecutivos sin reutilizarlos (RN-19)', async () => {
    const a = await prisma.improvementStory.create({
      data: { title: 'a', storyText: 'a', priority: 'LOW', rank: 1000 },
    });
    const b = await prisma.improvementStory.create({
      data: { title: 'b', storyText: 'b', priority: 'LOW', rank: 2000 },
    });

    expect(b.number).toBe(a.number + 1);
  });
});
