import { getEventAttendees } from "@/server/actions/registration"
import { AttendeesClient } from "./components/AttendeesClient"
import { UserCheck, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Participantes & Inscrições | Admin",
}

export default async function AttendeesPage() {
  const result = await getEventAttendees()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" />
          Participantes & Inscrições
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe todos os participantes inscritos no seu evento em tempo real e exporte relatórios.
        </p>
      </div>

      {result.success ? (
        <AttendeesClient initialAttendees={result.attendees || []} eventName={result.event?.name} />
      ) : (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Erro ao carregar inscrições</h3>
          <p className="text-sm opacity-90 mt-1">{result.error}</p>
        </div>
      )}
    </div>
  )
}
