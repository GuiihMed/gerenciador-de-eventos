import { getTenantSettings } from "@/server/actions/tenant"
import { SettingsClient } from "./components/SettingsClient"
import { Settings, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Configurações da Empresa | Admin",
}

export default async function SettingsPage() {
  const result = await getTenantSettings()

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Configurações & Identidade Visual
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as informações da sua empresa, subdomínio e personalize o logotipo e cores da plataforma.
        </p>
      </div>

      {result.success && result.tenant ? (
        <SettingsClient initialTenant={result.tenant} />
      ) : (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Erro ao carregar configurações</h3>
          <p className="text-sm opacity-90 mt-1">{result.error}</p>
        </div>
      )}
    </div>
  )
}
