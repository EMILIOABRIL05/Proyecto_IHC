import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

// Página provisional de DI-04. El layout, la navegación y el diseño los define DI-05.
export function HomePage() {
  const salud = useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<{ status: string }>('/health'),
  });

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Usability Test Dashboard</h1>
      <p className="mt-2 text-slate-700">
        Planifica pruebas de usabilidad, registra sesiones y analiza los resultados.
      </p>
      <p role="status" className="mt-6 text-slate-900">
        {salud.isPending && 'Comprobando la conexión con el servidor…'}
        {salud.isError && 'No pudimos conectar con el servidor.'}
        {salud.isSuccess && 'Servidor conectado.'}
      </p>
    </main>
  );
}
