"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Plus, Trash2, Send, Save, Loader2,
  BookOpen, Eye, ChevronDown, ChevronRight, Settings, GraduationCap, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import ModuleForm from "./ModuleForm"
import LessonForm from "./LessonForm"
import DraggableLessonList from "./DraggableLessonList"

/** Convert any Google Drive share/view URL to a direct-view image URL.
 *  Supports:
 *    https://drive.google.com/file/d/FILE_ID/view
 *    https://drive.google.com/open?id=FILE_ID
 *    https://drive.google.com/uc?id=FILE_ID   (already direct)
 *  Returns original string unchanged for non-Drive URLs.
 */
function normalizeThumbnailUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed

  // Match /file/d/FILE_ID/ pattern
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`

  // Match ?id=FILE_ID or &id=FILE_ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch && trimmed.includes("drive.google.com")) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`

  return trimmed
}

interface Lesson {
  id: string
  title: string
  youtubeVideoId: string
  duration: string | null
  notesUrl: string | null
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
  level: "FOUNDATION" | "DIPLOMA"
  subject: string | null
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

  // Course details state
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [price, setPrice] = useState(course.price)
  const [thumbnail, setThumbnail] = useState(course.thumbnail || "")
  const [level, setLevel] = useState<"FOUNDATION" | "DIPLOMA">(course.level)
  const [subject, setSubject] = useState(course.subject || "")
  const [savingDetails, setSavingDetails] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Curriculum state
  const [modules, setModules] = useState<Module[]>(course.modules)
  const [openModules, setOpenModules] = useState<Set<string>>(
    // Auto-open all modules so curriculum is ready to use
    new Set(course.modules.map((m) => m.id))
  )
  const [showAddModule, setShowAddModule] = useState(false)
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const moduleFormRef = useRef<HTMLDivElement>(null)

  const saveDetails = async () => {
    setSavingDetails(true)
    try {
      const normalizedThumbnail = normalizeThumbnailUrl(thumbnail)
      await axios.put(`/api/courses/${course.id}`, {
        title,
        description,
        price: Number(price),
        thumbnail: normalizedThumbnail || undefined,
        level,
        subject: subject || undefined,
      })
      if (normalizedThumbnail !== thumbnail) setThumbnail(normalizedThumbnail)
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
      toast({ title: "Course is now live!", description: "Students can now find and enroll in your course." })
      router.refresh()
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Failed to publish"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setPublishing(false)
    }
  }

