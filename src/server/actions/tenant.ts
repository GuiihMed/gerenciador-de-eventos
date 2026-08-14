"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUserTenantId } from "@/lib/tenant-helper"

export interface TenantThemeConfig {
  logoUrl?: string
  primaryColor?: string
  accentColor?: string
  welcomeMessage?: string
}

export async function getTenantSettings() {
  try {
    const tenantId = await getUserTenantId()

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) throw new Error("Empresa não encontrada")

    let themeConfig: TenantThemeConfig = {}
    if (tenant.themeConfig) {
      try {
        themeConfig = JSON.parse(tenant.themeConfig)
      } catch (e) {
        console.error("Erro ao converter themeConfig:", e)
      }
    }

    return {
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        themeConfig
      }
    }
  } catch (error: any) {
    console.error("Erro ao buscar configurações da empresa:", error)
    return { success: false, error: error.message }
  }
}

export async function updateTenantSettings(data: {
  name: string
  domain?: string
  logoUrl?: string
  primaryColor?: string
  welcomeMessage?: string
}) {
  try {
    const tenantId = await getUserTenantId()

    const cleanDomain = data.domain
      ? data.domain.toLowerCase().replace(/[^a-z0-9.]/g, "")
      : undefined

    if (cleanDomain) {
      const existingDomain = await prisma.tenant.findFirst({
        where: {
          domain: cleanDomain,
          NOT: { id: tenantId }
        }
      })

      if (existingDomain) {
        return { success: false, error: "Este domínio já está sendo utilizado por outra empresa." }
      }
    }

    // Montar objeto de tema
    const themeConfig: TenantThemeConfig = {
      logoUrl: data.logoUrl || "",
      primaryColor: data.primaryColor || "#3b82f6",
      welcomeMessage: data.welcomeMessage || ""
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        ...(cleanDomain ? { domain: cleanDomain } : {}),
        themeConfig: JSON.stringify(themeConfig)
      }
    })

    revalidatePath("/admin/configuracoes")
    revalidatePath("/admin/painel")
    revalidatePath("/admin/eventos")

    return {
      success: true,
      tenant: {
        id: updated.id,
        name: updated.name,
        domain: updated.domain,
        themeConfig
      }
    }
  } catch (error: any) {
    console.error("Erro ao atualizar configurações da empresa:", error)
    return { success: false, error: "Falha ao salvar as configurações." }
  }
}
