"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface Props {
  courseId: string
  courseTitle: string
}

export default function DeleteCourseButton({ courseId, courseTitle }: Props) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await axios.delete(`/api/courses/${courseId}`)
      toast({ title: "Course deleted successfully" })
      router.push("/admin")
      router.refresh()
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : undefined
      toast({ title: "Error", description: msg || "Failed to delete course.", variant: "destructive" })
      setDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete course?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong>&quot;{courseTitle}&quot;</strong> and all its modules, lessons and enrollments will be permanently deleted.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
