import { notFound } from "next/navigation"
import Image from "next/image"
import { BookOpen, Clock, Users, CheckCircle, Lock, PlayCircle, Star, Award, Sparkles } from "lucide-react"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import CourseEnrollButton from "@/components/shared/CourseEnrollButton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type CourseLesson = { id: string; title: string; duration: string | null; isFree: boolean; order: number }
type CourseModule = { id: string; title: string; lessons: CourseLesson[] }

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string }
}) {
  const session = await auth()

  let course
  try {
    course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true },
      include: {
        teacher: { select: { id: true, name: true, image: true, email: true } },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, duration: true, isFree: true, order: true },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    })
  } catch {
    return notFound()
  }

  if (!course) return notFound()

  const modules = course.modules as CourseModule[]

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalDuration = modules
    .flatMap((m) => m.lessons)
    .reduce((sum, l) => {
      if (!l.duration) return sum
      const parts = l.duration.split(":").map(Number)
      return sum + (parts[0] * 60 + (parts[1] || 0))
    }, 0)

  let enrollment = null
  try {
    enrollment = session?.user
      ? await db.enrollment.findUnique({
          where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        })
      : null
  } catch {
    // ignore
  }

  const isEnrolled = !!enrollment
  const isOwner = session?.user?.id === course.teacherId || session?.user?.role === "ADMIN"
  const hasAccess = isEnrolled || isOwner
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayName = (course as any).instructorName || course.teacher.name || "Anonymous"

  const firstLesson = course.modules[0]?.lessons[0]

  const levelColor = course.level === "FOUNDATION" ? "from-blue-600 to-blue-500" : "from-indigo-600 to-violet-500"
  const levelLabel = course.level === "FOUNDATION" ? "Foundation" : course.level === "DIPLOMA" ? "Diploma" : null

  return (
    <div>
      {/* ── Hero banner ── */}
      <div className="bg-[#060B1F] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-blue-700/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex gap-2 mb-4">
            {levelLabel && (
              <span className={`inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r ${levelColor} text-white text-xs font-bold`}>
                {levelLabel}
              </span>
            )}
            {course.subject && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/10 text-white/70 text-xs font-semibold">
                {course.subject}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4 max-w-3xl">{course.title}</h1>
          {course.description && (
            <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-6">{course.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-5 text-sm text-white/50">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-white/20"}`} />
                ))}
              </div>
              <span className="text-amber-400 font-semibold">4.0</span>
              <span>({course._count.enrollments} students)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {totalLessons} lessons
            </div>
            {totalDuration > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
              </div>
            )}
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3 mt-5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shrink-0">
              {course.teacher.image ? (
                <Image src={course.teacher.image} alt={displayName} width={36} height={36} className="rounded-full" />
              ) : (
                <span className="text-sm font-bold text-white">{displayName[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-white/40">Instructor</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Curriculum */}
          <div className="lg:col-span-2 space-y-8">

            {/* What you'll learn */}
            <div className="rounded-2xl border border-border/50 p-6 bg-card">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                What you&apos;ll learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {[
                  "Comprehensive video lectures",
                  "Downloadable notes",
                  "Practice problems",
                  "Certificate on completion",
                  "Lifetime access",
                  "Watch on any device",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-xl font-black mb-2">Course Curriculum</h2>
              <p className="text-sm text-muted-foreground mb-5">
                {modules.length} sections • {totalLessons} lessons
              </p>
              <Accordion type="multiple" defaultValue={[modules[0]?.id]} className="space-y-2">
                {modules.map((module, idx) => (
                  <AccordionItem
                    key={module.id}
                    value={module.id}
                    className="border border-border/50 rounded-xl px-0 overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 text-left">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-sm">{module.title}</span>
                        <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          {module.lessons.length} lessons
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-3">
                      <ul className="space-y-0.5">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${hasAccess || lesson.isFree ? "bg-blue-500/10" : "bg-muted"}`}>
                              {hasAccess || lesson.isFree ? (
                                <PlayCircle className="h-3.5 w-3.5 text-blue-600" />
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-sm flex-1 font-medium">{lesson.title}</span>
                            {lesson.isFree && !hasAccess && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                Free Preview
                              </span>
                            )}
                            {lesson.duration && (
                              <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Right: Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-[70px]">
              <div className="rounded-2xl border border-border/50 overflow-hidden bg-card shadow-2xl shadow-black/10">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                  ) : (
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${levelColor}`}>
                      <BookOpen className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <div className="text-3xl font-black mb-1">
                      {course.price === 0 ? (
                        <span className="text-emerald-500">Free</span>
                      ) : (
                        <span>₹{course.price.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                    {course.price > 0 && (
                      <p className="text-xs text-muted-foreground">One-time payment · Lifetime access</p>
                    )}
                  </div>

                  <CourseEnrollButton
                    courseId={course.id}
                    price={course.price}
                    isEnrolled={isEnrolled}
                    isOwner={isOwner}
                    firstLessonId={firstLesson?.id}
                    isLoggedIn={!!session?.user}
                    courseName={course.title}
                    userName={session?.user?.name ?? undefined}
                    userEmail={session?.user?.email ?? undefined}
                  />

                  <div className="border-t border-border/50 pt-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">This course includes</p>
                    <ul className="space-y-2.5">
                      {[
                        { icon: PlayCircle, text: `${totalLessons} video lessons`, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { icon: CheckCircle, text: "Lifetime access", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { icon: Award, text: "Certificate of completion", color: "text-amber-500", bg: "bg-amber-500/10" },
                        { icon: Users, text: `${course._count.enrollments} students enrolled`, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                      ].map(({ icon: Icon, text, color, bg }) => (
                        <li key={text} className="flex items-center gap-2.5 text-sm">
                          <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-3 w-3 ${color}`} />
                          </div>
                          <span className="text-muted-foreground">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
