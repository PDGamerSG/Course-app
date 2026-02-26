import { notFound } from "next/navigation"
import Image from "next/image"
import { BookOpen, Clock, Users, CheckCircle, Lock, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import CourseEnrollButton from "@/components/shared/CourseEnrollButton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string }
}) {
  const session = await auth()

  let course
  try {
    course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true, isApproved: true },
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

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalDuration = course.modules
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

  const firstLesson = course.modules[0]?.lessons[0]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Course Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">Course</Badge>
            <h1 className="text-3xl font-bold leading-tight mb-4">{course.title}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{course.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {totalLessons} lessons
            </div>
            {totalDuration > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {course._count.enrollments} students
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {course.teacher.image ? (
                <Image src={course.teacher.image} alt={course.teacher.name || ""} width={40} height={40} />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {course.teacher.name?.[0]?.toUpperCase() || "T"}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{course.teacher.name}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
          </div>

          <Separator />

          {/* Curriculum */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>
            <Accordion type="multiple" className="space-y-2">
              {course.modules.map((module) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border border-border/50 rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <span className="font-medium">{module.title}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {module.lessons.length} lessons
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 pb-2">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center gap-3 py-2 px-1">
                          {hasAccess || lesson.isFree ? (
                            <PlayCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm flex-1">{lesson.title}</span>
                          {lesson.isFree && (
                            <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                              Preview
                            </Badge>
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
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border border-border/50 overflow-hidden bg-card shadow-xl">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <BookOpen className="h-16 w-16 text-primary/30" />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="text-3xl font-bold">
                  {course.price === 0 ? (
                    <span className="text-green-500">Free</span>
                  ) : (
                    <span>₹{course.price.toLocaleString("en-IN")}</span>
                  )}
                </div>

                <CourseEnrollButton
                  courseId={course.id}
                  price={course.price}
                  isEnrolled={isEnrolled}
                  isOwner={isOwner}
                  firstLessonId={firstLesson?.id}
                  isLoggedIn={!!session?.user}
                />

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {totalLessons} video lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Watch on any device
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
