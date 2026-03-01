"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  BookOpen, Menu, X, GraduationCap, LayoutDashboard,
  LogOut, ChevronDown, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./ThemeToggle"

const NAV_LINKS = [
  { label: "Courses", href: "/courses" },
  { label: "Foundation", href: "/courses?level=FOUNDATION" },
  { label: "Diploma", href: "/courses?level=DIPLOMA" },
]

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const dashboardHref =
    session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER" ? "/admin" : "/student"

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 pb-1">
      <div className="max-w-7xl mx-auto flex h-[60px] items-center gap-5 px-5 lg:px-7 rounded-2xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-lg shadow-black/10 dark:shadow-black/40">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-base tracking-tight">LearnHub</span>
              <span className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase">IIT Madras</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-all duration-150 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
            <ThemeToggle />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted/60 transition-colors outline-none group">
                    <Avatar className="h-8 w-8 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                      <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start leading-none">
                      <span className="text-sm font-semibold truncate max-w-[100px]">{session.user?.name?.split(" ")[0]}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{session.user?.role?.toLowerCase()}</span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 p-1.5" align="end" sideOffset={8}>
                  <div className="px-3 py-2.5 mb-1">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                        <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide">
                          {session.user?.role?.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg my-0.5">
                    <Link href={dashboardHref} className="flex items-center gap-2.5 py-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {session?.user?.role === "STUDENT" && (
                    <DropdownMenuItem asChild className="rounded-lg my-0.5">
                      <Link href="/student" className="flex items-center gap-2.5 py-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium">My Courses</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10 my-0.5"
                  >
                    <LogOut className="mr-2.5 h-3.5 w-3.5" />
                    <span className="text-sm font-medium">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-0 px-4">
                  <Link href="/register">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Get started
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>


      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mt-1 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm py-2.5 px-3 rounded-xl hover:bg-muted font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <>
              <div className="border-t border-border pt-2 mt-1">
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-3 text-sm py-2.5 px-3 rounded-xl hover:bg-muted font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }}
                  className="flex items-center gap-3 text-sm py-2.5 px-3 text-destructive w-full text-left rounded-xl hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-border mt-1">
              <Button variant="outline" size="sm" asChild className="flex-1 rounded-xl">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
              </Button>
              <Button size="sm" asChild className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                <Link href="/register" onClick={() => setMobileOpen(false)}>Get started</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
