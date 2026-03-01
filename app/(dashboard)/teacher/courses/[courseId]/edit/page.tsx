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
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        price: true,
        level: true,
        subject: true,
        instructorName: true,
        isPublished: true,
        isApproved: true,
        teacherId: true,
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
    <div className="h-full flex flex-col">
      <div className="border-b border-border/50 px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teacher">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <TeacherCourseEditor course={course} />
      </div>
    </div>
  )
}
