"use client"

import { useState } from "react"
import { Building2, Search, Plus, Trash2, Globe, Calendar, Users, Power, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createTenant, toggleTenantStatus, deleteTenant } from "@/server/actions/super-admin"

interface TenantsClientProps {
  initialTenants: any[]
}

export function TenantsClient({ initialTenants }: TenantsClientProps) {
  const [tenants, setTenants] = useState(initialTenants)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleTenantStatus(id, !currentStatus)
    if (res.success && res.tenant) {
      setTenants(prev => prev.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t))
    } else {
      alert(res.error || "Erro ao alterar status da empresa")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover esta empresa? Todos os eventos e dados serão excluídos!")) {
      const res = await deleteTenant(id)
      if (res.success) {
        setTenants(prev => prev.filter(t => t.id !== id))
      } else {
        alert(res.error || "Erro ao deletar empresa")
      }
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const domain = formData.get("domain") as string

    if (!name) {
      setError("Nome da empresa é obrigatório")
      setLoading(false)
      return
    }

    const res = await createTenant({ name, domain })
    if (res.success && res.tenant) {
      setTenants([res.tenant, ...tenants])
      setIsOpen(false)
    } else {
      setError(res.error || "Erro ao criar empresa")
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtro e Adição */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da empresa ou domínio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-colors rounded-xl"
          />
        </div>

        <Button onClick={() => { setError(""); setIsOpen(true); }} className="w-full sm:w-auto font-semibold rounded-xl shadow-md shadow-primary/20">
          <Plus className="mr-2 h-5 w-5" /> Nova Empresa (Tenant)
        </Button>
      </div>

      {/* Modal de Criação */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] border-border bg-card shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              Cadastrar Nova Empresa / Tenant
            </DialogTitle>
            <DialogDescription>
              Crie uma empresa na plataforma. Ela terá um ambiente isolado com subdomínio próprio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Nome da Empresa / Cliente *</Label>
              <Input id="name" name="name" required placeholder="Ex: Eventos Brasil LTDA" className="bg-muted/30 focus:bg-background rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="text-foreground font-medium">Domínio / Subdomínio Oficial</Label>
              <Input id="domain" name="domain" placeholder="Ex: eventosbrasil.gerenciador.app" className="bg-muted/30 focus:bg-background rounded-xl font-mono text-sm" />
              <p className="text-xs text-muted-foreground">Se deixar em branco, o sistema gerará automaticamente com base no nome.</p>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl font-bold min-w-32 shadow-md shadow-primary/20">
                {loading ? "Cadastrando..." : "Cadastrar Empresa"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grid de Tenants */}
      {filteredTenants.length === 0 ? (
        <div className="py-20 text-center bg-card/40 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
          <Building2 className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Nenhuma empresa encontrada</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            {searchQuery ? "Tente buscar por outros termos." : "Clique no botão 'Nova Empresa' para cadastrar seu primeiro cliente na plataforma."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map(tenant => (
            <Card key={tenant.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl overflow-hidden flex flex-col">
              <CardContent className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground line-clamp-1" title={tenant.name}>
                          {tenant.name}
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                          <Globe className="h-3 w-3 text-primary/70 shrink-0" />
                          <span className="truncate">{tenant.domain}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl">
                    <div>
                      <span>Eventos:</span>{" "}
                      <strong className="text-foreground">{tenant._count?.events || 0}</strong>
                    </div>
                    <div>
                      <span>Usuários:</span>{" "}
                      <strong className="text-foreground">{tenant._count?.users || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      tenant.isActive
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    {tenant.isActive ? "Conta Ativa" : "Conta Suspensa"}
                  </button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tenant.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
