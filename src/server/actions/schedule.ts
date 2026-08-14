"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUserTenantId } from "@/lib/tenant-helper"

// Garantir que exista um evento para o Tenant e retornar o evento ativo
export async function getActiveEvent() {
  const tenantId = await getUserTenantId()

  let event = await prisma.event.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "asc" }
  })

  if (!event) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    event = await prisma.event.create({
      data: {
        tenantId,
        name: "Meu Primeiro Evento",
        startDate: today,
        endDate: tomorrow,
        location: "Centro de Convenções",
      }
    })
  }

  return event
}

// Buscar todos os dados necessários para o gerenciador de grade
export async function getScheduleData() {
  try {
    const tenantId = await getUserTenantId()
    const event = await getActiveEvent()

    // Buscar os dias e toda a árvore da grade
    const eventData = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        days: {
          orderBy: { date: "asc" },
          include: {
            blocks: {
              orderBy: { startTime: "asc" },
              include: {
                activities: {
                  include: {
                    speakers: { include: { speaker: true } },
                    taxonomies: { include: { taxonomyValue: true } }
                  }
                }
              }
            }
          }
        }
      }
    })

    // Buscar palestrantes do tenant
    const speakers = await prisma.speaker.findMany({
      where: { tenantId },
      orderBy: { name: "asc" }
    })

    // Buscar ou criar a taxonomia de Salas
    let roomTaxonomy = await prisma.taxonomy.findFirst({
      where: { tenantId, type: "room" },
      include: { values: true }
    })

    if (!roomTaxonomy) {
      roomTaxonomy = await prisma.taxonomy.create({
        data: {
          tenantId,
          name: "Salas & Locais",
          type: "room",
          values: {
            create: [
              { label: "Palco Principal" },
              { label: "Auditório A" }
            ]
          }
        },
        include: { values: true }
      })
    }

    return {
      success: true,
      event: eventData,
      speakers,
      rooms: roomTaxonomy.values
    }
  } catch (error: any) {
    console.error("Erro ao carregar dados da programação:", error)
    return { success: false, error: error.message }
  }
}

// Ações de Dia
export async function createScheduleDay(dateStr: string, label?: string) {
  try {
    const event = await getActiveEvent()
    const day = await prisma.scheduleDay.create({
      data: {
        eventId: event.id,
        date: new Date(dateStr),
        label: label || `Dia ${new Date(dateStr).toLocaleDateString('pt-BR')}`
      }
    })
    revalidatePath("/admin/programacao")
    return { success: true, day }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteScheduleDay(dayId: string) {
  try {
    await prisma.scheduleDay.delete({ where: { id: dayId } })
    revalidatePath("/admin/programacao")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Ações de Bloco de Tempo
export async function createTimeBlock(scheduleDayId: string, startTime: string, endTime: string) {
  try {
    const block = await prisma.timeBlock.create({
      data: {
        scheduleDayId,
        startTime,
        endTime
      }
    })
    revalidatePath("/admin/programacao")
    return { success: true, block }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteTimeBlock(blockId: string) {
  try {
    await prisma.timeBlock.delete({ where: { id: blockId } })
    revalidatePath("/admin/programacao")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Ações de Atividades (Sessões)
export async function createActivity(data: {
  timeBlockId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  capacity?: number
  speakerIds?: string[]
  roomTaxonomyValueId?: string
}) {
  try {
    const activity = await prisma.activity.create({
      data: {
        timeBlockId: data.timeBlockId,
        title: data.title,
        description: data.description || null,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity ? Number(data.capacity) : null,
        speakers: data.speakerIds && data.speakerIds.length > 0 ? {
          create: data.speakerIds.map(speakerId => ({ speakerId }))
        } : undefined,
        taxonomies: data.roomTaxonomyValueId ? {
          create: [{ taxonomyValueId: data.roomTaxonomyValueId }]
        } : undefined
      }
    })

    revalidatePath("/admin/programacao")
    return { success: true, activity }
  } catch (error: any) {
    console.error("Erro ao criar atividade:", error)
    return { success: false, error: error.message }
  }
}

export async function updateActivity(id: string, data: {
  title: string
  description?: string
  startTime: string
  endTime: string
  capacity?: number
  speakerIds?: string[]
  roomTaxonomyValueId?: string
}) {
  try {
    // Atualizar dados básicos
    await prisma.activity.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity ? Number(data.capacity) : null,
      }
    })

    // Atualizar palestrantes (deletar antigos e vincular novos)
    await prisma.activitySpeaker.deleteMany({ where: { activityId: id } })
    if (data.speakerIds && data.speakerIds.length > 0) {
      await prisma.activitySpeaker.createMany({
        data: data.speakerIds.map(speakerId => ({ activityId: id, speakerId }))
      })
    }

    // Atualizar sala (deletar antigas e vincular nova)
    await prisma.activityTaxonomy.deleteMany({ where: { activityId: id } })
    if (data.roomTaxonomyValueId) {
      await prisma.activityTaxonomy.create({
        data: { activityId: id, taxonomyValueId: data.roomTaxonomyValueId }
      })
    }

    revalidatePath("/admin/programacao")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao atualizar atividade:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteActivity(id: string) {
  try {
    await prisma.activity.delete({ where: { id } })
    revalidatePath("/admin/programacao")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Ação rápida para criar Sala
export async function createRoom(name: string) {
  try {
    const tenantId = await getUserTenantId()
    let taxonomy = await prisma.taxonomy.findFirst({ where: { tenantId, type: "room" } })

    if (!taxonomy) {
      taxonomy = await prisma.taxonomy.create({
        data: { tenantId, name: "Salas & Locais", type: "room" }
      })
    }

    const value = await prisma.taxonomyValue.create({
      data: {
        taxonomyId: taxonomy.id,
        label: name
      }
    })

    revalidatePath("/admin/programacao")
    return { success: true, room: value }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
