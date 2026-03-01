import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Plus, BookOpen, Users, Eye, Pencil, GraduationCap } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function TeacherDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/student")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let courses: any[] = []
  try {
    courses = await db.course.findMany({
      where: { teacherId: session.user.id },
      include: {
        modules: {
          include: { lessons: { select: { id: true } } },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    // DB not connected yet
  }

  const foundation = courses.filter((c: { level: string }) => c.level === "FOUNDATION")
  const diploma    = courses.filter((c: { level: string }) => c.level === "DIPLOMA")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function CourseCard({ course }: { course: any }) {
    const lessonCount = course.modules.reduce((sum: number, m: { lessons: { id: string }[] }) => sum + m.lessons.length, 0)
    return (
      <Card key={course.id} className="border-border/50 hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {course.thumbnail ? (
                <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  {course.subject && (
                    <p className="text-xs text-muted-foreground mt-0.5">{course.subject}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {course.isPublished ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Published</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {lessonCount} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course._count.enrollments} students
                </span>
                <span className="font-medium text-foreground">
                  {course.price === 0 ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/teacher/courses/${course.id}/edit`}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Link>
              </Button>
              {course.isPublished && (
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/courses/${course.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-1">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/teacher/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-xl">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">Create your first course and start teaching!</p>
          <Button asChild>
            <Link href="/teacher/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {foundation.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Foundation Program</h2>
                <Badge variant="outline" className="text-blue-500 border-blue-500/30">{foundation.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {foundation.map((c: { id: string }) => <CourseCard key={c.id} course={c} />)}
              </div>
            </section>
          )}

          {diploma.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Diploma Program</h2>
                <Badge variant="outline" className="text-indigo-500 border-indigo-500/30">{diploma.length}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {diploma.map((c: { id: string }) => <CourseCard key={c.id} course={c} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
