import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import TeacherCourseEditor from "@/components/dashboard/TeacherCourseEditor"
import { Button } from "@/components/ui/button"

export default async function EditCoursePage({
  params,
}: {
  params: { courseId: string }
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  let course
  try {
    course = await db.course.findUnique({
      where: { id: params.courseId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })
  } catch {
    return notFound()
  }

  if (!course) return notFound()

  // Only the teacher who owns it or an admin can edit
  if (course.teacherId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/teacher")
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/50 px-6 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teacher">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>
      <TeacherCourseEditor course={course} />
    </div>
  )
}
