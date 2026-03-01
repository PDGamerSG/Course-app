import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Menu, BookOpen, Download } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import LessonPlayer from "@/components/shared/LessonPlayer"
import LessonList from "@/components/shared/LessonList"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default async function LearnPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let course
  try {
    course = await db.course.findUnique({
      where: { id: params.courseId },
      include: {
        teacher: { select: { id: true, name: true } },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, duration: true, isFree: true, order: true },
            },
          },
        },
      },
    })
  } catch {
    return notFound()
  }

  if (!course) return notFound()

  let lesson
  try {
    lesson = await db.lesson.findUnique({
      where: { id: params.lessonId },
      select: { id: true, title: true, duration: true, isFree: true, moduleId: true, notesUrl: true },
    })
  } catch {
    return notFound()
  }

  if (!lesson) return notFound()

  // Check access
  const isOwner = session.user.id === course.teacherId || session.user.role === "ADMIN"
  let enrollment = null
  try {
    enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    })
  } catch {
    // ignore
  }
  const hasAccess = isOwner || !!enrollment || lesson.isFree

  if (!hasAccess) redirect(`/courses/${course.id}`)

  // Get progress
  let progress: { lessonId: string; completed: boolean }[] = []
  try {
    progress = await db.progress.findMany({
      where: {
        userId: session.user.id,
        lesson: { module: { courseId: course.id } },
      },
      select: { lessonId: true, completed: true },
    })
  } catch {
    // ignore
  }

  // Find prev/next lessons
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const currentIndex = allLessons.findIndex((l) => l.id === params.lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main video area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${course.id}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-medium line-clamp-1">{course.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile lesson list */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4 mr-1" />
                  Lessons
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-80">
                <LessonList
                  courseId={course.id}
                  modules={course.modules}
                  currentLessonId={params.lessonId}
                  progress={progress}
                  hasAccess={!!enrollment || isOwner}
                />
              </SheetContent>
            </Sheet>

            {/* Prev/Next navigation */}
            <Button variant="ghost" size="sm" asChild disabled={!prevLesson}>
              <Link href={prevLesson ? `/learn/${course.id}/${prevLesson.id}` : "#"}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild disabled={!nextLesson}>
              <Link href={nextLesson ? `/learn/${course.id}/${nextLesson.id}` : "#"}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Video + lesson info */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            <div className="flex flex-col gap-4">
              <LessonPlayer
                lessonId={params.lessonId}
                courseId={course.id}
                isCompleted={progress.some((p) => p.lessonId === params.lessonId && p.completed)}
                nextLessonId={nextLesson?.id}
              />
            </div>

            <div>
              <h1 className="text-xl font-bold">{lesson.title}</h1>
              {lesson.duration && (
                <p className="text-sm text-muted-foreground mt-1">{lesson.duration}</p>
              )}
            </div>

            {lesson.notesUrl && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Lecture Notes</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Download the notes and resources for this lesson</p>
                </div>
                <a
                  href={lesson.notesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar - lesson list (desktop) */}
      <div className="hidden lg:flex flex-col w-80 border-l border-border/50 flex-shrink-0 overflow-hidden">
        <LessonList
          courseId={course.id}
          modules={course.modules}
          currentLessonId={params.lessonId}
          progress={progress}
          hasAccess={!!enrollment || isOwner}
        />
      </div>
    </div>
  )
}
