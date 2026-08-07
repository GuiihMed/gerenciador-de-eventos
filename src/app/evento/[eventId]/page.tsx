import { getPublicEvent } from "@/server/actions/public-event"
import { ScheduleBoard } from "@/components/schedule/ScheduleBoard"
import { Calendar, MapPin, AlertCircle } from "lucide-react"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { PublicHeaderButton } from "./components/PublicHeaderButton"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ eventId: string }> }): Promise<Metadata> {
  const { eventId } = await params
  const res = await getPublicEvent(eventId)
  if (res.success && res.event) {
    return {
      title: `${res.event.name} | Programação Oficial`,
      description: `Confira a programação completa e inscreva-se no evento ${res.event.name}.`,
    }
  }
  return { title: `Evento | Gerenciador de Eventos` }
}

export default async function PublicEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const res = await getPublicEvent(eventId)

  if (!res.success || !res.event) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 bg-card border border-border rounded-2xl text-center shadow-xl space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto opacity-80" />
          <h2 className="text-xl font-bold text-foreground">Evento não encontrado</h2>
          <p className="text-sm text-muted-foreground">O evento que você está procurando não existe ou não está mais disponível.</p>
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-foreground tracking-tight text-lg">Gerenciador de Eventos</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Programação Oficial
            </span>
          </div>

          <div className="flex items-center gap-3">
            <PublicHeaderButton eventId={event.id} eventName={event.name} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Banner do Evento */}
      <div className="relative bg-muted/30 border-b border-border py-12 px-4 sm:px-8 overflow-hidden">
        {event.visualIdentity && (
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <img src={event.visualIdentity} alt="Background" className="w-full h-full object-cover blur-xl" />
          </div>
        )}

        <div className="max-w-5xl mx-auto relative z-10 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {event.visualIdentity && (
              <img
                src={event.visualIdentity}
                alt={event.name}
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl object-cover border-2 border-border shadow-xl shrink-0"
              />
            )}

            <div className="space-y-2 flex-1">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {event.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    {" — "}
                    {new Date(event.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de Programação Pública */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        <ScheduleBoard days={serializedDays} isEmbed={false} />
      </main>

      {/* Footer com Marca Registrada */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {event.name}. Plataforma fornecida por <strong className="text-foreground">Gerenciador de Eventos</strong>.</p>
      </footer>
    </div>
  )
}
