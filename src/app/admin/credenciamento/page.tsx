import { getCheckInData } from "@/server/actions/checkin"
import { CheckInClient } from "./components/CheckInClient"
import { QrCode, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Credenciamento & Check-in | Admin",
}

export default async function CheckInPage() {
  const result = await getCheckInData()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <QrCode className="h-8 w-8 text-primary" />
          Portaria & Credenciamento de Participantes
        </h1>
        <p className="text-muted-foreground mt-1">
          Valide a entrada dos inscritos bipando o QR Code ou realizando a confirmação de presença manual.
        </p>
      </div>

      {result.success ? (
        <CheckInClient
          initialAttendees={result.attendees || []}
          initialStats={result.stats}
          eventName={result.event?.name}
        />
      ) : (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Erro ao carregar credenciamento</h3>
          <p className="text-sm opacity-90 mt-1">{result.error}</p>
        </div>
      )}
    </div>
  )
}
