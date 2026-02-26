import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Role } from "@prisma/client"

const createModuleSchema = z.object({
  title: z.string().min(1, "Title is required"),
})

const reorderModulesSchema = z.object({
  modules: z.array(
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
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = params
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
    const parsed = createModuleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const maxOrder = await db.module.aggregate({
      where: { courseId },
      _max: { order: true },
    })
    const nextOrder = (maxOrder._max.order ?? 0) + 1

    const createdModule = await db.module.create({
      data: {
        title: parsed.data.title,
        courseId,
        order: nextOrder,
      },
    })

    return NextResponse.json(createdModule, { status: 201 })
  } catch (error) {
    console.error("[POST /api/courses/[courseId]/modules]", error)
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
    const parsed = reorderModulesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    await Promise.all(
      parsed.data.modules.map(({ id, order }) =>
        db.module.update({ where: { id }, data: { order } })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PUT /api/courses/[courseId]/modules]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { courseId } = params
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("moduleId")
    if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 })

    const { course, authorized } = await authorizeForCourse(courseId, session.user.id as string, session.user.role as Role)
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })
    if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await db.module.delete({ where: { id: moduleId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/courses/[courseId]/modules]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
