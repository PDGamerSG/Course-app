import Link from "next/link"
import { ArrowRight, BookOpen, Users, Star, Zap, Shield, Globe, TrendingUp, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CourseCard from "@/components/shared/CourseCard"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

async function getFeaturedCourses() {
  try {
    return await db.course.findMany({
      where: { isPublished: true },
      include: {
        teacher: { select: { id: true, name: true, image: true } },
        modules: { include: { lessons: { select: { id: true } } } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses()

  const stats = [
    { label: "Active Students", value: "10,000+", icon: Users },
    { label: "Expert Courses", value: "500+", icon: BookOpen },
    { label: "Avg. Rating", value: "4.8★", icon: Star },
    { label: "Completion Rate", value: "94%", icon: Zap },
  ]

  const features = [
    {
      icon: Shield,
      title: "Learn at Your Pace",
      desc: "Lifetime access to all purchased courses. Revisit lessons anytime on any device.",
    },
    {
      icon: TrendingUp,
      title: "Expert Teachers",
      desc: "Courses built by industry professionals with real-world experience and proven results.",
    },
    {
      icon: Globe,
      title: "Watch Anywhere",
      desc: "High-quality video lessons accessible on desktop, tablet, or mobile — anytime.",
    },
  ]

  const whyUs = [
    "Structured, project-based curriculum",
    "Certificate on completion",
    "Doubt-solving community support",
    "Lifetime access — learn at your pace",
    "Taught by working professionals",
    "Regular content updates",
  ]

  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0A0F2C] text-white">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "50px 50px" }}
        />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-36 text-center">
          <Badge className="mb-6 bg-white/10 text-white border border-white/20 hover:bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            🚀 Join 10,000+ developers already learning
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1]">
            Master skills from{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              world-class teachers
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse expert-led courses in development, design, and more. Learn at your own pace with
            lifetime access and community support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/40">
              <Link href="/courses">
                Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base px-8 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white"
            >
              <Link href="/register">Start Teaching</Link>
            </Button>
          </div>

          {/* Floating trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-white/50">
            {["No experience needed", "Cancel anytime", "Certificate included", "24/7 support"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ── */}
      {courses.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Hand-picked</p>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Courses</h2>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/courses">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
              return (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnail={course.thumbnail}
                  price={course.price}
                  teacher={course.teacher}
                  lessonCount={lessonCount}
                  enrollmentCount={course._count.enrollments}
                />
              )
            })}
          </div>
          <div className="text-center mt-10 sm:hidden">
            <Button asChild variant="outline">
              <Link href="/courses">View all courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      )}

      {/* ── WHY US ── */}
      <section className="bg-muted/30 border-y border-border/40 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Why LearnHub?</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to level up</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We&apos;ve designed a learning experience that keeps you engaged, on-track, and
                building real-world projects from day one.
              </p>
              <ul className="space-y-3">
                {whyUs.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-4 p-5 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-[#0A0F2C] text-white py-24">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "50px 50px" }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-white/10 text-white border border-white/20 hover:bg-white/10 px-4 py-1.5">
            🎓 Limited spots available
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Ready to start learning?</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto text-lg">
            Join thousands of students already transforming their careers on LearnHub.
          </p>
          <Button size="lg" asChild className="text-base px-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/40">
            <Link href="/register">
              Get started for free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
