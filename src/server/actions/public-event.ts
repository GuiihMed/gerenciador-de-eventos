"use server"

import { prisma } from "@/lib/prisma"

export async function getPublicEvent(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tenant: {
          select: {
            name: true,
            domain: true
          }
        },
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

    if (!event) {
      return { success: false, error: "Evento não encontrado" }
    }

    return { success: true, event }
  } catch (error: any) {
    console.error("Erro ao buscar evento público:", error)
    return { success: false, error: error.message }
  }
}
