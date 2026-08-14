"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendRegistrationConfirmationEmail } from "@/server/actions/email"
import { getUserTenantId } from "@/lib/tenant-helper"

// 1. Importação de Palestrantes
export async function importSpeakersCSV(rows: Array<{
  name: string
  email?: string
  company?: string
  role?: string
  bio?: string
  avatarUrl?: string
}>) {
  try {
    const tenantId = await getUserTenantId()

    let count = 0
    for (const row of rows) {
      if (!row.name || !row.name.trim()) continue

      await prisma.speaker.create({
        data: {
          tenantId,
          name: row.name.trim(),
          email: row.email?.trim() || null,
          company: row.company?.trim() || null,
          role: row.role?.trim() || null,
          bio: row.bio?.trim() || null,
          avatarUrl: row.avatarUrl?.trim() || null
        }
      })
      count++
    }

    revalidatePath("/admin/palestrantes")
    revalidatePath("/admin/programacao")
    return { success: true, count, message: `${count} palestrantes importados com sucesso!` }
  } catch (error: any) {
    console.error("Erro ao importar palestrantes via CSV:", error)
    return { success: false, error: error.message || "Erro na importação de palestrantes." }
  }
}

// 2. Importação de Participantes / Inscritos
export async function importAttendeesCSV(rows: Array<{
  name: string
  email: string
  phone?: string
  company?: string
  role?: string
  ticketType?: string
}>) {
  try {
    const tenantId = await getUserTenantId()

    const activeEvent = await prisma.event.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "asc" }
    })

    if (!activeEvent) {
      return { success: false, error: "Nenhum evento ativo para vincular as inscrições." }
    }

    const attendeeModel = (prisma as any).attendee
    if (!attendeeModel) throw new Error("Modelo de inscritos indisponível.")

    let count = 0
    for (const row of rows) {
      if (!row.name || !row.email || !row.email.trim()) continue

      const cleanEmail = row.email.trim().toLowerCase()

      const existing = await attendeeModel.findUnique({
        where: {
          eventId_email: {
            eventId: activeEvent.id,
            email: cleanEmail
          }
        }
      })

      if (!existing) {
        const created = await attendeeModel.create({
          data: {
            eventId: activeEvent.id,
            name: row.name.trim(),
            email: cleanEmail,
            phone: row.phone?.trim() || null,
            company: row.company?.trim() || null,
            role: row.role?.trim() || null,
            ticketType: (row.ticketType?.toUpperCase() || "STANDARD").trim()
          }
        })

        // Disparar e-mail de ingresso em segundo plano
        sendRegistrationConfirmationEmail(created.id).catch(err => {
          console.error("Erro no envio de e-mail de confirmação pós-importação:", err)
        })

        count++
      }
    }

    revalidatePath("/admin/inscricoes")
    revalidatePath("/admin/painel")
    return { success: true, count, message: `${count} participantes importados e cadastrados com sucesso!` }
  } catch (error: any) {
    console.error("Erro ao importar participantes via CSV:", error)
    return { success: false, error: error.message || "Erro na importação de inscritos." }
  }
}

// 3. Importação Automática da Grade de Programação
export async function importScheduleCSV(rows: Array<{
  date: string             // "YYYY-MM-DD"
  startTime: string        // "HH:mm"
  endTime: string          // "HH:mm"
  title: string
  description?: string
  room?: string            // Nome da Sala
  speakerName?: string     // Nome do Palestrante
}>) {
  try {
    const tenantId = await getUserTenantId()

    const activeEvent = await prisma.event.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "asc" }
    })

    if (!activeEvent) {
      return { success: false, error: "Nenhum evento ativo para criar a programação." }
    }

    // Buscar ou garantir taxonomia de Sala
    let roomTaxonomy = await prisma.taxonomy.findFirst({
      where: { tenantId, type: "room" }
    })

    if (!roomTaxonomy) {
      roomTaxonomy = await prisma.taxonomy.create({
        data: { tenantId, name: "Salas & Auditórios", type: "room" }
      })
    }

