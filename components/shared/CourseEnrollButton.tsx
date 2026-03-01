"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Loader2, ShoppingCart, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import PaymentModal from "@/components/shared/PaymentModal"

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: { name?: string; email?: string }
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface Props {
  courseId: string
  price: number
  isEnrolled: boolean
  isOwner: boolean
  firstLessonId?: string
  isLoggedIn: boolean
  courseName?: string
  userName?: string
  userEmail?: string
}

export default function CourseEnrollButton({
  courseId,
  price,
  isEnrolled,
  isOwner,
  firstLessonId,
  isLoggedIn,
  courseName,
  userName,
  userEmail,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const learnUrl = firstLessonId
    ? `/learn/${courseId}/${firstLessonId}`
    : `/learn/${courseId}`

  if (isEnrolled || isOwner) {
    return (
      <Button className="w-full" size="lg" asChild>
        <Link href={learnUrl}>
          <PlayCircle className="mr-2 h-4 w-4" />
          {isEnrolled ? "Continue Learning" : "View Course"}
        </Link>
      </Button>
    )
  }

  if (!isLoggedIn) {
    return (
      <Button className="w-full" size="lg" asChild>
        <Link href="/login">Sign in to Enroll</Link>
      </Button>
    )
  }

  const handleEnroll = async () => {
    if (price === 0) {
      setLoading(true)
      try {
        await axios.post(`/api/courses/${courseId}/enroll`)
        toast({ title: "Enrolled!", description: "You can now access this course." })
        router.refresh()
      } catch {
        toast({ title: "Error", description: "Failed to enroll. Please try again.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post("/api/payment/create-order", { courseId })

      // ── MOCK / TEST MODE (no Razorpay keys) ──
      if (data.mock) {
        setLoading(false)
        setPaymentModal(true)
        return
      }

      // ── REAL RAZORPAY — load script first ──
      await new Promise<void>((resolve, reject) => {
        if (window.Razorpay) { resolve(); return }
        const s = document.createElement("script")
        s.src = "https://checkout.razorpay.com/v1/checkout.js"
        s.onload = () => resolve()
        s.onerror = () => reject(new Error("Failed to load Razorpay script"))
        document.body.appendChild(s)
      })

      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "LearnHub",
        description: "Course Purchase",
        order_id: data.orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#2563EB" },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: RazorpayResponse) => {
          setVerifying(true)
          try {
            await axios.post("/api/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast({ title: "Payment successful! 🎉", description: "Redirecting to your course..." })
            router.push(learnUrl)
            router.refresh()
          } catch {
            toast({ title: "Payment recorded", description: "If access isn't granted, contact support." })
            router.refresh()
          } finally {
            setVerifying(false)
            setLoading(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      toast({ title: "Error", description: "Failed to initiate payment. Please try again.", variant: "destructive" })
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentModal(false)
    toast({ title: "Payment successful! 🎉", description: "You are now enrolled. Redirecting..." })
    router.push(learnUrl)
    router.refresh()
  }

  const isProcessing = loading || verifying

  return (
    <>
      <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {verifying ? "Confirming enrollment..." : "Processing..."}
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {price === 0 ? "Enroll for Free" : `Buy for ₹${price.toLocaleString("en-IN")}`}
          </>
        )}
      </Button>

      <PaymentModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        courseId={courseId}
        courseName={courseName ?? "Course"}
        price={price}
        userName={userName}
      />
    </>
  )
}

