import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const markProgressSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  completed: z.boolean().optional().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = markProgressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { lessonId, completed } = parsed.data
    const userId = session.user.id as string

    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed,
        watchedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        completed,
      },
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("[POST /api/progress]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    if (!courseId) {
      return NextResponse.json({ error: "courseId query parameter is required" }, { status: 400 })
    }

    const userId = session.user.id as string

    // Fetch all lesson IDs belonging to the course, then get progress
    const progressRecords = await db.progress.findMany({
      where: {
        userId,
        lesson: {
          module: { courseId },
        },
      },
      include: {
        lesson: {
          select: { id: true, title: true, moduleId: true },
        },
      },
    })

    return NextResponse.json({ progress: progressRecords })
  } catch (error) {
    console.error("[GET /api/progress]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
