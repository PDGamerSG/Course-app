import { Search, BookOpen, SlidersHorizontal, GraduationCap } from "lucide-react"
import CourseCard from "@/components/shared/CourseCard"
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface SearchParams {
  level?: string
  search?: string
}

async function getCourses(level?: string, search?: string) {
  try {
    return await db.course.findMany({
      where: {
        isPublished: true,
        ...(level === "FOUNDATION" || level === "DIPLOMA" ? { level: level as "FOUNDATION" | "DIPLOMA" } : {}),
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      },
      include: {
        teacher: { select: { id: true, name: true, image: true } },
        modules: { include: { lessons: { select: { id: true } } } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    return []
  }
}

const LEVELS = [
  { label: "All Courses", value: "" },
  { label: "Foundation", value: "FOUNDATION" },
  { label: "Diploma", value: "DIPLOMA" },
]

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const courses = await getCourses(searchParams.level, searchParams.search)
  const activeLevel = searchParams.level ?? ""

  const foundationCourses = courses.filter((c) => c.level === "FOUNDATION")
  const diplomaCourses = courses.filter((c) => c.level === "DIPLOMA")

  const showAll = !activeLevel
  const showFoundation = showAll || activeLevel === "FOUNDATION"
  const showDiploma = showAll || activeLevel === "DIPLOMA"

  return (
    <div>
      {/* ── Page header ── */}
      <div className="bg-[#0A0F2C] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-1">IIT Madras Online Degree</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Course Catalog</h1>
            <p className="text-white/60">
              {courses.length} course{courses.length !== 1 ? "s" : ""} across Foundation and Diploma programs
            </p>
          </div>

          {/* Search bar */}
          <form className="mt-6 flex gap-3 max-w-xl" method="GET">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              <input
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
            {searchParams.level && (
              <input type="hidden" name="level" value={searchParams.level} />
            )}
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Level filter pills */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
          {LEVELS.map((f) => (
            <a
              key={f.value}
              href={f.value ? `/courses?level=${f.value}${searchParams.search ? `&search=${searchParams.search}` : ""}` : `/courses${searchParams.search ? `?search=${searchParams.search}` : ""}`}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                activeLevel === f.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
              )}
            >
              {f.label}
            </a>
          ))}
          {(searchParams.search || searchParams.level) && (
            <a href="/courses" className="ml-2 text-xs text-muted-foreground hover:text-destructive underline underline-offset-2">
              Clear filters
            </a>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No courses found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {searchParams.search
                ? `No results for &quot;${searchParams.search}&quot;. Try a different keyword.`
                : "No courses match this filter yet. Check back soon!"}
            </p>
            <a href="/courses" className="text-sm text-primary underline underline-offset-2">Browse all courses</a>
          </div>
        ) : (
          <div className="space-y-14">

            {/* Foundation Section */}
            {showFoundation && foundationCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Foundation Program</h2>
                    <p className="text-sm text-muted-foreground">Core subjects — build your fundamentals</p>
                  </div>
                  <span className="ml-auto text-sm text-muted-foreground">{foundationCourses.length} course{foundationCourses.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {foundationCourses.map((course) => {
                    const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
                    return (
                      <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        thumbnail={course.thumbnail}
                        price={course.price}
                        teacher={course.teacher}
                        lessonCount={lessonCount}
                        enrollmentCount={course._count.enrollments}
                        subject={course.subject ?? undefined}
                        level="FOUNDATION"
                      />
                    )
                  })}
                </div>
              </section>
            )}

            {/* Diploma Section */}
            {showDiploma && diplomaCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Diploma Program</h2>
                    <p className="text-sm text-muted-foreground">Advanced specializations — go deeper</p>
                  </div>
                  <span className="ml-auto text-sm text-muted-foreground">{diplomaCourses.length} course{diplomaCourses.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {diplomaCourses.map((course) => {
                    const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
                    return (
                      <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        thumbnail={course.thumbnail}
                        price={course.price}
                        teacher={course.teacher}
                        lessonCount={lessonCount}
                        enrollmentCount={course._count.enrollments}
                        subject={course.subject ?? undefined}
                        level="DIPLOMA"
                      />
                    )
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
