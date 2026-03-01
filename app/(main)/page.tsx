import Link from "next/link"
import { ArrowRight, BookOpen, Users, Star, Zap, Shield, TrendingUp, Globe, CheckCircle, GraduationCap, FlaskConical, LayoutDashboard } from "lucide-react"
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
    session?.user?.role === "ADMIN" ? "/admin" :
    session?.user?.role === "TEACHER" ? "/teacher" : "/student"

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
      title: "IIT Madras Curriculum",
      desc: "Courses designed by IIT Madras faculty following the official BS Degree syllabus.",
    },
    {
      icon: Globe,
      title: "Watch Anywhere",
      desc: "High-quality video lessons accessible on desktop, tablet, or mobile — anytime.",
    },
  ]

  const whyUs = [
    "Follows IIT Madras BS Degree curriculum",
    "Certificate on completion",
    "Weekly live doubt-clearing sessions",
    "Lifetime access — learn at your pace",
    "Taught by IIT Madras faculty",
    "Regular content updates",
  ]

  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0A0F2C] text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "50px 50px" }}
        />
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-36 text-center">
          <Badge className="mb-4 bg-white/10 text-white border border-white/20 hover:bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            🎓 IIT Madras Online Degree Program
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1]">
            Your path to an{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              IIT Madras Degree
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Foundation and Diploma level courses designed exactly as per the IIT Madras BS Degree program.
            Study at your own pace with expert video lectures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/40">
              <Link href="/courses">
                Explore Programs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg" variant="outline" asChild
              className="text-base px-8 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white"
            >
              {session?.user ? (
                <Link href={dashboardHref}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/register">Create Free Account</Link>
              )}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-white/50">
            {["Foundation Program", "Diploma Program", "Certificate included", "Doubt clearing sessions"].map((t) => (
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

      {/* ── PROGRAM TRACKS ── */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Two Tracks</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Choose Your Program</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start with Foundation to build core skills, then advance to Diploma for specialization.
            Both programs follow the official IIT Madras BS Degree structure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Foundation Card */}
          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Foundation Program</h3>
                  <p className="text-blue-100 text-sm">Semester 1–4 · Core Subjects</p>
                </div>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Build a strong foundation in Mathematics, Statistics, English, and Computational Thinking — the bedrock of the IIT Madras degree.
              </p>
            </div>
            <div className="p-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Subjects Covered</h4>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {FOUNDATION_SUBJECTS.map((s) => (
                  <div key={s.code} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/courses?level=FOUNDATION">
                  View Foundation Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Diploma Card */}
          <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Diploma Program</h3>
                  <p className="text-indigo-100 text-sm">Semester 5–8 · Specialization</p>
                </div>
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Dive deep into Data Science, Machine Learning, and Business Analytics — advanced topics for the IIT Madras Diploma in Programming & Data Science.
              </p>
            </div>
            <div className="p-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Subjects Covered</h4>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {DIPLOMA_SUBJECTS.map((s) => (
                  <div key={s.code} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
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
        <section className="bg-muted/20 border-y border-border/40 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Foundation</p>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Foundation Courses</h2>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/courses?level=FOUNDATION">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {foundationCourses.map((course) => {
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
                    subject={course.subject ?? undefined}
                    level="FOUNDATION"
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── DIPLOMA COURSES ── */}
      {diplomaCourses.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="h-4 w-4 text-indigo-500" />
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Diploma</p>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Diploma Courses</h2>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/courses?level=DIPLOMA">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {diplomaCourses.map((course) => {
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
                    subject={course.subject ?? undefined}
                    level="DIPLOMA"
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── JOURNEY STEPS ── */}
      <section className="bg-muted/30 border-y border-border/40 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">How it works</p>
            <h2 className="text-3xl font-bold">Your learning journey</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: "01", icon: Users, title: "Create your account", desc: "Sign up free and browse all available courses." },
              { step: "02", icon: FlaskConical, title: "Enroll in a course", desc: "Pay once, get lifetime access to all lectures and notes." },
              { step: "03", icon: GraduationCap, title: "Earn your certificate", desc: "Complete the course and download your certificate." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                  <s.icon className="h-6 w-6 text-primary" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{s.step}</span>
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Why us?</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to crack the IITM degree</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We follow the exact IIT Madras BS Degree syllabus. Our video lectures, notes, and practice problems are
                aligned with the official course material.
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
            🎓 Start your IITM degree journey
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Ready to start learning?</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto text-lg">
            Join thousands of students already on their IIT Madras Online Degree journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/40">
              <Link href="/courses">
                Browse Programs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white">
              {session?.user ? (
                <Link href={dashboardHref}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/register">Create Free Account</Link>
              )}
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
