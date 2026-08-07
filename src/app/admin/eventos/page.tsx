import { getEvents } from "@/server/actions/event"
import { EventClient } from "./components/EventClient"
import { Calendar } from "lucide-react"

export const metadata = {
  title: "Informações Básicas do Evento | Admin",
}

export default async function EventsPage() {
  const result = await getEvents()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          Informações Básicas do Evento
        </h1>
        <p className="text-muted-foreground mt-1">
          Cadastre e edite as informações principais dos seus eventos (nome, datas, local e identidade visual).
        </p>
      </div>

      <EventClient initialEvents={result.events || []} />
    </div>
  )
}
