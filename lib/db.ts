import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/app/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_POOLER,
});

const prismaClientSingleton = () =>
  new PrismaClient({
    adapter,
  });

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
