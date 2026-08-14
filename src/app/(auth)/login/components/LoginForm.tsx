"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { performLoginAction } from "@/server/actions/auth"

export function LoginForm() {
  const [loading, setLoading] = useState(false)

  return (
    <form action={performLoginAction} onSubmit={() => setLoading(true)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">E-mail de Acesso</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          placeholder="guilherme33390@gmail.com" 
          defaultValue="guilherme33390@gmail.com"
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
      <Button type="submit" className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20" disabled={loading}>
        {loading ? "Entrando no Painel..." : "Entrar no Painel Super Admin"}
      </Button>
    </form>
  )
}
