"use client"

import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { CadastroForm } from "./CadastroForm"

export function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex bg-muted/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("login")}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${activeTab === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Fazer Login
        </button>
        <button
          onClick={() => setActiveTab("register")}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${activeTab === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Criar Conta
        </button>
      </div>

      {/* Form */}
      <div>
        {activeTab === "login" ? <LoginForm /> : <CadastroForm />}
      </div>
    </div>
  )
}
