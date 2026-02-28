import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// In-memory rate limiter: userId -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(userId)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string

    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before requesting more videos." },
        { status: 429 }
      )
    }

    const { lessonId } = params

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: { course: true },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Encode the video ID so it isn't immediately identifiable in network responses
    const encode = (id: string) => Buffer.from(id).toString("base64")

    // Allow access if lesson is free
    if (lesson.isFree) {
      return NextResponse.json({ vid: encode(lesson.youtubeVideoId) })
    }

    // Allow access if user is the course teacher or an admin
    const isOwner = lesson.module.course.teacherId === userId
    const isAdmin = session.user.role === "ADMIN"
    if (isOwner || isAdmin) {
      return NextResponse.json({ vid: encode(lesson.youtubeVideoId) })
    }

    // Otherwise check enrollment
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 401 })
    }

    return NextResponse.json({ vid: encode(lesson.youtubeVideoId) })
  } catch (error) {
    console.error("[GET /api/get-video-url/[lessonId]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
