import { getTenants } from "@/server/actions/super-admin"
import { TenantsClient } from "./components/TenantsClient"
import { Building2, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Gestão de Clientes (Tenants) | Super Admin",
}

export default async function SuperAdminClientesPage() {
  const result = await getTenants()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          Gestão de Empresas & Clientes (Tenants)
        </h1>
        <p className="text-muted-foreground mt-1">
          Cadastre novas empresas, gerencie acessos, domínios e controle o status das contas da plataforma.
        </p>
      </div>

      {result.success ? (
        <TenantsClient initialTenants={result.tenants || []} />
      ) : (
        <div className="p-8 text-center bg-destructive/10 border border-destructive/20 rounded-2xl flex flex-col items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="font-semibold text-lg">Erro ao carregar lista de empresas</h3>
          <p className="text-sm opacity-90 mt-1">{result.error}</p>
        </div>
      )}
    </div>
  )
}
