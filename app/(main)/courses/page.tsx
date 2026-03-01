import { Search, BookOpen, SlidersHorizontal, GraduationCap, Sparkles } from "lucide-react"
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

          {/* Search bar */}
          <form className="mt-7 flex gap-3 max-w-xl" method="GET">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
              <input
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search courses..."
                className="w-full pl-11 pr-4 h-11 rounded-xl border border-white/10 bg-white/7 text-white placeholder:text-white/25 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              />
            </div>
            {searchParams.level && (
              <input type="hidden" name="level" value={searchParams.level} />
            )}
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-900/40"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Level filter */}
        <div className="flex items-center gap-2.5 mb-10 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mr-1">Filter:</span>
          {LEVELS.map((f) => (
            <a
              key={f.value}
              href={f.value ? `/courses?level=${f.value}${searchParams.search ? `&search=${searchParams.search}` : ""}` : `/courses${searchParams.search ? `?search=${searchParams.search}` : ""}`}
              className={cn(
                "px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all",
                activeLevel === f.value
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/40"
              )}
            >
              {f.label}
            </a>
          ))}
          {(searchParams.search || searchParams.level) && (
            <a href="/courses" className="ml-1 text-xs text-muted-foreground hover:text-destructive underline underline-offset-2">
              Clear filters
            </a>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <BookOpen className="h-9 w-9 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No courses found</h3>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {searchParams.search
                ? `No results for "${searchParams.search}". Try a different keyword.`
                : "No courses match this filter yet. Check back soon!"}
            </p>
            <a href="/courses" className="text-sm text-primary underline underline-offset-2 font-medium">Browse all courses</a>
          </div>
        ) : (
          <div className="space-y-16">

            {/* Foundation Section */}
            {showFoundation && foundationCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-7 pb-4 border-b border-border/50">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Foundation Program</h2>
                    <p className="text-sm text-muted-foreground">Core subjects — build your fundamentals</p>
                  </div>
                  <span className="ml-auto text-sm font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                    {foundationCourses.length} course{foundationCourses.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {foundationCourses.map((course) => {
                    const lessonCount = course.modules.reduce((sum: number, m: { lessons: unknown[] }) => sum + m.lessons.length, 0)
                    return (
                       <CourseCard
                         key={course.id}
                         id={course.id}
                         title={course.title}
                         description={course.description}
                         thumbnail={course.thumbnail}
                         price={course.price}
                         teacher={course.teacher}
                         instructorName={course.instructorName}
                         lessonCount={lessonCount}
                         enrollmentCount={course._count.enrollments}
                         subject={course.subject ?? undefined}
                       />
                     )
                   })}
                 </div>
               </section>
             )}

             {/* Diploma Section */}
             {showDiploma && diplomaCourses.length > 0 && (
               <section>
                 <div className="flex items-center gap-3 mb-7 pb-4 border-b border-border/50">
                   <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                     <GraduationCap className="h-5 w-5 text-indigo-500" />
                   </div>
                   <div>
                     <h2 className="text-xl font-black">Diploma Program</h2>
                     <p className="text-sm text-muted-foreground">Advanced specializations — go deeper</p>
                   </div>
                   <span className="ml-auto text-sm font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                     {diplomaCourses.length} course{diplomaCourses.length !== 1 ? "s" : ""}
                   </span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                   {diplomaCourses.map((course) => {
                    const lessonCount = course.modules.reduce((sum: number, m: { lessons: unknown[] }) => sum + m.lessons.length, 0)
                    return (
                      <CourseCard
                        key={course.id}
                        id={course.id}
                        title={course.title}
                        description={course.description}
                        thumbnail={course.thumbnail}
                        price={course.price}
                        teacher={course.teacher}
                        instructorName={course.instructorName}
                        lessonCount={lessonCount}
                        enrollmentCount={course._count.enrollments}
                        subject={course.subject ?? undefined}
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
