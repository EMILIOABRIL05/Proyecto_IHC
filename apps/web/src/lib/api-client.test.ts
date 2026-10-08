import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api-client';

function responder(status: number, cuerpo?: unknown) {
  return vi.fn().mockResolvedValue(
    new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('apiFetch', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('devuelve el JSON de una respuesta correcta', async () => {
    vi.stubGlobal('fetch', responder(200, { status: 'ok' }));

    await expect(apiFetch<{ status: string }>('/health')).resolves.toEqual({ status: 'ok' });
  });

  it('llama a la URL base de la API y envía JSON cuando hay cuerpo', async () => {
    const fetchMock = responder(201, { id: '1' });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/plans', { method: 'POST', json: { name: 'Piloto' } });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/plans$/);
    expect(init.body).toBe(JSON.stringify({ name: 'Piloto' }));
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
  });

  it('devuelve undefined en una respuesta 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(apiFetch('/plans/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('interpreta el formato { code, message, details } como ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      responder(409, { code: 'QUOTA_FULL', message: 'Cupo lleno.', details: { cupo: 8 } }),
    );

    const error = await apiFetch('/plans/1/sessions', { method: 'POST' }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      code: 'QUOTA_FULL',
      message: 'Cupo lleno.',
      details: { cupo: 8 },
    });
  });

  it('expone los errores por campo de VALIDATION_ERROR', async () => {
    vi.stubGlobal(
      'fetch',
      responder(400, {
        code: 'VALIDATION_ERROR',
        message: 'Revisa los campos marcados.',
        details: { fields: { name: 'Escribe un nombre' } },
      }),
    );

    const error = (await apiFetch('/plans', { method: 'POST' }).catch(
      (e: unknown) => e,
    )) as ApiError;

    expect(error.fieldErrors).toEqual({ name: 'Escribe un nombre' });
  });

  it('no inventa errores por campo cuando no los hay', async () => {
    vi.stubGlobal('fetch', responder(404, { code: 'NOT_FOUND', message: 'No existe.' }));

    const error = (await apiFetch('/plans/x').catch((e: unknown) => e)) as ApiError;

    expect(error.fieldErrors).toEqual({});
  });

  it('trata una respuesta de error que no sigue el formato como INTERNAL_ERROR', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })),
    );

    const error = (await apiFetch('/plans').catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.status).toBe(502);
    expect(error.message).not.toContain('html');
  });

  it('avisa con un mensaje claro cuando no hay conexión con el servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const error = (await apiFetch('/plans').catch((e: unknown) => e)) as ApiError;

    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/conectar/i);
  });
});
