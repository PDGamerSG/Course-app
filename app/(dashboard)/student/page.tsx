import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, PlayCircle } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function StudentDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let enrollments: any[] = []
  let completedLessonIds = new Set<string>()
  try {
    enrollments = await db.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            teacher: { select: { name: true } },
            modules: {
              include: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    const progressRecords = await db.progress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { lessonId: true },
    })
    completedLessonIds = new Set(progressRecords.map((p) => p.lessonId))
  } catch {
    // DB not connected yet — show empty state
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Learning</h1>
        <p className="text-muted-foreground mt-1">Continue where you left off</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20 border border-border/50 rounded-xl">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">Browse our catalog and start learning today!</p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(({ course }: { course: { id: string; title: string; thumbnail: string | null; teacher: { name: string | null }; modules: { id: string; lessons: { id: string }[] }[] } }) => {
            const allLessons = course.modules.flatMap((m: { lessons: { id: string }[] }) => m.lessons)
            const totalLessons = allLessons.length
            const completedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length
            const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

            // Find first incomplete lesson
            const nextLesson =
              allLessons.find((l) => !completedLessonIds.has(l.id)) || allLessons[0]

            return (
              <Card key={course.id} className="border-border/50 hover:border-primary/30 transition-colors overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {course.thumbnail ? (
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <BookOpen className="h-10 w-10 text-primary/30" />
                    </div>
                  )}
                  {progressPct === 100 && (
                    <Badge className="absolute top-2 right-2 bg-green-500 text-white">Completed</Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">by {course.teacher.name || "Teacher"}</p>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{completedCount}/{totalLessons} lessons</span>
                    </div>
                    <Progress value={progressPct} className="h-1.5" />
                  </div>

                  <Button size="sm" className="w-full" asChild>
                    <Link href={nextLesson ? `/learn/${course.id}/${nextLesson.id}` : `/courses/${course.id}`}>
                      <PlayCircle className="mr-2 h-3 w-3" />
                      {progressPct === 0 ? "Start Learning" : progressPct === 100 ? "Review Course" : "Continue"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
