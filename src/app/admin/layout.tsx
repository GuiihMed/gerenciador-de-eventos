import { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <AdminSidebar />
      <div className="pl-20 md:pl-64 flex flex-col min-h-screen transition-all">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {children}
        </main>
      </div>
    </div>
  );
}
