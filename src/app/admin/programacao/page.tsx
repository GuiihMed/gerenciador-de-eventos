import { getScheduleData } from "@/server/actions/schedule"
import { ScheduleManagerClient } from "./components/ScheduleManagerClient"
import { Layers, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Programação e Agenda | Admin",
}

export default async function AdminSchedulePage() {
  const result = await getScheduleData()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-8 w-8 text-primary" />
            Gerenciador da Programação
          </h1>
          <p className="text-muted-foreground mt-1">
            Monte os dias do evento, crie blocos de horários e distribua as palestras e sessões.
          </p>
        </div>
      </div>

      {result.success && result.event ? (
        <ScheduleManagerClient
          initialEvent={result.event}
          speakers={result.speakers || []}
          rooms={result.rooms || []}
        />
      ) : (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Erro ao carregar programação</h3>
          <p className="text-sm opacity-90 mt-1">{result.error}</p>
        </div>
      )}
    </div>
  )
}
