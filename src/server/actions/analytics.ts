"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

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

export async function getDashboardAnalytics() {
  try {
    const tenantId = await getUserTenantId()

    // 1. Buscar o evento ativo
    const activeEvent = await prisma.event.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "asc" }
    })

    const eventId = activeEvent?.id

    // 2. Contagens gerais
    const [totalSpeakers, roomTaxonomy, attendees, activitiesCount] = await Promise.all([
      prisma.speaker.count({ where: { tenantId } }),
      prisma.taxonomy.findFirst({
        where: { tenantId, type: "room" },
        include: {
          values: {
            include: {
              _count: { select: { activities: true } }
            }
          }
        }
      }),
      eventId && (prisma as any).attendee
        ? (prisma as any).attendee.findMany({ where: { eventId } })
        : Promise.resolve([]),
      eventId
        ? prisma.activity.count({
            where: {
              block: {
                day: {
                  eventId
                }
              }
            }
          })
        : Promise.resolve(0)
    ])

    // 3. Distribuição de tipos de ingressos
    const ticketBreakdown = {
      standard: attendees.filter((a: any) => a.ticketType === "STANDARD").length,
      vip: attendees.filter((a: any) => a.ticketType === "VIP").length,
      press: attendees.filter((a: any) => a.ticketType === "PRESS").length,
    }

    // 4. Palestrantes mais populares (com mais sessões)
    const topSpeakers = await prisma.speaker.findMany({
      where: { tenantId },
      take: 5,
      include: {
        _count: { select: { activities: true } }
      },
      orderBy: {
        activities: { _count: "desc" }
      }
    })

    // 5. Ocupação por sala
    const roomOccupancy = roomTaxonomy?.values.map(room => ({
      id: room.id,
      label: room.label,
      activityCount: room._count.activities
    })) || []

    return {
      success: true,
      event: activeEvent,
      metrics: {
        totalAttendees: attendees.length,
        totalSpeakers,
        totalActivities: activitiesCount,
        totalRooms: roomOccupancy.length,
      },
      ticketBreakdown,
      topSpeakers,
      roomOccupancy
    }
  } catch (error: any) {
    console.error("Erro ao carregar estatísticas do dashboard:", error)
    return {
      success: false,
      error: error.message,
      event: null,
      metrics: { totalAttendees: 0, totalSpeakers: 0, totalActivities: 0, totalRooms: 0 },
      ticketBreakdown: { standard: 0, vip: 0, press: 0 },
      topSpeakers: [],
      roomOccupancy: []
    }
  }
}
