"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Loader2, ShoppingCart, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

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
}

interface RazorpayInstance {
  open(): void
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
}

export default function CourseEnrollButton({
  courseId,
  price,
  isEnrolled,
  isOwner,
  firstLessonId,
  isLoggedIn,
}: Props) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  if (isEnrolled || isOwner) {
    return (
      <Button className="w-full" size="lg" asChild>
        <Link href={firstLessonId ? `/learn/${courseId}/${firstLessonId}` : `/learn/${courseId}`}>
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
      // Free course - direct enrollment
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

    // Paid course - Razorpay
    setLoading(true)
    try {
      const { data } = await axios.post("/api/payment/create-order", { courseId })
      
      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "LearnHub",
        description: "Course Purchase",
        order_id: data.orderId,
        handler: async () => {
          toast({ title: "Payment successful!", description: "You are now enrolled in this course." })
          router.refresh()
        },
        theme: { color: "#7c3aed" },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      toast({ title: "Error", description: "Failed to initiate payment. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" size="lg" onClick={handleEnroll} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      {price === 0 ? "Enroll for Free" : `Buy for ₹${price.toLocaleString("en-IN")}`}
    </Button>
  )
}
