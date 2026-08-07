import { Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export async function AdminHeader() {
  const session = await auth();
  const userName = session?.user?.name || "Administrador";
  const userRole = session?.user?.email === "admin@gerenciador.app" ? "Super Admin" : "Organizador";

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end gap-x-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground transition-transform hover:scale-110">
          <Bell className="h-5 w-5" />
        </Button>
        
        {/* User Profile no Canto Superior Direito */}
        <div className="flex items-center gap-3 bg-muted/30 rounded-full py-1.5 pl-4 pr-1.5 border border-border shadow-sm">
          <div className="hidden sm:flex flex-col text-sm leading-tight text-right">
             <span className="font-bold text-foreground truncate max-w-[150px]">{userName}</span>
             <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">{userRole}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/30">
             <UserCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
      
    </header>
  );
}
