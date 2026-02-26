"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, ChevronDown, ChevronRight, PlayCircle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Lesson {
  id: string
  title: string
  duration: string | null
  isFree: boolean
  order: number
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface ProgressRecord {
  lessonId: string
  completed: boolean
}

interface LessonListProps {
  courseId: string
  modules: Module[]
  currentLessonId: string
  progress: ProgressRecord[]
  hasAccess: boolean
}

export default function LessonList({
  courseId,
  modules,
  currentLessonId,
  progress,
  hasAccess,
}: LessonListProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(
    new Set([modules.find((m) => m.lessons.some((l) => l.id === currentLessonId))?.id || modules[0]?.id])
  )

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedCount = progress.filter((p) => p.completed).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const toggleModule = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Course Progress</span>
          <span className="text-muted-foreground">{completedCount}/{totalLessons} lessons</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      {/* Lessons */}
      <div className="flex-1 overflow-y-auto">
        {modules.map((module) => {
          const isOpen = openModules.has(module.id)
          const moduleCompleted = module.lessons.every((l) => completedIds.has(l.id))
          return (
            <div key={module.id} className="border-b border-border/30">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {moduleCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{module.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{module.lessons.length}</span>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isOpen && (
                <ul className="bg-muted/20">
                  {module.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId
                    const isDone = completedIds.has(lesson.id)
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/learn/${courseId}/${lesson.id}`}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary border-r-2 border-primary"
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : isActive ? (
                            <PlayCircle className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="flex-1 line-clamp-2">{lesson.title}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {lesson.isFree && !hasAccess && (
                              <Badge variant="outline" className="text-xs py-0 text-green-500 border-green-500/30">
                                Free
                              </Badge>
                            )}
                            {lesson.duration && (
                              <span className="text-xs">{lesson.duration}</span>
                            )}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
