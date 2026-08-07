import { getSuperAdminMetrics } from "@/server/actions/super-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calendar, Users, ArrowUpRight, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Super Admin Dashboard | Gerenciador de Eventos",
}

export default async function SuperAdminDashboard() {
  const { metrics, recentTenants } = await getSuperAdminMetrics()

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Painel do Super Admin
        </h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema, empresas cadastradas e métricas globais.</p>
      </div>

      {/* Cards de Métricas Reais */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes (Tenants)</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {String(metrics.totalTenants).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Empresas ativas e inativas</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Eventos Criados</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {String(metrics.totalEvents).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Em todas as empresas</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuários (Organizadores)</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {String(metrics.totalUsers).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Contas registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Clientes Recentes */}
      <Card className="bg-card border-border shadow-sm rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Clientes Cadastrados Recentes</CardTitle>
          <Link href="/super-admin/clientes" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Ver Todos os Clientes <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-12 p-3 bg-muted/40 font-semibold text-xs text-muted-foreground border-b border-border">
              <span className="col-span-4">Empresa / Tenant</span>
              <span className="col-span-4">Domínio Oficial</span>
              <span className="col-span-2 text-center">Eventos / Usuários</span>
              <span className="col-span-2 text-right">Status</span>
            </div>

            {recentTenants.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Building2 className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Nenhum cliente cadastrado recentemente.</p>
              </div>
            ) : (
              recentTenants.map((tenant: any) => (
                <div key={tenant.id} className="grid grid-cols-12 p-4 items-center border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors text-sm">
                  <div className="col-span-4 font-semibold text-foreground truncate flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{tenant.name}</span>
                  </div>
                  <div className="col-span-4 text-muted-foreground font-mono text-xs truncate">
                    {tenant.domain}
                  </div>
                  <div className="col-span-2 text-center text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{tenant._count?.events || 0}</span> eventos / <span className="font-semibold text-foreground">{tenant._count?.users || 0}</span> u.
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      tenant.isActive
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {tenant.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
