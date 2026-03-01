"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { CheckCircle, Circle, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import VideoPlayer from "@/components/shared/VideoPlayer"

interface Props {
  lessonId: string
  courseId: string
  isCompleted: boolean
  nextLessonId?: string
}

export default function LessonPlayer({ lessonId, courseId, isCompleted, nextLessonId }: Props) {
  const [completed, setCompleted] = useState(isCompleted)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const markComplete = useCallback(async (value: boolean) => {
    if (value === completed) return
    setLoading(true)
    try {
      await axios.post("/api/progress", { lessonId, completed: value })
      setCompleted(value)
      if (value) {
        toast({
          title: "Lesson completed! 🎉",
          description: nextLessonId ? "Continue to the next lesson." : "You've finished this lesson.",
        })
      }
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to update progress.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [completed, lessonId, nextLessonId, toast, router])

  // Called by VideoPlayer when video reaches 90% or ends
  const handleVideoProgress = useCallback(() => {
    markComplete(true)
  }, [markComplete])

  return (
    <>
      <VideoPlayer lessonId={lessonId} onProgress={handleVideoProgress} />

      <div className="flex items-center gap-2 flex-shrink-0">
        {completed && nextLessonId ? (
          // Video done + next lesson exists → show Next button with completed indicator
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle className="h-4 w-4" />
              Completed
            </span>
            <Button size="sm" asChild>
              <Link href={`/learn/${courseId}/${nextLessonId}`}>
                Next Lesson <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : completed ? (
          // Video done, no next lesson
          <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
            <CheckCircle className="h-4 w-4" />
            Lesson Completed
          </span>
        ) : (
          // Not completed yet
          <Button
            variant="outline"
            size="sm"
            onClick={() => markComplete(true)}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            Mark as Complete
          </Button>
        )}
      </div>
    </>
  )
}
