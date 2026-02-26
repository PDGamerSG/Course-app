"use client"

import { useState } from "react"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Props {
  userId: string
  currentRole: string
}

export default function AdminUserActions({ userId, currentRole }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return
    setLoading(true)
    try {
      await axios.put("/api/admin/approve", { userId, role: newRole })
      toast({ title: "Role updated", description: `User role changed to ${newRole}.` })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to update role.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      <Select value={currentRole} onValueChange={handleRoleChange} disabled={loading}>
        <SelectTrigger className="h-7 text-xs w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="STUDENT">STUDENT</SelectItem>
          <SelectItem value="TEACHER">TEACHER</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
