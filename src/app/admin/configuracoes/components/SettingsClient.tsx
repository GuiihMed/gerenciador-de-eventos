"use client"

import { useState } from "react"
import { Building2, Image as ImageIcon, Save, Palette, Globe, MessageSquare, Check, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateTenantSettings, TenantThemeConfig } from "@/server/actions/tenant"

interface SettingsClientProps {
  initialTenant: {
    id: string
    name: string
    domain: string
    themeConfig: TenantThemeConfig
  }
}

export function SettingsClient({ initialTenant }: SettingsClientProps) {
  const [tenant, setTenant] = useState(initialTenant)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Dynamic preview states
  const [name, setName] = useState(tenant.name)
  const [domain, setDomain] = useState(tenant.domain)
  const [logoUrl, setLogoUrl] = useState(tenant.themeConfig?.logoUrl || "")
  const [primaryColor, setPrimaryColor] = useState(tenant.themeConfig?.primaryColor || "#3b82f6")
  const [welcomeMessage, setWelcomeMessage] = useState(tenant.themeConfig?.welcomeMessage || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg("")
    setErrorMsg("")

    const res = await updateTenantSettings({
      name,
      domain,
      logoUrl,
      primaryColor,
      welcomeMessage
    })

    if (res.success && res.tenant) {
      setTenant(res.tenant)
      setSuccessMsg("Configurações e identidade visual salvas com sucesso!")
      setTimeout(() => setSuccessMsg(""), 3000)
    } else {
      setErrorMsg(res.error || "Erro ao salvar configurações.")
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 text-sm font-semibold flex items-center gap-2">
          <Check className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 text-sm font-semibold text-center">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Gerais da Empresa */}
          <Card className="bg-card border-border shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informações principais da sua organização registradas na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-semibold">Nome da Empresa / Evento *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Tech Conference Brasil"
                  className="bg-muted/30 focus:bg-background rounded-xl font-semibold text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain" className="text-foreground font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Domínio / Subdomínio Oficial
                </Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Ex: techconf.gerenciador.app"
                  className="bg-muted/30 focus:bg-background rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Este é o endereço único usado para gerar os links das páginas públicas.</p>
              </div>
            </CardContent>
          </Card>

          {/* Identidade Visual & Logo */}
          <Card className="bg-card border-border shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Palette className="h-5 w-5 text-primary" />
                Identidade Visual & Branding
              </CardTitle>
              <CardDescription>
                Personalize o logotipo e a paleta de cores para combinar com a sua marca.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-foreground font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" /> Logotipo Personalizado (URL)
                </Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://sua-empresa.com/logo.png"
                  className="bg-muted/30 focus:bg-background rounded-xl text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Substitui a marca padrão no menu lateral, no cabeçalho e nas telas dos participantes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-foreground font-semibold">Cor Primária da Marca</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-12 rounded-xl cursor-pointer bg-transparent border border-border p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-muted/30 focus:bg-background font-mono text-sm rounded-xl uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="welcomeMessage" className="text-foreground font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Mensagem de Boas-Vindas Personalizada
                </Label>
                <textarea
                  id="welcomeMessage"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Ex: Seja bem-vindo ao portal oficial da nossa empresa..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pré-Visualização da Marca (Live Preview) */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-sm rounded-2xl sticky top-24">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                Pré-Visualização ao Vivo
              </CardTitle>
              <CardDescription>
                Veja como sua marca ficará no topo da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Simulação de Header / Navbar */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Menu Lateral & Navbar</span>
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                    ) : (
                      <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                        <img src="/logo.png" alt="Default Logo" className="h-6 object-contain" />
                      </div>
                    )}
                  </div>
                  <div
                    className="h-7 px-3 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Ativo
                  </div>
                </div>
              </div>

              {/* Simulação de Card do Evento */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Subdomínio Ativo</p>
                  <p className="text-xs text-muted-foreground font-mono">{domain || "empresa.gerenciador.app"}</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Card de Evento / Botões</span>
                <h4 className="font-bold text-foreground text-base truncate">{name || "Nome da Empresa"}</h4>
                <p className="text-xs text-muted-foreground font-mono">{domain || "empresa.gerenciador.app"}</p>
                <button
                  type="button"
                  className="w-full py-2 rounded-xl text-white font-semibold text-xs shadow-md transition-all mt-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  Botão de Destaque
                </button>
              </div>

              {welcomeMessage && (
                <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs text-muted-foreground italic">
                  "{welcomeMessage}"
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading} className="rounded-xl font-bold min-w-44 shadow-lg shadow-primary/20">
          {loading ? "Salvando..." : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
