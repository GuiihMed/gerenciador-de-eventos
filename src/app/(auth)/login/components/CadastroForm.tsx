"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { performRegisterAction } from "@/server/actions/auth"

export function CadastroForm() {
  const [loading, setLoading] = useState(false)

  return (
    <form action={performRegisterAction} onSubmit={() => setLoading(true)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Seu Nome</Label>
        <Input 
          id="name" 
          name="name" 
          type="text" 
          placeholder="Ex: Guilherme Medeiros" 
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
          defaultValue="guilherme33390@gmail.com"
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
          placeholder="Ex: MedAcademy Eventos" 
          defaultValue="MedAcademy Eventos"
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
      <Button type="submit" className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-2" disabled={loading}>
        {loading ? "Criando Conta..." : "Criar Conta Grátis"}
      </Button>
    </form>
  )
}
