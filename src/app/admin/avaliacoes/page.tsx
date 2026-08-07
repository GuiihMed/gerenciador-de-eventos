import { getFeedbackAnalytics } from "@/server/actions/feedback"
import { FeedbackClient } from "./components/FeedbackClient"
import { Star, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Avaliações & Feedbacks | Admin",
}

export default async function FeedbacksPage() {
  const result = await getFeedbackAnalytics()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
          Avaliações & Notas das Aulas
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe a satisfação dos alunos, notas médias de 1 a 5 estrelas e comentários em tempo real.
        </p>
      </div>

      {result.success ? (
        <FeedbackClient
          summary={result.summary}
          activities={result.activities || []}
          eventName={result.eventName}
        />
      ) : (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Erro ao carregar avaliações</h3>
          <p className="text-sm opacity-90 mt-1">{result.error}</p>
        </div>
      )}
    </div>
  )
}
