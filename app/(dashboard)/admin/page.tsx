import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import AdminCourseActions from "@/components/dashboard/AdminCourseActions"
import AdminUserActions from "@/components/dashboard/AdminUserActions"
import Image from "next/image"
import { BookOpen } from "lucide-react"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/student")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pendingCourses: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allUsers: any[] = []
  try {
    [pendingCourses, allUsers] = await Promise.all([
      db.course.findMany({
        where: { isPublished: true, isApproved: false },
        include: {
          teacher: { select: { id: true, name: true, email: true, image: true } },
          modules: { include: { lessons: { select: { id: true } } } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, image: true, role: true, createdAt: true,
          _count: { select: { enrollments: true } },
        },
      }),
    ])
  } catch {
    // DB not connected yet
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage courses and users</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{pendingCourses.length}</div>
          <div className="text-sm text-muted-foreground">Pending Approval</div>
        </div>
        <div className="border border-border/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{allUsers.length}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>
        <div className="border border-border/50 rounded-lg p-4">
          <div className="text-2xl font-bold">{allUsers.filter((u) => u.role === "TEACHER").length}</div>
          <div className="text-sm text-muted-foreground">Teachers</div>
        </div>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="mb-6">
          <TabsTrigger value="courses">
            Pending Courses
            {pendingCourses.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {pendingCourses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          {pendingCourses.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border/50 rounded-xl">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No courses pending approval</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCourses.map((course) => {
                const lessonCount = course.modules.reduce((sum: number, m: { lessons: { id: string }[] }) => sum + m.lessons.length, 0)
                return (
                  <div key={course.id} className="border border-border/50 rounded-lg p-4 flex gap-4">
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {course.thumbnail ? (
                        <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{course.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>by {course.teacher.name}</span>
                        <span>{lessonCount} lessons</span>
                        <span className="font-medium text-foreground">
                          {course.price === 0 ? "Free" : `₹${course.price}`}
                        </span>
                      </div>
                    </div>
                    <AdminCourseActions
                      courseId={course.id}
                      teacherEmail={course.teacher.email}
                      teacherName={course.teacher.name || "Teacher"}
                      courseTitle={course.title}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border/50 bg-muted/30">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Courses</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.image ? (
                            <Image src={user.image} alt={user.name || ""} width={32} height={32} />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium">{user.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="p-3">
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : user.role === "TEACHER" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{user._count.enrollments}</td>
                    <td className="p-3">
                      <AdminUserActions userId={user.id} currentRole={user.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
