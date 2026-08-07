"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, LayoutDashboard, Settings, Layers, Menu, DoorOpen, LogOut, UserCheck, QrCode, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { signOut } from "next-auth/react";

const NAV_GROUPS = [
  {
    title: "Visão Geral",
    items: [
      { href: "/admin/painel", icon: LayoutDashboard, label: "Dashboard Analytics" },
      { href: "/admin/eventos", icon: Calendar, label: "Informações Básicas" },
    ]
  },
  {
    title: "Agenda & Conteúdo",
    items: [
      { href: "/admin/programacao", icon: Layers, label: "Programação (Sessões)" },
      { href: "/admin/palestrantes", icon: Users, label: "Palestrantes" },
      { href: "/admin/salas", icon: DoorOpen, label: "Salas & Trilhas" },
    ]
  },
  {
    title: "Participantes & Portaria",
    items: [
      { href: "/admin/inscricoes", icon: UserCheck, label: "Inscrições & Inscritos" },
      { href: "/admin/credenciamento", icon: QrCode, label: "Portaria & Credenciamento" },
      { href: "/admin/avaliacoes", icon: Star, label: "Avaliações & Notas" },
    ]
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/configuracoes", icon: Settings, label: "Personalização & Marca" },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-20 flex-col border-r border-border/80 bg-card/95 backdrop-blur-md md:w-64 transition-all duration-300">
      {/* Top Header Logo */}
      <div className="flex h-20 shrink-0 items-center justify-center border-b border-border/60 px-4">
        <Link href="/admin/painel" className="flex items-center gap-2">
          <span className="font-extrabold text-foreground tracking-tight text-sm md:text-base text-center">Gerenciador de Eventos</span>
        </Link>
        <Menu className="md:hidden h-6 w-6 text-foreground absolute right-4 cursor-pointer" />
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="text-[10px] font-extrabold text-muted-foreground/70 uppercase tracking-widest px-3 hidden md:block">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="hidden md:block truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border/80 p-3 space-y-3 bg-muted/20">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-xs font-semibold"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Sair do Painel</span>
        </button>
        <ThemeSwitcher />
      </div>
    </aside>
  );
}
