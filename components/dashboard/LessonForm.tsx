"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  youtubeVideoId: z.string().min(5, "Please enter a valid YouTube Video ID"),
  duration: z.string().optional(),
  isFree: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface LessonData {
  id: string
  title: string
  youtubeVideoId: string
  duration: string | null
  order: number
  isFree: boolean
  moduleId: string
}

interface Props {
  courseId: string
  moduleId: string
  onSuccess: (lesson: LessonData) => void
  onCancel: () => void
  existingLesson?: LessonData
}

export default function LessonForm({ courseId, moduleId, onSuccess, onCancel, existingLesson }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: existingLesson?.title || "",
      youtubeVideoId: existingLesson?.youtubeVideoId || "",
      duration: existingLesson?.duration || "",
      isFree: existingLesson?.isFree || false,
    },
  })

  const isFree = watch("isFree")

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const payload = {
        title: data.title,
        youtubeVideoId: data.youtubeVideoId,
        duration: data.duration || undefined,
        isFree: data.isFree,
      }
      const res = await axios.post(
        `/api/courses/${courseId}/modules/${moduleId}/lessons`,
        payload
      )
      toast({ title: "Lesson saved!" })
      onSuccess(res.data)
    } catch {
      toast({ title: "Error", description: "Failed to save lesson.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3 bg-muted/20 rounded-lg border border-border/50">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Lesson Title *</Label>
          <Input
            placeholder="e.g. Variables and Data Types"
            {...register("title")}
            disabled={loading}
            className="h-8 text-sm"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">YouTube Video ID *</Label>
          <Input
            placeholder="dQw4w9WgXcQ"
            {...register("youtubeVideoId")}
            disabled={loading}
            className="h-8 text-sm font-mono"
          />
          {errors.youtubeVideoId && <p className="text-xs text-destructive">{errors.youtubeVideoId.message}</p>}
          <p className="text-xs text-muted-foreground">Just the ID, e.g. &quot;dQw4w9WgXcQ&quot;</p>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Duration (optional)</Label>
          <Input
            placeholder="12:34"
            {...register("duration")}
            disabled={loading}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isFree"
          checked={isFree}
          onCheckedChange={(val) => setValue("isFree", val)}
          disabled={loading}
        />
        <Label htmlFor="isFree" className="text-sm cursor-pointer">
          Free preview lesson
        </Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Save Lesson
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
