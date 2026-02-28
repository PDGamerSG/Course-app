import Script from "next/script"
import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      {/* Razorpay checkout SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </SessionProvider>
  )
}
