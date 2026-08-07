"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Building2, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { signOut } from "next-auth/react"

const NAV_ITEMS = [
  { href: "/super-admin/painel", icon: LayoutDashboard, label: "Dashboard Geral" },
  { href: "/super-admin/clientes", icon: Building2, label: "Clientes (Tenants)" },
  { href: "/super-admin/usuarios", icon: Users, label: "Acessos & Logins" },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col min-h-screen">
      <div className="p-6 flex flex-col gap-1 border-b border-border">
        <span className="font-extrabold text-foreground tracking-tight text-base">Gerenciador de Eventos</span>
        <span className="text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
          Super Admin
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm font-semibold"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair da Conta</span>
        </button>
        <ThemeSwitcher />
      </div>
    </aside>
  )
}
