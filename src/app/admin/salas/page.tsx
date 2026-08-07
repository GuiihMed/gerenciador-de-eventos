import { getTaxonomies } from "@/server/actions/taxonomy"
import { RoomsClient } from "./components/RoomsClient"
import { DoorOpen, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Salas & Trilhas | Admin",
}

export default async function RoomsPage() {
  const result = await getTaxonomies()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <DoorOpen className="h-8 w-8 text-primary" />
          Salas, Palcos & Trilhas Temáticas
        </h1>
        <p className="text-muted-foreground mt-1">
          Cadastre os auditórios, palcos físicos, temas e formatos de atividades do seu evento.
        </p>
      </div>

      {result.success ? (
        <RoomsClient initialTaxonomies={result.taxonomies} />
      ) : (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Erro ao carregar salas e trilhas</h3>
          <p className="text-sm opacity-90 mt-1">{result.error}</p>
        </div>
      )}
    </div>
  )
}
