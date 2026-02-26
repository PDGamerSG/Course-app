import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <SessionProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <DashboardSidebar
          role={session.user.role}
          userName={session.user.name || "User"}
          userEmail={session.user.email || ""}
          userImage={session.user.image || null}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
