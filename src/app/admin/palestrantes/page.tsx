import { getSpeakers } from "@/server/actions/speaker"
import { SpeakersClient } from "./components/SpeakersClient"
import { Users, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Palestrantes | Admin",
}

export default async function PalestrantesPage() {
  const result = await getSpeakers()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Palestrantes
          </h1>
          <p className="text-muted-foreground mt-1">
            Cadastre, edite e gerencie o perfil de todos os palestrantes dos seus eventos.
          </p>
        </div>
      </div>

      {result.success && result.speakers ? (
        <SpeakersClient initialSpeakers={result.speakers} />
      ) : (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Erro ao carregar palestrantes</h3>
          <p className="text-sm opacity-90 mt-1">{result.error}</p>
        </div>
      )}
    </div>
  )
}
