"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSuperAdminMetrics() {
  try {
    const [totalTenants, totalEvents, totalUsers, recentTenants] = await Promise.all([
      prisma.tenant.count(),
      prisma.event.count(),
      prisma.user.count(),
      prisma.tenant.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { users: true, events: true }
          }
        }
      })
    ])

    return {
      success: true,
      metrics: {
        totalTenants,
        totalEvents,
        totalUsers,
      },
      recentTenants
    }
  } catch (error: any) {
    console.error("Erro ao buscar métricas do Super Admin:", error)
    return {
      success: false,
      metrics: { totalTenants: 0, totalEvents: 0, totalUsers: 0 },
      recentTenants: [],
      error: error.message
    }
  }
}

export async function getTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true, events: true }
        }
      }
    })
    return { success: true, tenants }
  } catch (error: any) {
    console.error("Erro ao buscar lista de tenants:", error)
    return { success: false, tenants: [], error: error.message }
  }
}

export async function toggleTenantStatus(tenantId: string, isActive: boolean) {
  try {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive }
    })
    revalidatePath("/super-admin/painel")
    revalidatePath("/super-admin/clientes")
    return { success: true, tenant }
  } catch (error: any) {
    console.error("Erro ao alterar status do tenant:", error)
    return { success: false, error: "Falha ao alterar status da empresa." }
  }
}

export async function createTenant(data: { name: string; domain?: string }) {
  try {
    const cleanDomain = data.domain
      ? data.domain.toLowerCase().replace(/[^a-z0-9.]/g, "")
      : `${data.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.gerenciador.app`

    const existingDomain = await prisma.tenant.findUnique({
      where: { domain: cleanDomain }
    })

    if (existingDomain) {
      return { success: false, error: "Este domínio já está em uso por outra empresa." }
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        domain: cleanDomain,
        isActive: true
      }
    })

    revalidatePath("/super-admin/painel")
    revalidatePath("/super-admin/clientes")
    return { success: true, tenant }
  } catch (error: any) {
    console.error("Erro ao criar empresa:", error)
    return { success: false, error: "Falha ao cadastrar empresa/tenant." }
  }
}

export async function deleteTenant(tenantId: string) {
  try {
    await prisma.tenant.delete({
      where: { id: tenantId }
    })
    revalidatePath("/super-admin/painel")
    revalidatePath("/super-admin/clientes")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao deletar tenant:", error)
    return { success: false, error: "Falha ao remover empresa." }
  }
}
