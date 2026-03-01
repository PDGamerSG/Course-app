import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Protect dashboard + learn routes
  const isProtected =
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/learn")

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Role-based: protect teacher routes
  if (pathname.startsWith("/teacher")) {
    const role = req.auth?.user?.role
    if (role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student", req.url))
    }
  }

  // Role-based: protect admin routes
  if (pathname.startsWith("/admin")) {
    const role = req.auth?.user?.role
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/learn/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
}
