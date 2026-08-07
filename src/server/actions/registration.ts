"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { sendRegistrationConfirmationEmail } from "@/server/actions/email"

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

// Inscrição pública do participante (não requer autenticação por sessão do admin)
export async function registerAttendee(eventId: string, data: {
  name: string
  email: string
  phone?: string
  company?: string
  role?: string
  ticketType?: string
}) {
  try {
    const cleanEmail = data.email.trim().toLowerCase()

    // Verificar se o evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return { success: false, error: "Evento não foi encontrado." }
    }

    const attendeeModel = (prisma as any).attendee
    if (!attendeeModel) {
      throw new Error("Modelo de inscritos indisponível.")
    }

    // Verificar se o e-mail já está inscrito no mesmo evento
    const existing = await attendeeModel.findUnique({
      where: {
        eventId_email: {
          eventId,
          email: cleanEmail
        }
      }
    })

    if (existing) {
      return {
        success: false,
        error: "Este e-mail já possui uma inscrição realizada para este evento.",
        attendee: existing
      }
    }

    const attendee = await attendeeModel.create({
      data: {
        eventId,
        name: data.name.trim(),
        email: cleanEmail,
        phone: data.phone || null,
        company: data.company || null,
        role: data.role || null,
        ticketType: data.ticketType || "STANDARD"
      }
    })

    // Disparar e-mail de confirmação e ingresso por e-mail (sem bloquear o retorno)
    sendRegistrationConfirmationEmail(attendee.id).catch(err => {
      console.error("Tentativa de e-mail pós-cadastro falhou:", err)
    })

    revalidatePath(`/evento/${eventId}`)
    revalidatePath("/admin/inscricoes")

    return { success: true, attendee }
  } catch (error: any) {
    console.error("Erro ao registrar participante:", error)
    return { success: false, error: "Falha ao processar a inscrição." }
  }
}

// Buscar todos os inscritos para o painel administrativo do tenant
export async function getEventAttendees(eventId?: string) {
  try {
    const tenantId = await getUserTenantId()

    // Se não passar eventId, busca do primeiro evento do tenant
    let targetEventId = eventId

    if (!targetEventId) {
      const activeEvent = await prisma.event.findFirst({
        where: { tenantId },
        orderBy: { createdAt: "asc" }
      })
      if (!activeEvent) {
        return { success: true, attendees: [], event: null }
      }
      targetEventId = activeEvent.id
    }

    const event = await prisma.event.findFirst({
      where: { id: targetEventId, tenantId }
    })

    if (!event) throw new Error("Evento não encontrado ou sem acesso.")

    const attendeeModel = (prisma as any).attendee
    const attendees = attendeeModel
      ? await attendeeModel.findMany({
          where: { eventId: event.id },
          orderBy: { createdAt: "desc" }
        })
      : []

    return {
      success: true,
      event: {
        id: event.id,
        name: event.name
      },
      attendees
    }
  } catch (error: any) {
    console.error("Erro ao buscar inscrições:", error)
    return { success: false, error: error.message, attendees: [] }
  }
}

// Deletar / Cancelar Inscrição
export async function deleteAttendee(attendeeId: string) {
  try {
    const tenantId = await getUserTenantId()
    const attendeeModel = (prisma as any).attendee
    if (!attendeeModel) throw new Error("Modelo de inscritos indisponível.")

    const attendee = await attendeeModel.findUnique({
      where: { id: attendeeId },
      include: { event: true }
    })

    if (!attendee || attendee.event.tenantId !== tenantId) {
      throw new Error("Inscrição não encontrada ou sem permissão.")
    }

    await attendeeModel.delete({
      where: { id: attendeeId }
    })

    revalidatePath("/admin/inscricoes")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao deletar inscrição:", error)
    return { success: false, error: error.message }
  }
}
