"use client"

import { useState } from "react"
import { Loader2, Lock, CheckCircle2, X, ShieldCheck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  courseId: string
  courseName: string
  price: number
  userName?: string
  userEmail?: string
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  courseName,
  price,
  userName,
  userEmail,
}: PaymentModalProps) {
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handlePay = async () => {
    setError("")
    setPaying(true)
    try {
      // Step 1: Create order on backend
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order")

      // Step 2a: MOCK mode (no Razorpay keys) → simulate
      if (orderData.mock) {
        const simRes = await fetch("/api/payment/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        })
        const simData = await simRes.json()
        if (!simRes.ok) throw new Error(simData.error || "Payment failed")
        setSuccess(true)
        setTimeout(() => onSuccess(), 1800)
        return
      }

      // Step 2b: REAL Razorpay mode
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.")

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LearnHub",
        description: courseName,
        order_id: orderData.orderId,
        prefill: {
          name: userName || "",
          email: userEmail || "",
        },
        theme: { color: "#2563EB" },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          // Step 3: Verify payment
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyRes.ok) {
            setError(verifyData.error || "Payment verification failed")
            setPaying(false)
            return
          }
          setSuccess(true)
          setTimeout(() => onSuccess(), 1800)
        },
        modal: {
          ondismiss: () => {
            setPaying(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      // setPaying stays true until handler/dismiss fires

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.")
      setPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#2563EB] px-5 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-base">₹</span>
            </div>
            <div>
              <p className="text-white/70 text-xs">Paying to</p>
              <p className="text-white font-semibold text-sm leading-tight">LearnHub</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Amount</p>
            <p className="text-white font-bold text-lg">₹{price.toLocaleString("en-IN")}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-white/60 hover:text-white transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Course row */}
        <div className="px-5 py-2.5 border-b bg-blue-50 dark:bg-blue-950/30 text-sm text-blue-800 dark:text-blue-300">
          <span className="font-medium">{courseName}</span>
          <span className="text-blue-500 text-xs ml-2">· Lifetime Access</span>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">Payment Successful!</p>
            <p className="text-sm text-muted-foreground text-center">
              You are now enrolled in <strong>{courseName}</strong>. Redirecting…
            </p>
          </div>
        ) : (
          <div className="px-5 py-6 space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-center text-muted-foreground">
              Click below to open the secure Razorpay checkout — pay by card, UPI, netbanking or wallet.
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 border border-red-200">
                {error}
              </p>
            )}

            <Button
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl h-12 text-base"
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
              ) : (
                <><Lock className="mr-2 h-4 w-4" />Pay ₹{price.toLocaleString("en-IN")} with Razorpay</>
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span>Accepts UPI, Cards, Netbanking &amp; Wallets</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              <span>Secured by <strong>Razorpay</strong> · 256-bit SSL encryption</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

