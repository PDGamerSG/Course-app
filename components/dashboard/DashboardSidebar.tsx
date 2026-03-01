"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  BookOpen, Plus, LayoutDashboard, GraduationCap, Shield, Menu, X, LogOut
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Role } from "@/types"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

function getNavItems(role: Role): NavItem[] {
  if (role === "ADMIN") {
    return [
      { href: "/admin", label: "Admin Dashboard", icon: Shield },
      { href: "/student", label: "My Courses", icon: GraduationCap },
    ]
  }
  if (role === "TEACHER") {
    return [
      { href: "/teacher", label: "My Courses", icon: BookOpen },
      { href: "/teacher/courses/new", label: "Create Course", icon: Plus },
    ]
  }
  return [
    { href: "/student", label: "My Learning", icon: GraduationCap },
  ]
}

interface Props {
  role: Role
  userName: string
  userEmail: string
  userImage: string | null
}

export default function DashboardSidebar({ role, userName, userEmail, userImage }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = getNavItems(role)
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-primary text-lg">LearnHub</span>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2">
        <Badge variant="secondary" className="text-xs capitalize">
          {role.toLowerCase()}
        </Badge>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          // Active if exact match, OR path starts with href BUT no other nav item is a more specific match
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + "/") &&
              !navItems.some(
                (other) =>
                  other.href !== item.href &&
                  (pathname === other.href || pathname.startsWith(other.href + "/"))
              ))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <Separator className="my-2" />

        <Link
          href="/courses"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          Browse Courses
        </Link>
      </nav>

      {/* User info at bottom */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={userImage || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 text-muted-foreground hover:text-destructive justify-start gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-card flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setMobileOpen(!mobileOpen)} className="h-9 w-9 p-0">
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-card border-r border-border/50 flex flex-col shadow-xl">
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  )
}