  const deleteCourse = async () => {
    setDeleting(true)
    try {
      await axios.delete(`/api/courses/${course.id}`)
      toast({ title: "Course deleted" })
      router.push("/teacher")
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to delete course.", variant: "destructive" })
      setDeleting(false)
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
    <div className="flex flex-col h-full">
      {/* Sticky top bar */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{title || "Untitled Course"}</h1>
            <div className="flex items-center gap-2">
              {course.isPublished ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">Published</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Draft</Badge>
              )}
              <span className="text-xs text-muted-foreground">{totalLessons} lesson{totalLessons !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {course.isPublished && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/courses/${course.id}`} target="_blank">
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View Live
              </a>
            </Button>
          )}
          {!course.isPublished && (
            <Button size="sm" onClick={publishCourse} disabled={publishing || totalLessons === 0}>
              {publishing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
              Publish Course
            </Button>
          )}

          {/* Delete course */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete &quot;{title}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the course, all its modules, lessons, and student enrollments.
                  This action <strong>cannot be undone</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteCourse}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Yes, delete course
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="curriculum" className="flex-1 flex flex-col min-h-0">
        <div className="border-b border-border/50 px-6">
          <TabsList className="h-10 bg-transparent p-0 gap-0">
            <TabsTrigger
              value="curriculum"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-10 gap-1.5"
            >
              <GraduationCap className="h-4 w-4" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 h-10 gap-1.5"
            >
              <Settings className="h-4 w-4" />
              Course Details
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── CURRICULUM TAB ── */}
        <TabsContent value="curriculum" className="flex-1 overflow-y-auto m-0 p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-base">Course Curriculum</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add modules and lessons. Drag lessons to reorder.</p>
              </div>
              <Button size="sm" onClick={() => {
                setShowAddModule(true)
                setTimeout(() => moduleFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50)
              }}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Module
              </Button>
            </div>

            {modules.length === 0 && !showAddModule && (
              <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-xl">
                <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-sm mb-1">No modules yet</p>
                <p className="text-xs text-muted-foreground mb-4">Start building your course by adding a module</p>
                <Button size="sm" onClick={() => {
                  setShowAddModule(true)
                  setTimeout(() => moduleFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50)
                }}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add First Module
                </Button>
              </div>
            )}

            {modules.map((module, idx) => {
              const isOpen = openModules.has(module.id)
              return (
                <div key={module.id} className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
                  {/* Module header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border/40">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex items-center gap-2 flex-1 text-left min-w-0"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground w-5 flex-shrink-0">
                        M{idx + 1}
                      </span>
                      <span className="font-medium text-sm truncate">{module.title}</span>
                      <Badge variant="outline" className="ml-auto flex-shrink-0 text-xs py-0 h-5">
                        {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
                      </Badge>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteModule(module.id)}
                      className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Module lessons */}
                  {isOpen && (
                    <div className="p-4 space-y-3">
                      {module.lessons.length > 0 && (
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
                      )}

                      {addingLessonTo === module.id ? (
                        <LessonForm
                          courseId={course.id}
                          moduleId={module.id}
                          existingLesson={editingLesson?.moduleId === module.id ? editingLesson : undefined}
                          onSuccess={(lesson) => {
                            setModules((prev) =>
                              prev.map((m) =>
                                m.id === module.id
                                  ? {
                                      ...m,
                                      lessons: [...m.lessons.filter((l) => l.id !== lesson.id), lesson].sort(
                                        (a, b) => a.order - b.order
                                      ),
                                    }
                                  : m
                              )
                            )
                            setAddingLessonTo(null)
                            setEditingLesson(null)
                          }}
                          onCancel={() => {
                            setAddingLessonTo(null)
                            setEditingLesson(null)
                          }}
                        />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAddingLessonTo(module.id)
                            setEditingLesson(null)
                          }}
                          className="w-full border-dashed h-9 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
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
              <div ref={moduleFormRef}>
              <ModuleForm
                courseId={course.id}
                onSuccess={(module) => {
                  setModules((prev) => [...prev, module])
                  setShowAddModule(false)
                  setOpenModules((prev) => new Set(Array.from(prev).concat(module.id)))
                }}
                onCancel={() => setShowAddModule(false)}
              />
              </div>
            )}

            {/* Publish nudge when there's content */}
            {!course.isPublished && totalLessons > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Ready to go live?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your course has {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}. Publish it so students can find it.
                  </p>
                </div>
                <Button size="sm" onClick={publishCourse} disabled={publishing}>
                  {publishing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                  Publish
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── DETAILS TAB ── */}
        <TabsContent value="details" className="flex-1 overflow-y-auto m-0 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-semibold text-base">Course Details</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Edit the basic information about your course.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Course Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete Python Bootcamp"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe what students will learn..."
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Program Level</Label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as "FOUNDATION" | "DIPLOMA")}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="FOUNDATION">Foundation</option>
                    <option value="DIPLOMA">Diploma</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Subject / Course Code</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Mathematics I, ML Foundations"
                  />
                  <p className="text-xs text-muted-foreground">Shown on the course card</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Price (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="0 for free"
                  />
                  <p className="text-xs text-muted-foreground">Set to 0 for a free course</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Thumbnail</Label>
                  <Input
                    type="url"
                    placeholder="https://drive.google.com/file/d/... or any image URL"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a Google Drive share link or any direct image URL
                  </p>
                </div>
              </div>

              {/* Thumbnail preview */}
              {thumbnail && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Preview</Label>
                  <div className="rounded-lg overflow-hidden border border-border/50 aspect-video w-full max-w-xs bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeThumbnailUrl(thumbnail)}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">If blank, make sure the file is publicly shared in Drive.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2 border-t border-border/50">
              <Button onClick={saveDetails} disabled={savingDetails}>
                {savingDetails ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Details
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
