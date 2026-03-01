"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
})

interface Props {
  courseId: string
  onSuccess: (module: { id: string; title: string; order: number; courseId: string; lessons: never[] }) => void
  onCancel: () => void
}

export default function ModuleForm({ courseId, onSuccess, onCancel }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ title: string }>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: { title: string }) => {
    setLoading(true)
    try {
      const res = await axios.post(`/api/courses/${courseId}/modules`, { title: data.title })
      toast({ title: "Module added!" })
      reset()
      onSuccess({ ...res.data, lessons: [] })
    } catch {
      toast({ title: "Error", description: "Failed to add module.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2 p-3 bg-muted/30 rounded-lg">
      <div className="flex-1 space-y-1">
        <Label htmlFor="moduleTitle" className="text-xs">Module Title</Label>
        <Input
          id="moduleTitle"
          placeholder="e.g. Introduction to Python"
          {...register("title")}
          disabled={loading}
          className="h-8 text-sm"
          autoFocus
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
        Add
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  )
}
