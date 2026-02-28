import { Search, BookOpen, SlidersHorizontal } from "lucide-react"
import CourseCard from "@/components/shared/CourseCard"
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface SearchParams {
  filter?: string
  search?: string
}

async function getCourses(filter?: string, search?: string) {
  try {
    return await db.course.findMany({
      where: {
        isPublished: true,
        ...(filter === "free" && { price: 0 }),
        ...(filter === "paid" && { price: { gt: 0 } }),
        ...(search && { title: { contains: search, mode: "insensitive" } }),
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

const FILTERS = [
  { label: "All Courses", value: "" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
]

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const courses = await getCourses(searchParams.filter, searchParams.search)
  const active = searchParams.filter ?? ""

  return (
    <div>
      {/* ── Page header ── */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl">
            <p className="text-sm text-primary font-semibold uppercase tracking-widest mb-1">LearnHub Library</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Browse All Courses</h1>
            <p className="text-muted-foreground">
              {courses.length} course{courses.length !== 1 ? "s" : ""} available — start learning today
            </p>
          </div>

          {/* Search bar */}
          <form className="mt-6 flex gap-3 max-w-xl" method="GET">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            {searchParams.filter && (
              <input type="hidden" name="filter" value={searchParams.filter} />
            )}
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
          {FILTERS.map((f) => (
            <a
              key={f.value}
              href={f.value ? `/courses?filter=${f.value}${searchParams.search ? `&search=${searchParams.search}` : ""}` : `/courses${searchParams.search ? `?search=${searchParams.search}` : ""}`}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                active === f.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
              )}
            >
              {f.label}
            </a>
          ))}
          {(searchParams.search || searchParams.filter) && (
            <a
              href="/courses"
              className="ml-2 text-xs text-muted-foreground hover:text-destructive underline underline-offset-2"
            >
              Clear filters
            </a>
          )}
        </div>

        {/* Grid */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No courses found</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {searchParams.search
                ? `No results for "${searchParams.search}". Try a different keyword.`
                : "No courses match this filter yet. Check back soon!"}
            </p>
            <a href="/courses" className="text-sm text-primary underline underline-offset-2">
              Browse all courses
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => {
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
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
