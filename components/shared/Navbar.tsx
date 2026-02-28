"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { BookOpen, Menu, X, GraduationCap, LayoutDashboard, LogOut, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./ThemeToggle"

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const dashboardHref =
    session?.user?.role === "ADMIN"
      ? "/admin"
      : session?.user?.role === "TEACHER"
      ? "/teacher"
      : "/student"

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>LearnHub</span>
        </Link>

        {/* Desktop Nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          <Link
            href="/courses"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            Courses
          </Link>
          {session?.user?.role === "TEACHER" && (
            <Link
              href="/teacher"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Teaching
            </Link>
          )}
        </nav>

        {/* Search — grows to fill space */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses…"
            className="w-full h-9 pl-9 pr-4 text-sm rounded-lg border border-border bg-muted/40 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </form>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/student">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    My Courses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile: right side */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses…"
              className="w-full h-10 pl-9 pr-4 text-sm rounded-lg border border-border bg-muted/40 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </form>
          <Link
            href="/courses"
            className="block text-sm py-2 px-3 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Browse Courses
          </Link>
          {session ? (
            <>
              <Link
                href={dashboardHref}
                className="block text-sm py-2 px-3 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }}
                className="block text-sm py-2 px-3 text-destructive w-full text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/register" onClick={() => setMobileOpen(false)}>Get started</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
