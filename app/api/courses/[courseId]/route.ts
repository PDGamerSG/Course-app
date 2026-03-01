import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

type ApiLesson = { id: string; title: string; youtubeVideoId: string; duration: string | null; notesUrl: string | null; order: number; isFree: boolean; moduleId: string }
type ApiModule = { id: string; title: string; order: number; courseId: string; lessons: ApiLesson[] }
type ApiModuleWithLessonIds = { id: string; lessons: { id: string }[] }

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  thumbnail: z.string().optional(),
  level: z.enum(["FOUNDATION", "DIPLOMA"]).optional(),
  subject: z.string().optional(),
  instructorName: z.string().optional(),
  isPublished: z.boolean().optional(),
  isApproved: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const session = await auth()

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: { id: true, name: true, image: true },
        },
        modules: {
          include: { lessons: true },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const isTeacher = session?.user?.id === course.teacherId
    const isAdmin = (session?.user?.role) === "ADMIN"

    if (isTeacher || isAdmin) {
      return NextResponse.json({ course })
    }

    // Public access: course must be published
    if (!course.isPublished) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Strip youtubeVideoId from lessons for public consumers
    const sanitized = {
      ...course,
      modules: (course.modules as ApiModule[]).map((mod) => ({
        ...mod,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        lessons: mod.lessons.map(({ youtubeVideoId: _vid, ...lesson }) => lesson),
      })),
    }

    return NextResponse.json({ course: sanitized })
  } catch (error) {
    console.error("[GET /api/courses/[courseId]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = params

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: { select: { id: true } } },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const isTeacher = session.user.id === course.teacherId
    const isAdmin = (session.user.role) === "ADMIN"
    if (!isTeacher && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    if (data.isPublished === true) {
      const hasContent = (course.modules as ApiModuleWithLessonIds[]).some((m) => m.lessons.length > 0)
      if (!hasContent) {
        return NextResponse.json(
          { error: "Course must have at least 1 module with 1 lesson before publishing" },
          { status: 400 }
        )
      }
      // Auto-approve when teacher publishes – no separate review step needed
      data.isApproved = true
    }

    const updated = await db.course.update({
      where: { id: courseId },
      data,
    })

    return NextResponse.json({ course: updated })
  } catch (error) {
    console.error("[PUT /api/courses/[courseId]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = params

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const isTeacher = session.user.id === course.teacherId
    const isAdmin = (session.user.role) === "ADMIN"
    if (!isTeacher && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await db.course.delete({ where: { id: courseId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/courses/[courseId]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
