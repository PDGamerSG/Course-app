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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Role } from "@/types"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

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
    { href: "/student", label: "My Courses", icon: GraduationCap },
    { href: "/courses", label: "Browse Courses", icon: BookOpen },
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
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm">LearnHub</span>
            <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase">IIT Madras</span>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2.5">
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
          role === "ADMIN" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
          role === "TEACHER" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        )}>
          {role.toLowerCase()}
        </span>
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
      <div className="p-3 border-t border-border/50 space-y-1">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={userImage || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start gap-2"
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
