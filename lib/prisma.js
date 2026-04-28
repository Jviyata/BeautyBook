import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const getPrismaClient = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ log: ['error'] })
  }

  return globalForPrisma.prisma
}

export const prisma = new Proxy(
  {},
  {
    get(_, prop) {
      return getPrismaClient()[prop]
    },
  },
)

if (process.env.NODE_ENV === 'production') delete globalForPrisma.prisma
