import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeVideoId: z.string().min(1, "YouTube video ID is required"),
  duration: z.string().optional(),
  isFree: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  youtubeVideoId: z.string().min(1).optional(),
  duration: z.string().optional(),
  isFree: z.boolean().optional(),
})

const reorderLessonsSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
})

async function authorizeForCourse(courseId: string, userId: string, userRole: Role) {
  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return { course: null, authorized: false }
  const authorized = course.teacherId === userId || userRole === Role.ADMIN
  return { course, authorized }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, moduleId } = params
    const { course, authorized } = await authorizeForCourse(
      courseId,
      session.user.id as string,
      session.user.role as Role
    )

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const moduleRecord = await db.module.findUnique({ where: { id: moduleId, courseId } })
    if (!moduleRecord) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = createLessonSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { title, youtubeVideoId, duration, isFree, order: providedOrder } = parsed.data

    let lessonOrder = providedOrder
    if (lessonOrder === undefined) {
      const maxOrder = await db.lesson.aggregate({
        where: { moduleId },
        _max: { order: true },
      })
      lessonOrder = (maxOrder._max.order ?? 0) + 1
    }

    const lesson = await db.lesson.create({
      data: {
        title,
        youtubeVideoId,
        duration,
        isFree: isFree ?? false,
        order: lessonOrder,
        moduleId,
      },
    })

    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/courses/[courseId]/modules/[moduleId]/lessons]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, moduleId } = params
    const { course, authorized } = await authorizeForCourse(
      courseId,
      session.user.id as string,
      session.user.role as Role
    )

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Detect reorder payload vs single lesson update
    const reorderParsed = reorderLessonsSchema.safeParse(body)
    if (reorderParsed.success) {
      await Promise.all(
        reorderParsed.data.lessons.map(({ id, order }) =>
          db.lesson.update({ where: { id, moduleId }, data: { order } })
        )
      )
      return NextResponse.json({ success: true })
    }

    // Single lesson update - requires lessonId in body
    const singleUpdateSchema = updateLessonSchema.extend({ lessonId: z.string() })
    const singleParsed = singleUpdateSchema.safeParse(body)
    if (!singleParsed.success) {
      return NextResponse.json({ error: singleParsed.error.flatten() }, { status: 400 })
    }

    const { lessonId, ...data } = singleParsed.data

    const updated = await db.lesson.update({
      where: { id: lessonId, moduleId },
      data,
    })

    return NextResponse.json({ lesson: updated })
  } catch (error) {
    console.error("[PUT /api/courses/[courseId]/modules/[moduleId]/lessons]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, moduleId } = params
    const { course, authorized } = await authorizeForCourse(
      courseId,
      session.user.id as string,
      session.user.role as Role
    )

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId query parameter is required" }, { status: 400 })
    }

    await db.lesson.delete({ where: { id: lessonId, moduleId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/courses/[courseId]/modules/[moduleId]/lessons]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
