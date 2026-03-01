import { Suspense } from "react"
import { Sparkles } from "lucide-react"
import type { CourseListing } from "@/types"
import CoursesFilter from "@/components/shared/CoursesFilter"
import { db } from "@/lib/db"

// Revalidate every 5 minutes — fast for users, fresh for admins publishing courses
export const revalidate = 300

async function getCourses(): Promise<CourseListing[]> {
  try {
    return await db.course.findMany({
      where: { isPublished: true },
      include: {
        teacher: { select: { id: true, name: true, image: true } },
        modules: { include: { lessons: { select: { id: true } } } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as CourseListing[]
  } catch {
    return []
  }
}

export default async function CoursesPage() {
  const rawCourses = await getCourses()

  // Pre-compute lesson counts on the server so the client component gets plain data
  const courses = rawCourses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    price: course.price,
    level: course.level as "FOUNDATION" | "DIPLOMA",
    subject: course.subject ?? null,
    instructorName: course.instructorName ?? null,
    teacher: course.teacher,
    lessonCount: (course.modules as { lessons: unknown[] }[]).reduce((sum, m) => sum + m.lessons.length, 0),
    enrollmentCount: course._count.enrollments,
  }))

  return (
    <div>
      {/* Page header */}
      <div className="relative overflow-hidden bg-[#060B1F] text-white -mt-[76px] pt-[76px]">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize: "60px 60px" }}
        />
        <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-blue-700/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-indigo-700/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-14">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">IIT Madras Online Degree</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">Course Catalog</h1>
            <p className="text-white/50 text-base">
              {courses.length} course{courses.length !== 1 ? "s" : ""} across Foundation and Diploma programs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Client-side filter — reads URL params, instant filtering */}
        <Suspense fallback={<div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Loading courses…</div>}>
          <CoursesFilter courses={courses} />
        </Suspense>
      </div>
    </div>
  )
}
