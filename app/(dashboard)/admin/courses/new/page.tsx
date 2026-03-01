"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { ArrowLeft, Loader2, BookOpen, GraduationCap, ImageIcon, DollarSign, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

const FOUNDATION_SUBJECTS = [
  "Mathematics I", "Mathematics II",
  "Statistics I", "Statistics II",
  "English I", "English II",
  "Computational Thinking",
  "Physics I",
]

const DIPLOMA_SUBJECTS = [
  "Programming in Python",
  "Data Structures & Algorithms",
  "Database Management Systems",
  "Machine Learning Foundations",
  "Business Data Management",
  "Business Analytics",
  "Deep Learning",
  "MLOps",
  "Computer Vision",
  "Natural Language Processing",
  "Software Engineering",
  "AI: Search Methods",
]

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.enum(["FOUNDATION", "DIPLOMA"]),
  subject: z.string().min(1, "Subject is required"),
  instructorName: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  thumbnail: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type FormData = z.infer<typeof schema>

export default function NewCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<"FOUNDATION" | "DIPLOMA">("FOUNDATION")
  const [isCustomSubject, setIsCustomSubject] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { price: 0, level: "FOUNDATION", subject: "" },
  })

  const subjects = selectedLevel === "FOUNDATION" ? FOUNDATION_SUBJECTS : DIPLOMA_SUBJECTS

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        level: data.level,
        subject: data.subject,
        instructorName: data.instructorName || undefined,
        ...(data.thumbnail ? { thumbnail: data.thumbnail } : {}),
      }
      const res = await axios.post("/api/courses", payload)
      toast({ title: "Course created!", description: "Now add modules and lessons." })
      router.push(`/admin/courses/${res.data.course.id}/edit`)
    } catch {
      toast({ title: "Error", description: "Failed to create course.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-1">Fill in the details below to set up your course</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Program Level */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Program Level</CardTitle>
            <CardDescription>Choose the program this course belongs to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(["FOUNDATION", "DIPLOMA"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(lvl)
                    setValue("level", lvl)
                    setValue("subject", "")
                    setIsCustomSubject(false)
                  }}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                    selectedLevel === lvl
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {lvl === "FOUNDATION"
                    ? <BookOpen className="h-5 w-5 text-blue-500 shrink-0" />
                    : <GraduationCap className="h-5 w-5 text-indigo-500 shrink-0" />
                  }
                  <div>
                    <div className="font-medium text-sm">{lvl === "FOUNDATION" ? "Foundation" : "Diploma"}</div>
                    <div className="text-xs text-muted-foreground">
                      {lvl === "FOUNDATION" ? "Level 1–2 core courses" : "Level 3–5 specialization"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Details */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Course Details</CardTitle>
            <CardDescription>Basic information about the course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
              <Select
                disabled={loading}
                onValueChange={(val) => {
                  if (val === "__custom__") {
                    setIsCustomSubject(true)
                    setValue("subject", "")
                  } else {
                    setIsCustomSubject(false)
                    setValue("subject", val)
                  }
                }}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject…" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                  <SelectItem value="__custom__">Other (type below)</SelectItem>
                </SelectContent>
              </Select>
              {isCustomSubject && (
                <Input
                  placeholder="Enter subject name…"
                  autoFocus
                  onChange={(e) => setValue("subject", e.target.value)}
                  disabled={loading}
                />
              )}
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>

            <Separator />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Course Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Mathematics I — Foundations of Calculus"
                {...register("title")}
                disabled={loading}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn…"
                rows={4}
                {...register("description")}
                disabled={loading}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Instructor & Pricing */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Instructor &amp; Pricing</CardTitle>
            <CardDescription>Optional details shown on the course listing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Instructor */}
            <div className="space-y-2">
              <Label htmlFor="instructorName" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Instructor Name
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="instructorName"
                placeholder="e.g. Prof. Andrew Ng, Dr. Anand Rajaraman"
                {...register("instructorName")}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Shown as the professor&apos;s name on the course card</p>
            </div>

            <Separator />

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                Price (₹)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className="max-w-[180px]"
                {...register("price", { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              <p className="text-xs text-muted-foreground">Set to 0 to make the course free</p>
            </div>

            <Separator />

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail" className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Thumbnail URL
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="thumbnail"
                type="url"
                placeholder="https://drive.google.com/file/d/…"
                {...register("thumbnail")}
                disabled={loading}
              />
              {errors.thumbnail && <p className="text-xs text-destructive">{errors.thumbnail.message}</p>}
              <p className="text-xs text-muted-foreground">Paste a direct image URL for the course cover</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Button type="submit" disabled={loading} size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Course &amp; Add Content
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/admin">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
