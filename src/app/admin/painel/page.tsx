import { getDashboardAnalytics } from "@/server/actions/analytics"
import { AnalyticsDashboardClient } from "./components/AnalyticsDashboardClient"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Dashboard Analytics | Admin",
}

export default async function AdminDashboardPage() {
  const result = await getDashboardAnalytics()

  if (!result.success) {
    return (
      <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
        <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
        <h3 className="font-semibold text-lg">Erro ao carregar métricas</h3>
        <p className="text-sm opacity-90 mt-1">{result.error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AnalyticsDashboardClient
        event={result.event}
        metrics={result.metrics}
        ticketBreakdown={result.ticketBreakdown}
        topSpeakers={result.topSpeakers}
        roomOccupancy={result.roomOccupancy}
      />
    </div>
  )
}
