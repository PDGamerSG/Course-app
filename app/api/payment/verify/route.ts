import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { verifyRazorpaySignature } from "@/lib/razorpay"

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0]

const verifySchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = parsed.data

    // Verify HMAC signature
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Find the pending purchase for this order
    const purchase = await db.purchase.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
    })

    if (!purchase) {
      return NextResponse.json({ error: "Purchase record not found" }, { status: 404 })
    }

    // Make sure this purchase belongs to the current user
    if (purchase.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Already processed (idempotent)
    if (purchase.status === "success") {
      return NextResponse.json({ success: true, courseId: purchase.courseId })
    }

    // Update purchase + create enrollment in a transaction
    await db.$transaction(async (tx: TxClient) => {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: "success", razorpayPaymentId: razorpay_payment_id },
      })

      await tx.enrollment.upsert({
        where: { userId_courseId: { userId: purchase.userId, courseId: purchase.courseId } },
        update: {},
        create: { userId: purchase.userId, courseId: purchase.courseId },
      })
    })

    return NextResponse.json({ success: true, courseId: purchase.courseId })
  } catch (error) {
    console.error("[POST /api/payment/verify]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
