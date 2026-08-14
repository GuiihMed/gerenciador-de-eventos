"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUserTenantId } from "@/lib/tenant-helper"

export async function getEvents() {
  try {
    const tenantId = await getUserTenantId()
    const events = await prisma.event.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, events }
  } catch (error: any) {
    console.error("Erro ao buscar eventos:", error)
    return { success: false, events: [], error: error.message }
  }
}

export async function createEvent(data: {
  name: string
  startDate: string
  endDate: string
  location?: string
  visualIdentity?: string
}) {
  try {
    const tenantId = await getUserTenantId()

    const event = await prisma.event.create({
      data: {
        tenantId,
        name: data.name,
        location: data.location || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        visualIdentity: data.visualIdentity || null,
      },
    })

    revalidatePath("/admin/eventos")
    return { success: true, event }
  } catch (error: any) {
    console.error("Erro ao criar evento:", error)
    return { success: false, error: "Falha ao criar evento." }
  }
}

export async function updateEvent(
  id: string,
  data: {
    name: string
    startDate: string
    endDate: string
    location?: string
    visualIdentity?: string
  }
) {
  try {
    const tenantId = await getUserTenantId()

    const existing = await prisma.event.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      throw new Error("Evento não encontrado ou sem permissão")
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        visualIdentity: data.visualIdentity || null,
      },
    })

    revalidatePath("/admin/eventos")
    return { success: true, event }
  } catch (error: any) {
    console.error("Erro ao atualizar evento:", error)
    return { success: false, error: "Falha ao atualizar evento." }
  }
}

export async function deleteEvent(id: string) {
  try {
    const tenantId = await getUserTenantId()

    const existing = await prisma.event.findFirst({
      where: { id, tenantId },
    })

    if (!existing) {
      throw new Error("Evento não encontrado ou sem permissão")
    }

    await prisma.event.delete({
      where: { id },
    })

    revalidatePath("/admin/eventos")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao deletar evento:", error)
    return { success: false, error: "Falha ao remover evento." }
  }
}
