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
