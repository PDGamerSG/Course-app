import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = params

    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id as string,
          courseId,
        },
      },
    })

    return NextResponse.json({ enrolled: enrollment !== null })
  } catch (error) {
    console.error("[GET /api/courses/[courseId]/enroll]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
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

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })
    if (course.price !== 0) return NextResponse.json({ error: "This is a paid course" }, { status: 400 })

    const enrollment = await db.enrollment.upsert({
      where: {
        userId_courseId: { userId: session.user.id as string, courseId },
      },
      update: {},
      create: { userId: session.user.id as string, courseId },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error("[POST /api/courses/[courseId]/enroll]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

