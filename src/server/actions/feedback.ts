"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUserTenantId } from "@/lib/tenant-helper"

// Buscar informações da palestra para a página pública de avaliação
export async function getActivityPublicDetails(activityId: string) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        block: {
          include: {
            day: {
              include: {
                event: true
              }
            }
          }
        },
        speakers: {
          include: {
            speaker: true
          }
        },
        taxonomies: {
          include: {
            taxonomyValue: {
              include: {
                taxonomy: true
              }
            }
          }
        }
      }
    })

    if (!activity) {
      return { success: false, error: "Palestra / Aula não foi encontrada." }
    }

    const room = activity.taxonomies.find(t => t.taxonomyValue.taxonomy.type === "room")?.taxonomyValue.label

    return {
      success: true,
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        startTime: activity.startTime,
        endTime: activity.endTime,
        room,
        eventName: activity.block.day.event.name,
        eventId: activity.block.day.event.id,
        speakers: activity.speakers.map(s => ({
          name: s.speaker.name,
          role: s.speaker.role,
          avatarUrl: s.speaker.avatarUrl
        }))
      }
    }
  } catch (error: any) {
    console.error("Erro ao buscar detalhes da aula para avaliação:", error)
    return { success: false, error: "Falha ao carregar aula." }
  }
}

// Submeter a avaliação (1 a 5 estrelas)
export async function submitActivityFeedback(
  activityId: string,
  rating: number,
  comment?: string,
  authorName?: string
) {
  try {
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Por favor escolha uma nota entre 1 e 5 estrelas." }
    }

    const feedbackModel = (prisma as any).activityFeedback || (prisma as any).ActivityFeedback
    if (!feedbackModel) {
      throw new Error("Modelo de avaliações não disponível no servidor.")
    }

    const feedback = await feedbackModel.create({
      data: {
        activityId,
        rating,
        comment: comment?.trim() || null,
        authorName: authorName?.trim() || null
      }
    })

    revalidatePath(`/avaliar/${activityId}`)
    revalidatePath("/admin/avaliacoes")

    return { success: true, feedback }
  } catch (error: any) {
    console.error("Erro ao enviar avaliação:", error)
    return { success: false, error: error.message || "Erro ao salvar sua avaliação." }
  }
}

// Relatório completo de avaliações para o painel admin
export async function getFeedbackAnalytics() {
  try {
    const tenantId = await getUserTenantId()

    const activeEvent = await prisma.event.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "asc" }
    })

    if (!activeEvent) {
      return {
        success: true,
        summary: { totalFeedbacks: 0, overallAverage: 0 },
        activities: []
      }
    }

    const activities = await prisma.activity.findMany({
      where: {
        block: {
          day: {
            eventId: activeEvent.id
          }
        }
      },
      include: {
        speakers: {
          include: { speaker: true }
        },
        block: true,
        feedbacks: {
          orderBy: { createdAt: "desc" }
        }
      }
    })

    let totalFeedbacksCount = 0
    let totalRatingSum = 0

    const formattedActivities = activities.map(act => {
      const feedbacks = (act as any).feedbacks || []
      const count = feedbacks.length
      const ratingSum = feedbacks.reduce((acc: number, f: any) => acc + f.rating, 0)
      const avgRating = count > 0 ? (ratingSum / count).toFixed(1) : "0.0"

      totalFeedbacksCount += count
      totalRatingSum += ratingSum

      return {
        id: act.id,
        title: act.title,
        time: `${act.startTime} - ${act.endTime}`,
        speakers: act.speakers.map(s => s.speaker.name).join(", ") || "Sem palestrante",
        feedbackCount: count,
        avgRating: parseFloat(avgRating),
        feedbacks: feedbacks
      }
    })

    const overallAverage = totalFeedbacksCount > 0 ? (totalRatingSum / totalFeedbacksCount).toFixed(1) : "0.0"

    return {
      success: true,
      eventName: activeEvent.name,
      summary: {
        totalFeedbacks: totalFeedbacksCount,
        overallAverage: parseFloat(overallAverage)
      },
      activities: formattedActivities
    }
  } catch (error: any) {
    console.error("Erro ao buscar relatório de avaliações:", error)
    return {
      success: false,
      error: error.message,
      summary: { totalFeedbacks: 0, overallAverage: 0 },
      activities: []
    }
  }
}
