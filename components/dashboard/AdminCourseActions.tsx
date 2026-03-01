"use client"

import { useState } from "react"
import axios from "axios"
import { EyeOff, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Props {
  courseId: string
  isPublished: boolean
  teacherEmail: string
  teacherName: string
  courseTitle: string
}

export default function AdminCourseActions({ courseId, isPublished: initialPublished }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isPublished, setIsPublished] = useState(initialPublished)

  const handleToggle = async () => {
    const next = !isPublished
    const msg = next
      ? "Publish this course? Students will be able to see it."
      : "Unpublish this course? It will be hidden from students."
    if (!confirm(msg)) return
    setLoading(true)
    try {
      await axios.put(`/api/courses/${courseId}`, { isPublished: next, ...(next ? {} : { isApproved: false }) })
      setIsPublished(next)
      toast({
        title: next ? "Course published" : "Course unpublished",
        description: next ? "Students can now find and enroll." : "The course is now hidden from students.",
      })
      router.refresh()
    } catch {
      toast({ title: "Error", description: `Failed to ${next ? "publish" : "unpublish"} course.`, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={isPublished ? "destructive" : "default"}
        onClick={handleToggle}
        disabled={loading}
        className={isPublished ? "" : "bg-green-600 hover:bg-green-700 text-white border-0"}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : isPublished ? (
          <EyeOff className="h-3 w-3 mr-1" />
        ) : (
          <Eye className="h-3 w-3 mr-1" />
        )}
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
    </div>
  )
}
