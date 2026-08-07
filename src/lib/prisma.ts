import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Recriar o PrismaClient se a instância global antiga não possuir os modelos novos (ex: attendee)
const getPrismaInstance = () => {
  if (!globalForPrisma.prisma || !(globalForPrisma.prisma as any).attendee) {
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}

export const prisma = getPrismaInstance()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
