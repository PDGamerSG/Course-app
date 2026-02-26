import { Search } from "lucide-react"
import CourseCard from "@/components/shared/CourseCard"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"

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
        isApproved: true,
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

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const courses = await getCourses(searchParams.filter, searchParams.search)

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Courses</h1>
        <p className="text-muted-foreground">
          {courses.length} course{courses.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a href="/courses">
          <Badge
            variant={!searchParams.filter ? "default" : "outline"}
            className="cursor-pointer px-4 py-1.5 text-sm"
          >
            All
          </Badge>
        </a>
        <a href="/courses?filter=free">
          <Badge
            variant={searchParams.filter === "free" ? "default" : "outline"}
            className="cursor-pointer px-4 py-1.5 text-sm"
          >
            Free
          </Badge>
        </a>
        <a href="/courses?filter=paid">
          <Badge
            variant={searchParams.filter === "paid" ? "default" : "outline"}
            className="cursor-pointer px-4 py-1.5 text-sm"
          >
            Paid
          </Badge>
        </a>
      </div>

      {/* Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
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
  )
}
