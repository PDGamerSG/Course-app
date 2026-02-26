"use client"

import { useState } from "react"
import axios from "axios"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Props {
  courseId: string
  teacherEmail: string
  teacherName: string
  courseTitle: string
}

export default function AdminCourseActions({ courseId, teacherEmail, teacherName, courseTitle }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState("")

  const handleApprove = async () => {
    setLoading("approve")
    try {
      await axios.post("/api/admin/approve", {
        courseId, action: "approve",
        teacherEmail, teacherName, courseTitle,
      })
      toast({ title: "Course approved!", description: "Teacher has been notified." })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to approve course.", variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    setLoading("reject")
    try {
      await axios.post("/api/admin/approve", {
        courseId, action: "reject", reason,
        teacherEmail, teacherName, courseTitle,
      })
      toast({ title: "Course rejected", description: "Teacher has been notified." })
      setRejectOpen(false)
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to reject course.", variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={!!loading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {loading === "approve" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3 mr-1" />
        )}
        Approve
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => setRejectOpen(true)}
        disabled={!!loading}
      >
        <XCircle className="h-3 w-3 mr-1" />
        Reject
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejecting <strong>&quot;{courseTitle}&quot;</strong>.
              This will be sent to the teacher.
            </p>
            <div className="space-y-1">
              <Label>Rejection reason (optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Video quality does not meet our standards..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading === "reject"}>
              {loading === "reject" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
