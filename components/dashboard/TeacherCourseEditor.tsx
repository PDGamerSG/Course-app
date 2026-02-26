"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  ChevronDown, ChevronRight, Plus, Trash2,
  Send, Save, Loader2, BookOpen, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import ModuleForm from "./ModuleForm"
import LessonForm from "./LessonForm"
import DraggableLessonList from "./DraggableLessonList"

interface Lesson {
  id: string
  title: string
  youtubeVideoId: string
  duration: string | null
  order: number
  isFree: boolean
  moduleId: string
}

interface Module {
  id: string
  title: string
  order: number
  courseId: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string | null
  price: number
  isPublished: boolean
  isApproved: boolean
  modules: Module[]
}

interface Props {
  course: Course
}

export default function TeacherCourseEditor({ course }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // Course state
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [price, setPrice] = useState(course.price)
  const [thumbnail, setThumbnail] = useState(course.thumbnail || "")
  const [savingDetails, setSavingDetails] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Modules state
  const [modules, setModules] = useState<Module[]>(course.modules)
  const [openModules, setOpenModules] = useState<Set<string>>(new Set())
  const [showAddModule, setShowAddModule] = useState(false)
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  const saveDetails = async () => {
    setSavingDetails(true)
    try {
      await axios.put(`/api/courses/${course.id}`, {
        title, description, price: Number(price), thumbnail: thumbnail || undefined,
      })
      toast({ title: "Details saved!" })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" })
    } finally {
      setSavingDetails(false)
    }
  }

  const publishCourse = async () => {
    setPublishing(true)
    try {
      await axios.put(`/api/courses/${course.id}`, { isPublished: true })
      toast({ title: "Course submitted for review!", description: "You will be notified once approved." })
      router.refresh()
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to publish"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setPublishing(false)
    }
  }

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and all its lessons?")) return
    try {
      await axios.delete(`/api/courses/${course.id}/modules?moduleId=${moduleId}`)
      setModules((prev) => prev.filter((m) => m.id !== moduleId))
      toast({ title: "Module deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete module.", variant: "destructive" })
    }
  }

  const deleteLesson = async (lessonId: string, moduleId: string) => {
    if (!confirm("Delete this lesson?")) return
    try {
      await axios.delete(`/api/courses/${course.id}/modules/${moduleId}/lessons?lessonId=${lessonId}`)
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
        )
      )
      toast({ title: "Lesson deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete lesson.", variant: "destructive" })
    }
  }

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Course</h1>
          <div className="flex items-center gap-2 mt-1">
            {course.isApproved ? (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Live</Badge>
            ) : course.isPublished ? (
              <Badge variant="secondary">Under Review</Badge>
            ) : (
              <Badge variant="outline">Draft</Badge>
            )}
            <span className="text-sm text-muted-foreground">{totalLessons} lessons</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!course.isPublished && (
            <Button onClick={publishCourse} disabled={publishing || totalLessons === 0}>
              {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit for Review
            </Button>
          )}
          {course.isApproved && (
            <Button variant="outline" asChild>
              <a href={`/courses/${course.id}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                View Live
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Course Details */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label className="text-sm">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-sm">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Price (₹)</Label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Thumbnail URL</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>
          </div>
          <Button size="sm" onClick={saveDetails} disabled={savingDetails}>
            {savingDetails ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
            Save Details
          </Button>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Curriculum</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowAddModule(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {modules.length === 0 && !showAddModule && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No modules yet. Add your first module.
            </div>
          )}

            {modules.map((module) => {
            const isOpen = openModules.has(module.id)
            return (
              <div key={module.id} className="border border-border/50 rounded-lg overflow-hidden">
                {/* Module header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <button onClick={() => toggleModule(module.id)} className="flex items-center gap-2 flex-1 text-left">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="font-medium text-sm">{module.title}</span>
                    <Badge variant="outline" className="ml-1 text-xs py-0">
                      {module.lessons.length}
                    </Badge>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteModule(module.id)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive opacity-50 hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Module content */}
                {isOpen && (
                  <div className="p-3 space-y-2">
                    <DraggableLessonList
                      lessons={module.lessons}
                      moduleId={module.id}
                      courseId={course.id}
                      onUpdate={(updated) =>
                        setModules((prev) =>
                          prev.map((m) => (m.id === module.id ? { ...m, lessons: updated as Lesson[] } : m))
                        )
                      }
                      onEdit={(lesson) => {
                        setEditingLesson(lesson as Lesson)
                        setAddingLessonTo(module.id)
                      }}
                      onDelete={(lessonId) => deleteLesson(lessonId, module.id)}
                    />

                    {addingLessonTo === module.id ? (
                      <LessonForm
                        courseId={course.id}
                        moduleId={module.id}
                        existingLesson={editingLesson?.moduleId === module.id ? editingLesson : undefined}
                        onSuccess={(lesson) => {
                          setModules((prev) =>
                            prev.map((m) =>
                              m.id === module.id
                                ? { ...m, lessons: [...m.lessons.filter((l) => l.id !== lesson.id), lesson].sort((a, b) => a.order - b.order) }
                                : m
                            )
                          )
                          setAddingLessonTo(null)
                          setEditingLesson(null)
                        }}
                        onCancel={() => { setAddingLessonTo(null); setEditingLesson(null) }}
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setAddingLessonTo(module.id); setEditingLesson(null) }}
                        className="w-full border border-dashed border-border/50 h-8 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Lesson
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Add module form */}
          {showAddModule && (
            <ModuleForm
              courseId={course.id}
              onSuccess={(module) => {
                setModules((prev) => [...prev, module])
                setShowAddModule(false)
                setOpenModules((prev) => new Set(Array.from(prev).concat(module.id)))
              }}
              onCancel={() => setShowAddModule(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
