import { describe, it, expect } from 'vitest';
import { loadEnv } from './env.js';

const base = {
  DATABASE_URL: 'postgresql://utd:utd@localhost:5432/utd',
};

describe('loadEnv', () => {
  it('aplica los valores por defecto de .env.example', () => {
    const env = loadEnv(base);

    expect(env.API_PORT).toBe(3000);
    expect(env.WEB_ORIGIN).toBe('http://localhost:5173');
    expect(env.AI_PROVIDER).toBe('mock');
    expect(env.AI_GROUP_SIZE).toBe(20);
    expect(env.MAX_UPLOAD_MB).toBe(10);
  });

  it('convierte los números que llegan como texto', () => {
    const env = loadEnv({ ...base, API_PORT: '4000', AI_TIMEOUT_MS: '15000' });

    expect(env.API_PORT).toBe(4000);
    expect(env.AI_TIMEOUT_MS).toBe(15000);
  });

  it('falla rápido y nombra la variable cuando falta DATABASE_URL', () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });

  it('falla si AI_PROVIDER=gemini y no hay GEMINI_API_KEY', () => {
    expect(() => loadEnv({ ...base, AI_PROVIDER: 'gemini', GEMINI_API_KEY: '' })).toThrow(
      /GEMINI_API_KEY/,
    );
  });

  it('acepta gemini cuando existe la clave', () => {
    const env = loadEnv({ ...base, AI_PROVIDER: 'gemini', GEMINI_API_KEY: 'clave-de-prueba' });

    expect(env.AI_PROVIDER).toBe('gemini');
  });

  it('rechaza un puerto inválido', () => {
    expect(() => loadEnv({ ...base, API_PORT: 'abc' })).toThrow(/API_PORT/);
  });
});
