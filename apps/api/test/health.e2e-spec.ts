import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.factory.js';
import { loadEnv } from '../src/config/env.js';

describe('GET /api/v1/health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DATABASE_URL ??= 'postgresql://utd:utd@localhost:5432/utd';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app, loadEnv());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde { status: "ok" }', async () => {
    const respuesta = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(respuesta.body).toEqual({ status: 'ok' });
  });

  it('devuelve el formato de error común en una ruta inexistente', async () => {
    const respuesta = await request(app.getHttpServer()).get('/api/v1/no-existe').expect(404);

    expect(respuesta.body).toMatchObject({ code: 'NOT_FOUND' });
  });

  it('permite CORS solo desde WEB_ORIGIN', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');

    expect(respuesta.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
