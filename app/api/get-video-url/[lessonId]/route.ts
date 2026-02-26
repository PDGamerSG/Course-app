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

    // Allow access if lesson is free
    if (lesson.isFree) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${lesson.youtubeVideoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
      return NextResponse.json({ embedUrl })
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

    const embedUrl = `https://www.youtube-nocookie.com/embed/${lesson.youtubeVideoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
    return NextResponse.json({ embedUrl })
  } catch (error) {
    console.error("[GET /api/get-video-url/[lessonId]]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
