"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(0, "Price cannot be negative"),
  thumbnail: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type FormData = z.infer<typeof schema>

export default function NewCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { price: 0 },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        ...(data.thumbnail ? { thumbnail: data.thumbnail } : {}),
      }
      const res = await axios.post("/api/courses", payload)
      toast({ title: "Course created!", description: "Now add modules and lessons." })
      router.push(`/teacher/courses/${res.data.id}/edit`)
    } catch {
      toast({ title: "Error", description: "Failed to create course.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/teacher">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to courses
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-1">Fill in the basic details to get started</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Complete Python Bootcamp"
                {...register("title")}
                disabled={loading}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn..."
                rows={4}
                {...register("description")}
                disabled={loading}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0 for free"
                  {...register("price", { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                <p className="text-xs text-muted-foreground">Set to 0 for a free course</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  placeholder="https://..."
                  {...register("thumbnail")}
                  disabled={loading}
                />
                {errors.thumbnail && <p className="text-xs text-destructive">{errors.thumbnail.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Course & Add Content
              </Button>
              <Button variant="outline" asChild>
                <Link href="/teacher">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
