import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

// /dashboard → redirect to role-specific page
export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = session.user.role
  if (role === "TEACHER") redirect("/teacher")
  if (role === "ADMIN") redirect("/admin")
  redirect("/student")
}
