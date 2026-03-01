export type Role = "STUDENT" | "TEACHER" | "ADMIN"

// Razorpay global window type (shared across payment components)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

export interface CourseWithTeacher {
  id: string
  title: string
  description: string
  thumbnail: string | null
  price: number
  isPublished: boolean
  isApproved: boolean
  teacherId: string
  teacher: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  modules: ModuleWithLessons[]
  _count?: {
    enrollments: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface ModuleWithLessons {
  id: string
  title: string
  order: number
  courseId: string
  lessons: LessonBasic[]
}

export interface LessonBasic {
  id: string
  title: string
  duration: string | null
  order: number
  isFree: boolean
  moduleId: string
}

export interface LessonFull extends LessonBasic {
  youtubeVideoId: string
}

export interface ProgressRecord {
  id: string
  userId: string
  lessonId: string
  completed: boolean
  watchedAt: Date
}

export interface CourseProgress {
  courseId: string
  totalLessons: number
  completedLessons: number
  percentage: number
  nextLessonId: string | null
}

// ── Query result types (avoids Prisma namespace imports) ──────────────────────

export interface CourseListing {
  id: string
  title: string
  description: string
  thumbnail: string | null
  price: number
  level: string
  subject: string | null
  instructorName: string | null
  isPublished: boolean
  isApproved: boolean
  createdAt: Date
  teacher: { id: string; name: string | null; image: string | null }
  modules: { id: string; title: string; order: number; lessons: { id: string }[] }[]
  _count: { enrollments: number }
}

export interface AdminCourseListing extends CourseListing {
  teacher: { id: string; name: string | null; email: string | null; image: string | null }
}

export interface EnrollmentWithCourse {
  id: string
  userId: string
  courseId: string
  createdAt: Date
  course: {
    id: string
    title: string
    thumbnail: string | null
    teacher: { name: string | null }
    modules: { id: string; lessons: { id: string }[] }[]
  }
}
