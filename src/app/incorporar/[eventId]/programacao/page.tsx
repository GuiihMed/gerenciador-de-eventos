import { getPublicEvent } from "@/server/actions/public-event"
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard"
import { AlertCircle } from "lucide-react"

export default async function EmbedSchedulePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const res = await getPublicEvent(eventId)

  if (!res.success || !res.event) {
    return (
      <div className="p-8 text-center bg-background text-muted-foreground min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-destructive opacity-80" />
          <p className="font-semibold text-sm">Programação não encontrada.</p>
        </div>
      </div>
    )
  }

  const event = res.event

  // Formatar os dias para o ScheduleBoard
  const serializedDays = event.days.map((day: any) => ({
    id: day.id,
    date: day.date.toISOString(),
    label: day.label,
    blocks: day.blocks.map((b: any) => ({
      id: b.id,
      startTime: b.startTime,
      endTime: b.endTime,
      activities: b.activities.map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        startTime: a.startTime,
        endTime: a.endTime,
        capacity: a.capacity,
        speakers: a.speakers.map((s: any) => ({
          speaker: {
            id: s.speaker.id,
            name: s.speaker.name,
            role: s.speaker.role,
            avatarUrl: s.speaker.avatarUrl
          }
        })),
        taxonomies: a.taxonomies.map((t: any) => ({
          taxonomyValue: { label: t.taxonomyValue.label }
        }))
      }))
    }))
  }))

  return (
    <div className="bg-background min-h-screen text-foreground">
      <ScheduleBoard days={serializedDays} isEmbed={true} />
    </div>
  )
}
