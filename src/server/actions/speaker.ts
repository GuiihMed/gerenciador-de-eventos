"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUserTenantId } from "@/lib/tenant-helper"

export async function getSpeakers() {
  try {
    const tenantId = await getUserTenantId()
    const speakers = await prisma.speaker.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    })
    return { success: true, speakers }
  } catch (error: any) {
    console.error("Erro ao buscar palestrantes:", error)
    return { success: false, error: error.message }
  }
}

export async function createSpeaker(data: { name: string; email?: string; bio?: string; company?: string; role?: string; avatarUrl?: string }) {
  try {
    const tenantId = await getUserTenantId()

    const speaker = await prisma.speaker.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email || null,
        bio: data.bio || null,
        company: data.company || null,
        role: data.role || null,
        avatarUrl: data.avatarUrl || null,
      }
    })

    revalidatePath("/admin/palestrantes")
    return { success: true, speaker }
  } catch (error: any) {
    console.error("Erro ao criar palestrante:", error)
    return { success: false, error: "Falha ao cadastrar palestrante." }
  }
}

export async function updateSpeaker(id: string, data: { name: string; email?: string; bio?: string; company?: string; role?: string; avatarUrl?: string }) {
  try {
    const tenantId = await getUserTenantId()

    // Garantir que o speaker pertence ao tenant
    const existing = await prisma.speaker.findFirst({
      where: { id, tenantId }
    })

    if (!existing) {
      throw new Error("Palestrante não encontrado ou sem permissão")
    }

    const speaker = await prisma.speaker.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email || null,
        bio: data.bio || null,
        company: data.company || null,
        role: data.role || null,
        avatarUrl: data.avatarUrl || null,
      }
    })

    revalidatePath("/admin/palestrantes")
    return { success: true, speaker }
  } catch (error: any) {
    console.error("Erro ao atualizar palestrante:", error)
    return { success: false, error: "Falha ao editar palestrante." }
  }
}

export async function deleteSpeaker(id: string) {
  try {
    const tenantId = await getUserTenantId()

    // Garantir que o speaker pertence ao tenant antes de deletar
    const existing = await prisma.speaker.findFirst({
      where: { id, tenantId }
    })

    if (!existing) {
      throw new Error("Palestrante não encontrado ou sem permissão")
    }

    await prisma.speaker.delete({
      where: { id }
    })

    revalidatePath("/admin/palestrantes")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao deletar palestrante:", error)
    return { success: false, error: "Falha ao remover palestrante." }
  }
}
