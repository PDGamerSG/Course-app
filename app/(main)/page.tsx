import Link from "next/link"
import { ArrowRight, BookOpen, Users, Shield, TrendingUp, Globe, CheckCircle, GraduationCap, FlaskConical, LayoutDashboard, Sparkles, Award, Play, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CourseCard from "@/components/shared/CourseCard"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

async function getProgramData() {
  try {
    const courses = await db.course.findMany({
      where: { isPublished: true },
      include: {
        teacher: { select: { id: true, name: true, image: true } },
        modules: { include: { lessons: { select: { id: true } } } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return courses
  } catch {
    return []
  }
}

const FOUNDATION_SUBJECTS = [
  { name: "Mathematics I", code: "MA1001" },
  { name: "Mathematics II", code: "MA1002" },
  { name: "Statistics I", code: "ST1001" },
  { name: "Statistics II", code: "ST1002" },
  { name: "English I", code: "EN1001" },
  { name: "English II", code: "EN1002" },
  { name: "Computational Thinking", code: "CS1001" },
  { name: "Physics I", code: "PH1001" },
]

const DIPLOMA_SUBJECTS = [
  { name: "Programming in Python", code: "CS2001" },
  { name: "Data Structures & Algorithms", code: "CS2002" },
  { name: "Database Management", code: "CS2003" },
  { name: "Machine Learning Foundations", code: "CS3001" },
  { name: "Business Data Management", code: "MG3001" },
  { name: "Business Analytics", code: "MG3002" },
  { name: "Deep Learning", code: "CS3002" },
  { name: "MLOps", code: "CS3003" },
]

export default async function HomePage() {
  const [allCourses, session] = await Promise.all([getProgramData(), auth()])
  const foundationCourses = allCourses.filter((c) => c.level === "FOUNDATION").slice(0, 4)
  const diplomaCourses = allCourses.filter((c) => c.level === "DIPLOMA").slice(0, 4)

  const dashboardHref =
    session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER" ? "/admin" : "/student"

  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#060B1F] -mt-[76px] pt-[76px]">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize: "60px 60px" }}
        />
        {/* Gradient blobs */}
        <div className="absolute top-[-100px] left-[15%] w-[600px] h-[500px] bg-blue-700/25 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[10%] w-[500px] h-[400px] bg-indigo-700/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-violet-700/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-28 md:py-40 text-center">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/80 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Now covering IIT Madras BS Degree 2024 curriculum</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[80px] font-black tracking-tight mb-6 max-w-5xl mx-auto leading-[1.05] text-white">
            Crack your{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                IIT Madras
              </span>
            </span>
            {" "}Degree
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Foundation and Diploma courses aligned with the official IIT Madras BS Degree syllabus.
            Expert video lectures, notes, and doubt sessions — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Button size="lg" asChild className="h-12 px-8 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl shadow-blue-900/50 border-0 rounded-xl font-semibold">
              <Link href="/courses">
                <Play className="mr-2 h-4 w-4 fill-white" />
                Explore Programs
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base border-white/15 text-white bg-white/5 hover:bg-white/10 hover:text-white rounded-xl font-semibold">
              {session?.user ? (
                <Link href={dashboardHref}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/register">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Free Account
                </Link>
              )}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/40">
            {[
              { icon: CheckCircle, text: "Foundation Program" },
              { icon: CheckCircle, text: "Diploma Program" },
              { icon: CheckCircle, text: "Certificate included" },
              { icon: CheckCircle, text: "Live doubt sessions" },
            ].map((t) => (
              <span key={t.text} className="flex items-center gap-1.5">
                <t.icon className="h-3.5 w-3.5 text-emerald-400" />
                {t.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-y border-border/30 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "10,000+", label: "Active Students", icon: Users, color: "text-blue-500" },
              { value: "500+", label: "Expert Courses", icon: BookOpen, color: "text-indigo-500" },
              { value: "4.8★", label: "Avg. Rating", icon: Star, color: "text-amber-500" },
              { value: "94%", label: "Completion Rate", icon: Award, color: "text-emerald-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-background border border-border/50 flex items-center justify-center shrink-0 shadow-sm`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAM TRACKS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-widest border-primary/30 text-primary">
            Two Programs
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Choose Your Path</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Both programs follow the official IIT Madras BS Degree structure.
            Start with Foundation, then advance to Diploma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Foundation */}
          <div className="group rounded-2xl overflow-hidden border border-blue-200/50 dark:border-blue-900/30 bg-gradient-to-b from-blue-50/80 to-background dark:from-blue-950/20 dark:to-background hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-7 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-4" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Foundation Program</h3>
                    <p className="text-blue-100/80 text-xs font-medium">Semester 1–4 · Core Subjects</p>
                  </div>
                </div>
                <p className="text-blue-100/80 text-sm leading-relaxed">
                  Build a strong base in Mathematics, Statistics, English, and Computational Thinking — the official foundation of the IIT Madras BS Degree.
                </p>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Subjects Covered</h4>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {FOUNDATION_SUBJECTS.map((s) => (
                  <div key={s.code} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="font-medium text-[13px]">{s.name}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">
                <Link href="/courses?level=FOUNDATION">
                  View Foundation Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Diploma */}
          <div className="group rounded-2xl overflow-hidden border border-indigo-200/50 dark:border-indigo-900/30 bg-gradient-to-b from-indigo-50/80 to-background dark:from-indigo-950/20 dark:to-background hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-7 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-4" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Diploma Program</h3>
                    <p className="text-indigo-100/80 text-xs font-medium">Semester 5–8 · Specialization</p>
                  </div>
                </div>
                <p className="text-indigo-100/80 text-sm leading-relaxed">
                  Dive into Data Science, Machine Learning, and Business Analytics — advanced IIT Madras Diploma in Programming & Data Science topics.
                </p>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Subjects Covered</h4>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {DIPLOMA_SUBJECTS.map((s) => (
                  <div key={s.code} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="font-medium text-[13px]">{s.name}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold">
                <Link href="/courses?level=DIPLOMA">
                  View Diploma Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDATION COURSES ── */}
      {foundationCourses.length > 0 && (
        <section className="bg-muted/20 border-y border-border/30 py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Foundation</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Foundation Courses</h2>
                <p className="text-muted-foreground text-sm mt-1">Core subjects for Semester 1–4</p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex rounded-xl h-9 px-4 text-sm font-semibold">
                <Link href="/courses?level=FOUNDATION">
                  View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {foundationCourses.map((course) => {
                const lessonCount = course.modules.reduce((sum: number, m) => sum + m.lessons.length, 0)
                return (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    price={course.price}
                    teacher={course.teacher}
                    instructorName={course.instructorName}
                    lessonCount={lessonCount}
                    enrollmentCount={course._count.enrollments}
                    subject={course.subject ?? undefined}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── DIPLOMA COURSES ── */}
      {diplomaCourses.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Diploma</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Diploma Courses</h2>
                <p className="text-muted-foreground text-sm mt-1">Advanced specializations for Semester 5–8</p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex rounded-xl h-9 px-4 text-sm font-semibold">
                <Link href="/courses?level=DIPLOMA">
                  View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {diplomaCourses.map((course) => {
                const lessonCount = course.modules.reduce((sum: number, m) => sum + m.lessons.length, 0)
                return (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    price={course.price}
                    teacher={course.teacher}
                    instructorName={course.instructorName}
                    lessonCount={lessonCount}
                    enrollmentCount={course._count.enrollments}
                    subject={course.subject ?? undefined}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="border-y border-border/30 bg-muted/20 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-widest border-primary/30 text-primary">
              How it works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Start in 3 simple steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-10 left-[calc(16.5%+20px)] right-[calc(16.5%+20px)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {[
              { step: "01", icon: Users, title: "Create your account", desc: "Sign up free and browse all available programs." },
              { step: "02", icon: FlaskConical, title: "Enroll in a course", desc: "Pay once, get lifetime access to all lectures and notes." },
              { step: "03", icon: Award, title: "Earn your certificate", desc: "Complete the course and download your certificate." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg">
                    <s.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center shadow-md">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-bold text-base">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 px-3 py-1 text-xs font-semibold uppercase tracking-widest border-primary/30 text-primary">
                Why LearnHub?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight leading-tight">
                Everything you need to{" "}
                <span className="text-primary">crack the IITM degree</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We follow the exact IIT Madras BS Degree syllabus. Video lectures, notes, and practice
                problems aligned with the official course material.
              </p>
              <ul className="space-y-3.5">
                {[
                  "Follows IIT Madras BS Degree curriculum",
                  "Certificate on completion",
                  "Weekly live doubt-clearing sessions",
                  "Lifetime access — learn at your pace",
                  "Taught by IIT Madras faculty",
                  "Regular content updates",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              {[
                { icon: Shield, title: "Learn at Your Pace", desc: "Lifetime access to all purchased courses. Revisit lessons anytime on any device.", color: "text-blue-600", bg: "bg-blue-500/10" },
                { icon: TrendingUp, title: "IIT Madras Curriculum", desc: "Courses designed by IIT Madras faculty following the official BS Degree syllabus.", color: "text-indigo-600", bg: "bg-indigo-500/10" },
                { icon: Globe, title: "Watch Anywhere", desc: "High-quality video lessons accessible on desktop, tablet, or mobile — anytime.", color: "text-violet-600", bg: "bg-violet-500/10" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex gap-4 p-5 rounded-2xl border border-border/50 bg-background hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className={`shrink-0 w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-[#060B1F] text-white py-28">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize: "60px 60px" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white/70 text-sm">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            Start your IITM degree journey
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-5 tracking-tight">Ready to start learning?</h2>
          <p className="text-white/50 mb-10 max-w-xl mx-auto text-lg">
            Join thousands of students already on their IIT Madras Online Degree journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="h-12 px-10 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl shadow-blue-900/50 border-0 rounded-xl font-semibold">
              <Link href="/courses">
                Browse Programs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base border-white/15 text-white bg-white/5 hover:bg-white/10 hover:text-white rounded-xl font-semibold">
              {session?.user ? (
                <Link href={dashboardHref}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/register">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Free Account
                </Link>
              )}
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
