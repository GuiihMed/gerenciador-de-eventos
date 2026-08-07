import { ReactNode } from "react"
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar"
import { AdminHeader } from "@/components/layout/AdminHeader"

export const dynamic = "force-dynamic"

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  )
}
