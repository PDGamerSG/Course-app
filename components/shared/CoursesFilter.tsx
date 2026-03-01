"use client"

import { useState, useMemo } from "react"
import { BookOpen, GraduationCap, SlidersHorizontal, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import CourseCard from "@/components/shared/CourseCard"

interface CourseListing {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  price: number
  level: "FOUNDATION" | "DIPLOMA"
  subject: string | null
  instructorName: string | null
  teacher: { id: string; name: string | null; image: string | null }
  lessonCount: number
  enrollmentCount: number
}

const LEVELS = [
  { label: "All Courses", value: "" },
  { label: "Foundation", value: "FOUNDATION" },
  { label: "Diploma", value: "DIPLOMA" },
]

export default function CoursesFilter({
  courses,
  initialLevel,
  initialSearch,
}: {
  courses: CourseListing[]
  initialLevel?: string
  initialSearch?: string
}) {
  const [activeLevel, setActiveLevel] = useState(initialLevel ?? "")
  const [search, setSearch] = useState(initialSearch ?? "")
  const [inputValue, setInputValue] = useState(initialSearch ?? "")

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchLevel = !activeLevel || c.level === activeLevel
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
      return matchLevel && matchSearch
    })
  }, [courses, activeLevel, search])

  const foundationCourses = filtered.filter((c) => c.level === "FOUNDATION")
  const diplomaCourses = filtered.filter((c) => c.level === "DIPLOMA")

  const showFoundation = !activeLevel || activeLevel === "FOUNDATION"
  const showDiploma = !activeLevel || activeLevel === "DIPLOMA"

  return (
    <>
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(inputValue)}
            placeholder="Search courses..."
            className="w-full pl-11 pr-4 h-10 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
          />
        </div>
        <button
          onClick={() => setSearch(inputValue)}
          className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Level filters */}
      <div className="flex items-center gap-2.5 mb-10 flex-wrap">
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mr-1">Filter:</span>
        {LEVELS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveLevel(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all",
              activeLevel === f.value
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/40"
            )}
          >
            {f.label}
          </button>
        ))}
        {(search || activeLevel) && (
          <button
            onClick={() => { setActiveLevel(""); setSearch(""); setInputValue("") }}
            className="ml-1 text-xs text-muted-foreground hover:text-destructive underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-6">
        {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen className="h-9 w-9 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No courses found</h3>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            {search
              ? `No results for "${search}". Try a different keyword.`
              : "No courses match this filter yet. Check back soon!"}
          </p>
          <button
            onClick={() => { setActiveLevel(""); setSearch(""); setInputValue("") }}
            className="text-sm text-primary underline underline-offset-2 font-medium"
          >
            Browse all courses
          </button>
        </div>
      ) : (
        <div className="space-y-16">
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
                {foundationCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    price={course.price}
                    teacher={course.teacher}
                    instructorName={course.instructorName}
                    lessonCount={course.lessonCount}
                    enrollmentCount={course.enrollmentCount}
                    subject={course.subject ?? undefined}
                  />
                ))}
              </div>
            </section>
          )}

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
                {diplomaCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    price={course.price}
                    teacher={course.teacher}
                    instructorName={course.instructorName}
                    lessonCount={course.lessonCount}
                    enrollmentCount={course.enrollmentCount}
                    subject={course.subject ?? undefined}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )
}
