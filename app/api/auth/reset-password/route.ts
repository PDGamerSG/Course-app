import { NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const resetToken = await db.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 })
    }
    if (resetToken.used) {
      return NextResponse.json({ error: "This reset link has already been used." }, { status: 400 })
    }
    if (new Date() > resetToken.expires) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 })
    }

    const hashed = await bcryptjs.hash(password, 12)

    await db.$transaction([
      db.user.update({
        where: { email: resetToken.email },
        data: { password: hashed },
      }),
      db.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ message: "Password reset successfully." })
  } catch (error) {
    console.error("[reset-password]", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
