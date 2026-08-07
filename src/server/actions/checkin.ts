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

// Bipar ou digitar o QR Code do Ingresso
export async function validateQRCodeToken(token: string) {
  try {
    const tenantId = await getUserTenantId()
    const cleanToken = token.trim()

    const attendeeModel = (prisma as any).attendee
    if (!attendeeModel) {
      throw new Error("Modelo de inscritos ainda não inicializado no servidor. Reinicie a aplicação.")
    }

    // Buscar o participante pelo QR Token ou ID
    const attendee = await attendeeModel.findFirst({
      where: {
        OR: [
          { qrCodeToken: cleanToken },
          { id: cleanToken }
        ],
        event: { tenantId }
      },
      include: { event: true }
    })

    if (!attendee) {
      return {
        success: false,
        status: "NOT_FOUND",
        message: "Ingresso não foi encontrado. Verifique o código e tente novamente."
      }
    }

    // Se já tiver realizado o credenciamento anteriormente
    if (attendee.isCheckedIn) {
      return {
        success: false,
        status: "ALREADY_CHECKED_IN",
        attendee,
        message: `ALERTA: Ingresso já utilizado em ${new Date(attendee.checkedInAt!).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}!`
      }
    }

    // Registrar o Check-in com sucesso
    const updated = await attendeeModel.update({
      where: { id: attendee.id },
      data: {
        isCheckedIn: true,
        checkedInAt: new Date()
      },
      include: { event: true }
    })

    revalidatePath("/admin/credenciamento")
    revalidatePath("/admin/inscricoes")
    revalidatePath("/admin/painel")

    return {
      success: true,
      status: "SUCCESS",
      attendee: updated,
      message: "ENTRADA LIBERADA! Credenciamento realizado com sucesso."
    }
  } catch (error: any) {
    console.error("Erro na validação do QR Code:", error)
    return {
      success: false,
      status: "ERROR",
      message: error.message || "Erro ao processar o credenciamento."
    }
  }
}

// Check-in Manual por Nome / Lista
export async function toggleManualCheckIn(attendeeId: string, checkInState: boolean) {
  try {
    const tenantId = await getUserTenantId()

    const attendeeModel = (prisma as any).attendee
    if (!attendeeModel) throw new Error("Modelo de participantes não disponível.")

    const attendee = await attendeeModel.findUnique({
      where: { id: attendeeId },
      include: { event: true }
    })

    if (!attendee || attendee.event.tenantId !== tenantId) {
      throw new Error("Participante não encontrado ou sem permissão.")
    }

    const updated = await attendeeModel.update({
      where: { id: attendeeId },
      data: {
        isCheckedIn: checkInState,
        checkedInAt: checkInState ? new Date() : null
      }
    })

    revalidatePath("/admin/credenciamento")
    revalidatePath("/admin/inscricoes")
    revalidatePath("/admin/painel")

    return { success: true, attendee: updated }
  } catch (error: any) {
    console.error("Erro ao alterar check-in manual:", error)
    return { success: false, error: error.message }
  }
}

// Carregar dados de credenciamento e estatísticas do evento
export async function getCheckInData() {
  try {
    const tenantId = await getUserTenantId()

    const event = await prisma.event.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "asc" }
    })

    if (!event) {
      return {
        success: true,
        event: null,
        attendees: [],
        stats: { total: 0, checkedIn: 0, pending: 0, percentage: 0 }
      }
    }

    const attendeeModel = (prisma as any).attendee
    const attendees = attendeeModel
      ? await attendeeModel.findMany({
          where: { eventId: event.id },
          orderBy: { name: "asc" }
        })
      : []

    const total = attendees.length
    const checkedIn = attendees.filter((a: any) => a.isCheckedIn).length
    const pending = total - checkedIn
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0

    return {
      success: true,
      event: {
        id: event.id,
        name: event.name
      },
      attendees,
      stats: {
        total,
        checkedIn,
        pending,
        percentage
      }
    }
  } catch (error: any) {
    console.error("Erro ao buscar dados de credenciamento:", error)
    return {
      success: false,
      error: error.message,
      event: null,
      attendees: [],
      stats: { total: 0, checkedIn: 0, pending: 0, percentage: 0 }
    }
  }
}
