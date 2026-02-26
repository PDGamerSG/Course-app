import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyWebhookSignature } from "@/lib/razorpay"

// Disable body parsing so we can read the raw body for signature verification
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature") ?? ""

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
    }

    // Respond 200 immediately after signature check to acknowledge receipt
    const payload = JSON.parse(rawBody)
    const event = payload?.event

    if (event === "payment.captured") {
      const paymentEntity = payload?.payload?.payment?.entity
      const razorpayOrderId: string = paymentEntity?.order_id
      const razorpayPaymentId: string = paymentEntity?.id

      if (razorpayOrderId && razorpayPaymentId) {
        await db.$transaction(async (tx) => {
          // 1. Find the pending purchase by Razorpay order ID
          const purchase = await tx.purchase.findFirst({
            where: { razorpayOrderId },
          })

          if (!purchase) return

          // 2. Update purchase status to success
          await tx.purchase.update({
            where: { id: purchase.id },
            data: {
              status: "success",
              razorpayPaymentId,
            },
          })

          // 3. Create enrollment (upsert to avoid duplicates)
          await tx.enrollment.upsert({
            where: {
              userId_courseId: {
                userId: purchase.userId,
                courseId: purchase.courseId,
              },
            },
            update: {},
            create: {
              userId: purchase.userId,
              courseId: purchase.courseId,
            },
          })
        })
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("[POST /api/payment/webhook]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
