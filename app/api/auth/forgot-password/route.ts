import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { db } from "@/lib/db"
import { Resend } from "resend"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({ message: "If that email exists, a reset link has been sent." })
    }

    // Invalidate old tokens
    await db.passwordResetToken.deleteMany({ where: { email: user.email } })

    // Create new token (expires in 1 hour)
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await db.passwordResetToken.create({
      data: { email: user.email, token, expires },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: "LearnHub <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset your LearnHub password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1a1a1a; margin-bottom: 8px;">Reset your password</h2>
          <p style="color: #555; margin-bottom: 24px;">
            We received a request to reset the password for your LearnHub account.
            Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block; background:#6366f1; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600;">
            Reset Password
          </a>
          <p style="color:#999; font-size:12px; margin-top:32px;">
            If you didn't request this, you can safely ignore this email.<br/>
            This link will expire in 1 hour.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." })
  } catch (error) {
    console.error("[forgot-password]", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
