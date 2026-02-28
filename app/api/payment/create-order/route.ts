import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const createOrderSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
})

const isRazorpayConfigured = () =>
  !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { courseId } = parsed.data
    const userId = session.user.id as string

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if user is already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (existingEnrollment) {
      return NextResponse.json({ error: "You are already enrolled in this course" }, { status: 400 })
    }

    // ── TEST / MOCK MODE (Razorpay keys not configured) ──
    if (!isRazorpayConfigured()) {
      return NextResponse.json({
        mock: true,
        courseId,
        amount: course.price,
        courseName: course.title,
      })
    }

    // ── REAL RAZORPAY MODE ──
    const { getRazorpay } = await import("@/lib/razorpay")
    const amountInPaise = Math.round(course.price * 100)

    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${courseId}_${userId}_${Date.now()}`,
    })

    await db.purchase.create({
      data: {
        userId,
        courseId,
        razorpayOrderId: razorpayOrder.id,
        status: "pending",
      },
    })

    return NextResponse.json({
      mock: false,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("[POST /api/payment/create-order]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
