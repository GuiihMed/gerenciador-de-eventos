"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function CadastroForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // Redireciona diretamente para o painel administrativo
    window.location.href = "/admin/painel"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Seu Nome</Label>
        <Input 
          id="name" 
          name="name" 
          type="text" 
          placeholder="Ex: João Silva" 
          defaultValue="Guilherme Medeiros"
          required 
          className="bg-muted/30 focus:bg-background transition-colors"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">E-mail Corporativo</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="seu@email.com" 
          defaultValue="atendimento@wdcom.com.br"
          required 
          className="bg-muted/30 focus:bg-background transition-colors"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tenantName" className="text-foreground">Nome da sua Plataforma / Evento</Label>
        <Input 
          id="tenantName" 
          name="tenantName" 
          type="text" 
          placeholder="Ex: Minha Agência" 
          defaultValue="WDCOM Eventos"
          required 
          className="bg-muted/30 focus:bg-background transition-colors"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Senha de Acesso</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          defaultValue="123456"
          required 
          className="bg-muted/30 focus:bg-background transition-colors"
        />
      </div>
      <Button type="submit" className="w-full font-bold mt-2" disabled={loading}>
        {loading ? "Criando Conta..." : "Criar Conta Grátis"}
      </Button>
    </form>
  )
}
