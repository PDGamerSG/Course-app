"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { CheckCircle, Circle, Loader2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Props {
  lessonId: string
  courseId: string
  isCompleted: boolean
  nextLessonId?: string
}

export default function MarkCompleteButton({ lessonId, courseId, isCompleted, nextLessonId }: Props) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(isCompleted)
  const { toast } = useToast()
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    try {
      const newState = !completed
      await axios.post("/api/progress", { lessonId, completed: newState })
      setCompleted(newState)
      toast({
        title: newState ? "Lesson completed! 🎉" : "Marked as incomplete",
        description: newState && nextLessonId ? "Continue to the next lesson." : undefined,
      })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to update progress.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Button
        variant={completed ? "default" : "outline"}
        size="sm"
        onClick={toggle}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : completed ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
        {completed ? "Completed" : "Mark Complete"}
      </Button>

      {completed && nextLessonId && (
        <Button size="sm" asChild>
          <Link href={`/learn/${courseId}/${nextLessonId}`}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}
