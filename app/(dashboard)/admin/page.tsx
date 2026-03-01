import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AdminCourseActions from "@/components/dashboard/AdminCourseActions"
import Image from "next/image"
import { BookOpen, GraduationCap, Plus, Pencil } from "lucide-react"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/student")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allCourses: any[] = []
  try {
    allCourses = await db.course.findMany({
        include: {
          teacher: { select: { id: true, name: true, email: true, image: true } },
          modules: { include: { lessons: { select: { id: true } } } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      })
  } catch {
    // DB not connected yet
  }

  const publishedCourses = allCourses.filter((c) => c.isPublished)
  const draftCourses = allCourses.filter((c) => !c.isPublished)
  const foundationCourses = allCourses.filter((c) => c.level === "FOUNDATION")
  const diplomaCourses = allCourses.filter((c) => c.level === "DIPLOMA")

  const CourseRow = ({ course, showLevel = false }: { course: typeof allCourses[0]; showLevel?: boolean }) => {
    const lessonCount = course.modules.reduce((sum: number, m: { lessons: { id: string }[] }) => sum + m.lessons.length, 0)
    return (
      <div className="border border-border/50 rounded-xl p-4 flex gap-4 hover:border-primary/30 transition-colors bg-card">
        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {course.thumbnail ? (
            <Image src={course.thumbnail} alt={course.title} fill sizes="80px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-sm">{course.title}</h3>
            <Badge variant={course.isPublished ? "default" : "outline"} className="text-[10px] h-4 px-1.5">
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
            {showLevel && (
              <Badge variant="secondary" className={`text-[10px] h-4 px-1.5 ${course.level === "DIPLOMA" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                {course.level === "DIPLOMA" ? "Diploma" : "Foundation"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{lessonCount} lessons</span>
            <span>{course._count.enrollments} students</span>
            <span className="font-semibold text-foreground">{course.price === 0 ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" asChild className="h-8 text-xs">
            <Link href={`/admin/courses/${course.id}/edit`}>
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Link>
          </Button>
          <AdminCourseActions
            courseId={course.id}
            isPublished={course.isPublished}
            teacherEmail={course.teacher.email}
            teacherName={course.teacher.name || "Teacher"}
            courseTitle={course.title}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage courses and users</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-border/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{publishedCourses.length}</div>
          <div className="text-sm text-muted-foreground">Published</div>
        </div>
        <div className="border border-border/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">{draftCourses.length}</div>
          <div className="text-sm text-muted-foreground">Drafts</div>
        </div>
        <div className="border border-border/50 rounded-lg p-4 flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-2xl font-bold text-blue-600">{foundationCourses.length}</div>
            <div className="text-sm text-muted-foreground">Foundation</div>
          </div>
        </div>
        <div className="border border-border/50 rounded-lg p-4 flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-indigo-500" />
          <div>
            <div className="text-2xl font-bold text-indigo-600">{diplomaCourses.length}</div>
            <div className="text-sm text-muted-foreground">Diploma</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="foundation">
        <TabsList className="mb-6">
          <TabsTrigger value="foundation" className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Foundation
            <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-xs">{foundationCourses.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="diploma" className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Diploma
            <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-xs">{diplomaCourses.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="all">
            All Courses
            <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-xs">{allCourses.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="foundation">
          {foundationCourses.length === 0 ? (
            <EmptyState label="No Foundation courses yet" href="/admin/courses/new" />
          ) : (
            <div className="space-y-3">
              {foundationCourses.map((course) => <CourseRow key={course.id} course={course} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="diploma">
          {diplomaCourses.length === 0 ? (
            <EmptyState label="No Diploma courses yet" href="/admin/courses/new" />
          ) : (
            <div className="space-y-3">
              {diplomaCourses.map((course) => <CourseRow key={course.id} course={course} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {allCourses.length === 0 ? (
            <EmptyState label="No courses yet" href="/admin/courses/new" />
          ) : (
            <div className="space-y-3">
              {allCourses.map((course) => <CourseRow key={course.id} course={course} showLevel />)}
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  )
}

function EmptyState({ label, href }: { label: string; href: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground border border-dashed border-border/50 rounded-xl">
      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p className="mb-4">{label}</p>
      <Button asChild size="sm">
        <Link href={href}><Plus className="mr-2 h-3.5 w-3.5" />Create Course</Link>
      </Button>
    </div>
  )
}
