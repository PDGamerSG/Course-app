"use client"

import { useState } from "react"
import axios from "axios"
import { EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Props {
  courseId: string
  teacherEmail: string
  teacherName: string
  courseTitle: string
}

export default function AdminCourseActions({ courseId }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUnpublish = async () => {
    if (!confirm("Unpublish this course? It will be hidden from students.")) return
    setLoading(true)
    try {
      await axios.put(`/api/courses/${courseId}`, { isPublished: false, isApproved: false })
      toast({ title: "Course unpublished", description: "The course is now hidden from students." })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to unpublish course.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="destructive"
        onClick={handleUnpublish}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <EyeOff className="h-3 w-3 mr-1" />
        )}
        Unpublish
      </Button>
    </div>
  )
}
