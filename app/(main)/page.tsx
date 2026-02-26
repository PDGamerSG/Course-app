import Link from "next/link"
import { ArrowRight, BookOpen, Users, Star, Zap, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import CourseCard from "@/components/shared/CourseCard"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

async function getFeaturedCourses() {
  try {
    return await db.course.findMany({
      where: { isPublished: true, isApproved: true },
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
    { label: "Average Rating", value: "4.8★", icon: Star },
    { label: "Completion Rate", value: "94%", icon: Zap },
  ]

  const features = [
    {
      icon: Shield,
      title: "Learn at Your Pace",
      desc: "Lifetime access to all purchased courses. Learn whenever suits you.",
    },
    {
      icon: Star,
      title: "Expert Teachers",
      desc: "Courses created by industry professionals with real-world experience.",
    },
    {
      icon: Globe,
      title: "Watch Anywhere",
      desc: "High-quality video lessons accessible on any device.",
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto px-4 text-center relative">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            🎓 Join 10,000+ learners worldwide
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            Learn new skills from{" "}
            <span className="text-primary">expert teachers</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Browse hundreds of courses taught by professionals. Learn at your own pace
            with lifetime access to video lessons.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/courses">
                Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="/register">Start Teaching</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label} className="space-y-2">
                <s.icon className="h-6 w-6 text-primary mx-auto" />
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Courses</h2>
              <p className="text-muted-foreground mt-1">Hand-picked courses to get you started</p>
            </div>
            <Button variant="ghost" asChild>
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
        </section>
      )}

      {/* Features */}
      <section className="bg-muted/20 border-t border-border/40 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why choose LearnHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <Card key={f.title} className="border-border/50 text-center p-6">
                <CardContent className="pt-0 space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start learning?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Join thousands of students already learning on LearnHub.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">
            Get started for free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
