import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Providers } from './providers';
import { HomePage } from './home-page';

function mostrar() {
  return render(
    <Providers>
      <HomePage />
    </Providers>,
  );
}

describe('HomePage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('indica que el servidor está conectado cuando /health responde', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok' }), { status: 200 })),
    );

    mostrar();

    expect(await screen.findByText('Servidor conectado.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Usability Test Dashboard' }),
    ).toBeInTheDocument();
  });

  it('explica el problema con texto cuando no hay conexión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    mostrar();

    expect(
      await screen.findByText('No pudimos conectar con el servidor.', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('no tiene violaciones de accesibilidad (axe)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok' }), { status: 200 })),
    );

    const { container } = mostrar();
    await screen.findByText('Servidor conectado.');

    expect(await axe(container)).toHaveNoViolations();
  });
});
