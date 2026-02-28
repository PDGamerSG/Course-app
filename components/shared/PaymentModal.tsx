"use client"

import { useState } from "react"
import { Loader2, Lock, CreditCard, Smartphone, Building2, ChevronRight, ShieldCheck, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  courseId: string
  courseName: string
  price: number
  userName?: string
}

type Tab = "card" | "upi" | "netbanking"

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
]

// Format card number with spaces every 4 digits
function formatCardNumber(val: string) {
  return val
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim()
}

// Format expiry as MM/YY
function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2)
  return digits
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  courseName,
  price,
  userName,
}: PaymentModalProps) {
  const [tab, setTab] = useState<Tab>("card")
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Card fields
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState(userName ?? "")

  // UPI
  const [upiId, setUpiId] = useState("")

  // Net Banking
  const [bank, setBank] = useState("")

  if (!isOpen) return null

  const handlePay = async () => {
    setError("")
    setPaying(true)
    try {
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1800)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.")
    } finally {
      setPaying(false)
    }
  }

  const canPay =
    tab === "card"
      ? cardNumber.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length >= 3 && cardName.length > 1
      : tab === "upi"
      ? upiId.includes("@")
      : bank !== ""

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-[#2563EB] px-5 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Razorpay-style logo mark */}
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
          <button
            onClick={onClose}
            className="ml-4 text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Course row ── */}
        <div className="px-5 py-2.5 border-b bg-blue-50 dark:bg-blue-950/30 text-sm text-blue-800 dark:text-blue-300">
          <span className="font-medium">{courseName}</span>
          <span className="text-blue-500 text-xs ml-2">· Lifetime Access</span>
        </div>

        {/* ── Success state ── */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">Payment Successful!</p>
            <p className="text-sm text-muted-foreground text-center">
              You are now enrolled in <strong>{courseName}</strong>. Redirecting…
            </p>
          </div>
        ) : (
          <>
            {/* ── Tabs ── */}
            <div className="flex border-b">
              {(["card", "upi", "netbanking"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors",
                    tab === t
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "card" && <span className="flex items-center justify-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />Card</span>}
                  {t === "upi" && <span className="flex items-center justify-center gap-1.5"><Smartphone className="h-3.5 w-3.5" />UPI</span>}
                  {t === "netbanking" && <span className="flex items-center justify-center gap-1.5"><Building2 className="h-3.5 w-3.5" />Net Banking</span>}
                </button>
              ))}
            </div>

            {/* ── Form body ── */}
            <div className="px-5 py-5 space-y-4">
              {/* CARD */}
              {tab === "card" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-number" className="text-xs">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      inputMode="numeric"
                      className="font-mono tracking-wider"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="expiry" className="text-xs">Expiry (MM/YY)</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cvv" className="text-xs">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-name" className="text-xs">Name on Card</Label>
                    <Input
                      id="card-name"
                      placeholder="As printed on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  {/* Test card hint */}
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                    <strong>Test mode:</strong> Use any 16-digit number, future expiry, any CVV
                  </div>
                </>
              )}

              {/* UPI */}
              {tab === "upi" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="upi" className="text-xs">UPI ID</Label>
                    <Input
                      id="upi"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                    <strong>Test mode:</strong> Enter any valid UPI format (e.g. test@upi)
                  </div>
                </div>
              )}

              {/* NET BANKING */}
              {tab === "netbanking" && (
                <div className="space-y-3">
                  <Label className="text-xs">Select your Bank</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {BANKS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBank(b)}
                        className={cn(
                          "text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors",
                          bank === b
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                            : "border-border hover:border-blue-400 hover:bg-muted/50"
                        )}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {bank && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                      <strong>Test mode:</strong> No real bank login required
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 border border-red-200">
                  {error}
                </p>
              )}

              {/* Pay button */}
              <Button
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl h-11"
                onClick={handlePay}
                disabled={!canPay || paying}
              >
                {paying ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" />Pay ₹{price.toLocaleString("en-IN")} Securely <ChevronRight className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              <span>Secured by <strong>Razorpay</strong> · 256-bit SSL encryption</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
