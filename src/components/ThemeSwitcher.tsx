"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="flex bg-muted/50 p-1 rounded-xl w-full justify-between items-center mt-4">
      <button
        onClick={() => setTheme("light")}
        title="Tema Claro"
        className={`flex-1 flex justify-center py-2 rounded-lg transition-colors ${theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("navy")}
        title="Tema Azul (Navy)"
        className={`flex-1 flex justify-center py-2 rounded-lg transition-colors ${theme === "navy" ? "bg-background shadow-sm text-blue-500" : "text-muted-foreground hover:text-blue-500"}`}
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        title="Tema Escuro"
        className={`flex-1 flex justify-center py-2 rounded-lg transition-colors ${theme === "dark" ? "bg-background shadow-sm text-white" : "text-muted-foreground hover:text-white"}`}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  )
}
