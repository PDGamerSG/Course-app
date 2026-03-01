import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendCourseApprovedEmail, sendCourseRejectedEmail } from "@/lib/resend"

const approveActionSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
})

const updateRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = approveActionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { courseId, action, reason } = parsed.data

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: { select: { email: true, name: true } },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    if (action === "approve") {
      await db.course.update({
        where: { id: courseId },
        data: { isApproved: true },
      })

      // Email is best-effort — don't fail the approval if Resend isn't configured
      try {
        await sendCourseApprovedEmail(
          course.teacher.email,
          course.teacher.name ?? "Teacher",
          course.title
        )
      } catch (emailErr) {
        console.warn("[approve] Email notification failed (non-fatal):", emailErr)
      }

      return NextResponse.json({ success: true, message: "Course approved" })
    }

    // action === "reject"
    await db.course.update({
      where: { id: courseId },
      data: { isPublished: false, isApproved: false },
    })

    // Email is best-effort — don't fail the rejection if Resend isn't configured
    try {
      await sendCourseRejectedEmail(
        course.teacher.email,
        course.teacher.name ?? "Teacher",
        course.title,
        reason
      )
    } catch (emailErr) {
      console.warn("[reject] Email notification failed (non-fatal):", emailErr)
    }

    return NextResponse.json({ success: true, message: "Course rejected" })
  } catch (error) {
    console.error("[POST /api/admin/approve]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateRoleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { userId, role } = parsed.data

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { role: role },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("[PUT /api/admin/approve]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
