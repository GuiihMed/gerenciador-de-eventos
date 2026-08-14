import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getUserTenantId(): Promise<string> {
  let userId: string | null = null
  try {
    const session = await auth()
    userId = session?.user?.id || null
  } catch (e) {}

  if (userId) {
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId },
      select: { tenantId: true }
    }).catch(() => null)

    if (tenantUser?.tenantId) {
      return tenantUser.tenantId
    }
  }

  // Fallback 1: Buscar o primeiro tenantUser do banco
  const anyTenantUser = await prisma.tenantUser.findFirst({
    select: { tenantId: true }
  }).catch(() => null)

  if (anyTenantUser?.tenantId) {
    return anyTenantUser.tenantId
  }

  // Fallback 2: Buscar o primeiro Tenant do banco ou auto-criar
  let tenant = await prisma.tenant.findFirst().catch(() => null)
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "MedAcademy Eventos",
        domain: "medacademy.mestre.app"
      }
    }).catch(() => null)
  }

  if (tenant?.id) {
    return tenant.id
  }

  throw new Error("Não foi possível carregar os dados do tenant.")
}
