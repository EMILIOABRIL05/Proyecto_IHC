import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { seedDemo } from './seed-demo.js';

// `pnpm db:seed`: carga el caso demo. El .env lo carga prisma.config.ts (Prisma 7 lo invoca así).
const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta DATABASE_URL (copia .env.example a .env).');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

seedDemo(prisma)
  .then(() => console.log('Seed demo cargado: "Checkout tienda universitaria".'))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
