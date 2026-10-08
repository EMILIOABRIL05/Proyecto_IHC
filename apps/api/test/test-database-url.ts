// Valor por defecto = servicio `db_test` de docker-compose.yml.
export const TEST_DATABASE_URL =
  process.env.DATABASE_URL_TEST || 'postgresql://utd:utd@localhost:5433/utd_test';
