import { Bell, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-session";
import { performLogoutAction } from "@/server/actions/auth";

export async function AdminHeader() {
  const session = await getAuthSession();
  const userName = session?.name || "Guilherme Medeiros";
  const userEmail = session?.email || "guilherme33390@gmail.com";
  const userRole = session?.role || "Super Admin";

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end gap-x-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground transition-transform hover:scale-110">
          <Bell className="h-5 w-5" />
        </Button>
        
        {/* User Profile no Canto Superior Direito */}
        <div className="flex items-center gap-3 bg-muted/30 rounded-full py-1.5 pl-4 pr-1.5 border border-border shadow-sm">
          <div className="hidden sm:flex flex-col text-sm leading-tight text-right">
             <span className="font-bold text-foreground truncate max-w-[170px]">{userName}</span>
             <span className="text-muted-foreground text-[10px] truncate max-w-[170px]">{userEmail}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-sm">
             GM
          </div>
        </div>

        {/* Botão Sair (Logout) */}
        <form action={performLogoutAction}>
          <Button variant="outline" size="sm" type="submit" className="rounded-full font-semibold border-destructive/30 text-destructive hover:bg-destructive/10 text-xs">
            <LogOut className="h-4 w-4 mr-1.5" /> Sair
          </Button>
        </form>
      </div>
      
    </header>
  );
}
