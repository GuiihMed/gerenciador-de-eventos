"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function getUserTenantId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const tenantUser = await prisma.tenantUser.findFirst({
    where: { userId: session.user.id },
    select: { tenantId: true }
  })

  if (!tenantUser) throw new Error("Usuário não pertence a nenhum tenant")
  return tenantUser.tenantId
}

// Buscar ou inicializar as taxonomias do Tenant (Salas, Trilhas e Formatos)
export async function getTaxonomies() {
  try {
    const tenantId = await getUserTenantId()

    // Buscar taxonomias existentes
    let taxonomies = await prisma.taxonomy.findMany({
      where: { tenantId },
      include: {
        values: {
          orderBy: { label: "asc" },
          include: {
            _count: {
              select: { activities: true }
            }
          }
        }
      }
    })

    // Garantir que as 3 taxonomias essenciais existam
    const requiredTypes = [
      { type: "room", name: "Salas & Auditórios" },
      { type: "track", name: "Trilhas & Temas" },
      { type: "format", name: "Formatos de Sessão" }
    ]

    for (const req of requiredTypes) {
      const exists = taxonomies.some(t => t.type === req.type)
      if (!exists) {
        await prisma.taxonomy.create({
          data: {
            tenantId,
            name: req.name,
            type: req.type
          }
        })
      }
    }

    // Refazer busca se criou alguma nova
    taxonomies = await prisma.taxonomy.findMany({
      where: { tenantId },
      include: {
        values: {
          orderBy: { label: "asc" },
          include: {
            _count: {
              select: { activities: true }
            }
          }
        }
      }
    })

    const rooms = taxonomies.find(t => t.type === "room")?.values || []
    const tracks = taxonomies.find(t => t.type === "track")?.values || []
    const formats = taxonomies.find(t => t.type === "format")?.values || []

    return {
      success: true,
      taxonomies: {
        rooms,
        tracks,
        formats
      }
    }
  } catch (error: any) {
    console.error("Erro ao buscar salas e trilhas:", error)
    return {
      success: false,
      error: error.message,
      taxonomies: { rooms: [], tracks: [], formats: [] }
    }
  }
}

export async function createTaxonomyValue(type: "room" | "track" | "format", label: string) {
  try {
    const tenantId = await getUserTenantId()

    let taxonomy = await prisma.taxonomy.findFirst({
      where: { tenantId, type }
    })

    if (!taxonomy) {
      const name = type === "room" ? "Salas & Auditórios" : type === "track" ? "Trilhas & Temas" : "Formatos de Sessão"
      taxonomy = await prisma.taxonomy.create({
        data: { tenantId, name, type }
      })
    }

    const value = await prisma.taxonomyValue.create({
      data: {
        taxonomyId: taxonomy.id,
        label: label.trim()
      }
    })

    revalidatePath("/admin/salas")
    revalidatePath("/admin/programacao")
    return { success: true, value }
  } catch (error: any) {
    console.error("Erro ao criar item de taxonomia:", error)
    return { success: false, error: "Falha ao cadastrar item." }
  }
}

export async function updateTaxonomyValue(id: string, label: string) {
  try {
    const tenantId = await getUserTenantId()

    const value = await prisma.taxonomyValue.findUnique({
      where: { id },
      include: { taxonomy: true }
    })

    if (!value || value.taxonomy.tenantId !== tenantId) {
      throw new Error("Item não encontrado ou sem permissão.")
    }

    const updated = await prisma.taxonomyValue.update({
      where: { id },
      data: { label: label.trim() }
    })

    revalidatePath("/admin/salas")
    revalidatePath("/admin/programacao")
    return { success: true, value: updated }
  } catch (error: any) {
    console.error("Erro ao atualizar item de taxonomia:", error)
    return { success: false, error: "Falha ao atualizar item." }
  }
}

export async function deleteTaxonomyValue(id: string) {
  try {
    const tenantId = await getUserTenantId()

    const value = await prisma.taxonomyValue.findUnique({
      where: { id },
      include: { taxonomy: true }
    })

    if (!value || value.taxonomy.tenantId !== tenantId) {
      throw new Error("Item não encontrado ou sem permissão.")
    }

    await prisma.taxonomyValue.delete({
      where: { id }
    })

    revalidatePath("/admin/salas")
    revalidatePath("/admin/programacao")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao deletar item de taxonomia:", error)
    return { success: false, error: "Falha ao remover item." }
  }
}
