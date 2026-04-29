import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

const prismaClientSingleton = () => {
  return new PrismaClient({ log: ['error'] })
}

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
