import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 w-48">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Gerenciador de Eventos</h1>
          <p className="text-sm text-muted-foreground mt-1">Plataforma Enterprise de Gestão de Eventos</p>
        </div>
        {children}
      </div>
    </div>
  )
}
