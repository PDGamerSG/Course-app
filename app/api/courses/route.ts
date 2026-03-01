import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"


const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  thumbnail: z.string().optional(),
  level: z.enum(["FOUNDATION", "DIPLOMA"]).optional(),
  subject: z.string().optional(),
  instructorName: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter")
    const search = searchParams.get("search")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isPublished: true,
    }

    if (filter === "free") {
      where.price = 0
    } else if (filter === "paid") {
      where.price = { gt: 0 }
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" }
    }

    const courses = await db.course.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, name: true, image: true },
        },
        modules: {
          include: {
            lessons: { select: { id: true } },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("[GET /api/courses]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== "TEACHER" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: only teachers and admins can create courses" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createCourseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { title, description, price, thumbnail, level, subject, instructorName } = parsed.data

    const course = await db.course.create({
      data: {
        title,
        description,
        price,
        thumbnail,
        level: level ?? "FOUNDATION",
        subject,
        instructorName,
        teacherId: session.user.id as string,
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/courses]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
