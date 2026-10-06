import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Un error de la API (400, 404, 409…) no mejora al repetirse; solo se reintenta la red.
        retry: (intentos, error) =>
          error instanceof ApiError && error.code === 'NETWORK_ERROR' && intentos < 2,
      },
    },
  });
}
