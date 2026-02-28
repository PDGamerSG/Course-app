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

/** Extract YouTube video ID from a full URL or return the raw ID as-is */
function extractYouTubeId(input: string): string {
  const trimmed = input.trim()
  // Full watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([A-Za-z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]
  // Short URL: https://youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]
  // Embed URL: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/\/embed\/([A-Za-z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]
  // Assume it's already a raw ID
  return trimmed
}

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  youtubeInput: z.string().min(5, "Please enter a valid YouTube URL or Video ID"),
  duration: z.string().optional(),
  notesUrl: z.string().optional(),
  isFree: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface LessonData {
  id: string
  title: string
  youtubeVideoId: string
  duration: string | null
  notesUrl: string | null
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
      youtubeInput: existingLesson?.youtubeVideoId || "",
      duration: existingLesson?.duration || "",
      notesUrl: existingLesson?.notesUrl || "",
      isFree: existingLesson?.isFree || false,
    },
  })

  const isFree = watch("isFree")

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const youtubeVideoId = extractYouTubeId(data.youtubeInput)
      const payload = {
        title: data.title,
        youtubeVideoId,
        duration: data.duration || undefined,
        notesUrl: data.notesUrl || undefined,
        isFree: data.isFree,
      }

      let res
      if (existingLesson) {
        // Edit mode – PUT with lessonId in body
        res = await axios.put(
          `/api/courses/${courseId}/modules/${moduleId}/lessons`,
          { ...payload, lessonId: existingLesson.id }
        )
        toast({ title: "Lesson updated!" })
        onSuccess(res.data.lesson)
      } else {
        // Create mode – POST
        res = await axios.post(
          `/api/courses/${courseId}/modules/${moduleId}/lessons`,
          payload
        )
        toast({ title: "Lesson saved!" })
        onSuccess(res.data.lesson)
      }
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

        <div className="col-span-2 space-y-1">
          <Label className="text-xs">YouTube URL or Video ID *</Label>
          <Input
            placeholder="https://youtu.be/dQw4w9WgXcQ  or  dQw4w9WgXcQ"
            {...register("youtubeInput")}
            disabled={loading}
            className="h-8 text-sm"
          />
          {errors.youtubeInput && <p className="text-xs text-destructive">{errors.youtubeInput.message}</p>}
          <p className="text-xs text-muted-foreground">Paste the full YouTube link or just the video ID</p>
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

        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Notes / Resources Link (optional)</Label>
          <Input
            placeholder="https://drive.google.com/file/d/..."
            {...register("notesUrl")}
            disabled={loading}
            className="h-8 text-sm"
          />
          <p className="text-xs text-muted-foreground">Paste a Google Drive or any public link — students will see a Download Notes button</p>
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
          {existingLesson ? "Update Lesson" : "Save Lesson"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
