"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { transporter, generateTicketEmailHTML, generateMassEmailHTML } from "@/lib/email"

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

// Disparar e-mail de confirmação pós-inscrição
export async function sendRegistrationConfirmationEmail(attendeeId: string, originUrl?: string) {
  try {
    const attendeeModel = (prisma as any).attendee
    if (!attendeeModel) return { success: false, error: "Modelo de participantes indisponível." }

    const attendee = await attendeeModel.findUnique({
      where: { id: attendeeId },
      include: { event: true }
    })

    if (!attendee) return { success: false, error: "Inscrição não encontrada." }

    const origin = originUrl || process.env.NEXTAUTH_URL || "http://localhost:3000"
    const ticketUrl = `${origin}/evento/${attendee.eventId}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(attendee.qrCodeToken || attendee.id)}`

    const htmlContent = generateTicketEmailHTML({
      attendeeName: attendee.name,
      eventName: attendee.event.name,
      ticketType: attendee.ticketType || "STANDARD",
      ticketUrl,
      qrCodeUrl,
      eventDate: attendee.event.startDate ? new Date(attendee.event.startDate).toLocaleDateString("pt-BR") : undefined,
      eventLocation: attendee.event.location || undefined
    })

    await transporter.sendMail({
      from: `"${attendee.event.name}" <nao-responda@gerenciador.app>`,
      to: attendee.email,
      subject: `Confirmação de Inscrição — ${attendee.event.name}`,
      html: htmlContent
    })

    return { success: true, message: `E-mail enviado para ${attendee.email}` }
  } catch (error: any) {
    console.error("Erro ao enviar e-mail de confirmação:", error)
    return { success: false, error: error.message || "Erro no envio do e-mail." }
  }
}

// Reenviar ingresso por e-mail (Ação Admin)
export async function resendAttendeeTicket(attendeeId: string) {
  try {
    const tenantId = await getUserTenantId()
    const attendeeModel = (prisma as any).attendee

    const attendee = await attendeeModel.findUnique({
      where: { id: attendeeId },
      include: { event: true }
    })

    if (!attendee || attendee.event.tenantId !== tenantId) {
      throw new Error("Participante não encontrado ou sem permissão.")
    }

    return await sendRegistrationConfirmationEmail(attendeeId)
  } catch (error: any) {
    console.error("Erro ao reenviar ingresso por e-mail:", error)
    return { success: false, error: error.message }
  }
}

// Disparar comunicado em massa para todos os inscritos do evento
export async function sendMassEventEmail(eventId: string, subject: string, message: string) {
  try {
    const tenantId = await getUserTenantId()

    const event = await prisma.event.findFirst({
      where: { id: eventId, tenantId }
    })

    if (!event) throw new Error("Evento não encontrado ou sem permissão.")

    const attendeeModel = (prisma as any).attendee
    const attendees = await attendeeModel.findMany({
      where: { eventId },
      select: { email: true, name: true }
    })

    if (attendees.length === 0) {
      return { success: false, error: "Nenhum participante inscrito no evento para enviar comunicados." }
    }

    const htmlContent = generateMassEmailHTML({
      eventName: event.name,
      subject,
      message
    })

    let sentCount = 0
    for (const att of attendees) {
      try {
        await transporter.sendMail({
          from: `"${event.name}" <comunicados@gerenciador.app>`,
          to: att.email,
          subject: `${subject} — ${event.name}`,
          html: htmlContent
        })
        sentCount++
      } catch (err) {
        console.error(`Erro ao enviar e-mail em massa para ${att.email}:`, err)
      }
    }

    return {
      success: true,
      message: `Comunicado disparado com sucesso para ${sentCount} participantes de um total de ${attendees.length}!`
    }
  } catch (error: any) {
    console.error("Erro no disparo de e-mails em massa:", error)
    return { success: false, error: error.message }
  }
}