function parseCSVDate(dateStr: string | undefined, fallbackDate: Date): Date {
  if (!dateStr || !dateStr.trim()) return fallbackDate

  const clean = dateStr.trim().replace(/^["']|["']$/g, "")

  // 1. Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const d = new Date(clean + "T00:00:00.000Z")
    if (!isNaN(d.getTime())) return d
  }

  // 2. Formato DD/MM/YYYY ou DD-MM-YYYY (Padrão Excel PT-BR)
  const brMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (brMatch) {
    const day = parseInt(brMatch[1], 10)
    const month = parseInt(brMatch[2], 10) - 1
    let year = parseInt(brMatch[3], 10)
    if (year < 100) year += 2000
    const d = new Date(Date.UTC(year, month, day))
    if (!isNaN(d.getTime())) return d
  }

  // 3. Fallback construtor Date do JS
  const parsed = new Date(clean)
  if (!isNaN(parsed.getTime())) return parsed

  // 4. Se tudo falhar, usa a data inicial do evento
  return fallbackDate
}

    let count = 0
    for (const row of rows) {
      if (!row.title || !row.title.trim()) continue

      // Tratar a data da linha de forma segura
      const targetDate = parseCSVDate(row.date, activeEvent.startDate)

      // 1. Encontrar ou criar o Dia
      let scheduleDay = await prisma.scheduleDay.findFirst({
        where: {
          eventId: activeEvent.id,
          date: targetDate
        }
      })

      if (!scheduleDay) {
        scheduleDay = await prisma.scheduleDay.create({
          data: {
            eventId: activeEvent.id,
            date: targetDate,
            label: `Dia ${targetDate.getUTCDate()} (${targetDate.toLocaleDateString("pt-BR", { month: "short" })})`
          }
        })
      }

      // Tratar horários com fallback seguro
      const startTime = (row.startTime && row.startTime.trim()) || "09:00"
      const endTime = (row.endTime && row.endTime.trim()) || "10:00"

      // 2. Encontrar ou criar o Bloco de Horário
      let timeBlock = await prisma.timeBlock.findFirst({
        where: {
          scheduleDayId: scheduleDay.id,
          startTime: startTime,
          endTime: endTime
        }
      })

      if (!timeBlock) {
        timeBlock = await prisma.timeBlock.create({
          data: {
            scheduleDayId: scheduleDay.id,
            startTime: startTime,
            endTime: endTime
          }
        })
      }

      // 3. Encontrar ou criar a Sala (TaxonomyValue)
      let roomValueId: string | null = null
      if (row.room && row.room.trim()) {
        const cleanRoom = row.room.trim()
        let roomValue = await prisma.taxonomyValue.findFirst({
          where: {
            taxonomyId: roomTaxonomy.id,
            label: cleanRoom
          }
        })

        if (!roomValue) {
          roomValue = await prisma.taxonomyValue.create({
            data: {
              taxonomyId: roomTaxonomy.id,
              label: cleanRoom
            }
          })
        }
        roomValueId = roomValue.id
      }

      // 4. Encontrar ou criar o Palestrante
      let speakerId: string | null = null
      if (row.speakerName && row.speakerName.trim()) {
        const cleanSpeaker = row.speakerName.trim()
        let speaker = await prisma.speaker.findFirst({
          where: {
            tenantId,
            name: cleanSpeaker
          }
        })

        if (!speaker) {
          speaker = await prisma.speaker.create({
            data: {
              tenantId,
              name: cleanSpeaker
            }
          })
        }
        speakerId = speaker.id
      }

      // 5. Criar a Atividade / Palestra
      const activity = await prisma.activity.create({
        data: {
          timeBlockId: timeBlock.id,
          title: row.title.trim(),
          description: row.description?.trim() || null,
          startTime: startTime,
          endTime: endTime,
          status: "PUBLISHED"
        }
      })

      // Vincular Sala
      if (roomValueId) {
        await prisma.activityTaxonomy.create({
          data: {
            activityId: activity.id,
            taxonomyValueId: roomValueId
          }
        })
      }

      // Vincular Palestrante
      if (speakerId) {
        await prisma.activitySpeaker.create({
          data: {
            activityId: activity.id,
            speakerId
          }
        })
      }

      count++
    }

    revalidatePath("/admin/programacao")
    revalidatePath("/admin/palestrantes")
    revalidatePath("/admin/salas")
    revalidatePath("/admin/painel")
    return { success: true, count, message: `${count} sessões criadas automaticamente na programação!` }
  } catch (error: any) {
    console.error("Erro ao importar agenda via CSV:", error)
    return { success: false, error: error.message || "Erro ao importar programação." }
  }
}
