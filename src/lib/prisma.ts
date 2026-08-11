import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

function getDatabaseUrl() {
  // Se DATABASE_URL for enviada explicitamente (Postgres, Supabase, Neon, etc.)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL
  }

  // Em ambiente Vercel / Serverless onde a raiz /var/task é somente leitura (Read-Only)
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const tmpDbPath = "/tmp/dev.db"

    if (!fs.existsSync(tmpDbPath)) {
      const possibleSources = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.join(__dirname, "..", "..", "prisma", "dev.db"),
        path.join(__dirname, "..", "..", "..", "prisma", "dev.db")
      ]

      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath)
            console.log(`[PRISMA] Banco SQLite copiado de ${src} para ${tmpDbPath}`)
            break
          } catch (e) {
            console.error(`[PRISMA] Erro ao copiar ${src} para ${tmpDbPath}:`, e)
          }
        }
      }
    }
    return `file:${tmpDbPath}`
  }

  return "file:./dev.db"
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const getPrismaInstance = () => {
  if (!globalForPrisma.prisma || !(globalForPrisma.prisma as any).attendee) {
    const dbUrl = getDatabaseUrl()
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })
  }
  return globalForPrisma.prisma
}

export const prisma = getPrismaInstance()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
