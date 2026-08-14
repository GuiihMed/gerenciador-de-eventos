"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
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
        <Label htmlFor="email" className="text-foreground">E-mail</Label>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-foreground">Senha</Label>
          <a href="#" className="text-xs text-primary hover:underline">Esqueci a senha</a>
        </div>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          defaultValue="123456"
          required 
          className="bg-muted/30 focus:bg-background transition-colors"
        />
      </div>
      <Button type="submit" className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
        {loading ? "Entrando no Painel..." : "Entrar no Painel"}
      </Button>
    </form>
  )
}
