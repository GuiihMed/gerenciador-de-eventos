"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { registerUser } from "@/server/actions/auth"
import { signIn } from "next-auth/react"

export function CadastroForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await registerUser(formData)

      if (res?.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      // Se sucesso, faz login automatico
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (loginRes?.error) {
        setError("Conta criada, mas ocorreu um erro no login automático.")
      } else {
        router.push("/admin/painel")
        router.refresh()
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20 text-center">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">Seu Nome</Label>
        <Input 
          id="name" 
          name="name" 
          type="text" 
          placeholder="Ex: João Silva" 
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
