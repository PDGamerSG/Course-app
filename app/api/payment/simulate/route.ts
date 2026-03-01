import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0]

const simulateSchema = z.object({
  courseId: z.string().min(1),
})

/**
 * Simulated payment endpoint — only works when Razorpay is NOT configured.
 * This lets you test the full purchase → enrollment flow without real payment keys.
 */
export async function POST(request: NextRequest) {
  // Block this endpoint if real Razorpay keys are present
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: "Simulation disabled in production mode" }, { status: 403 })
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = simulateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { courseId } = parsed.data
    const userId = session.user.id as string

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Idempotent: already enrolled
    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (existing) {
      return NextResponse.json({ success: true, courseId, alreadyEnrolled: true })
    }

    // Record simulated purchase + create enrollment
    await db.$transaction(async (tx: TxClient) => {
      await tx.purchase.create({
        data: {
          userId,
          courseId,
          razorpayOrderId: `sim_order_${Date.now()}`,
          razorpayPaymentId: `sim_pay_${Date.now()}`,
          status: "success",
        },
      })

      await tx.enrollment.create({
        data: { userId, courseId },
      })
    })

    return NextResponse.json({ success: true, courseId })
  } catch (error) {
    console.error("[POST /api/payment/simulate]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
