import Link from "next/link"
import Image from "next/image"
import { Users, BookOpen, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface CourseCardProps {
  id: string
  title: string
  description: string
  thumbnail: string | null
  price: number
  teacher: {
    name: string | null
    image: string | null
  }
  lessonCount: number
  enrollmentCount?: number
}

export default function CourseCard({
  id,
  title,
  description,
  thumbnail,
  price,
  teacher,
  lessonCount,
  enrollmentCount = 0,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`}>
      <Card className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 h-full">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {price === 0 && (
            <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-500 text-white">
              Free
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            by <span className="text-foreground font-medium">{teacher.name || "Anonymous"}</span>
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{lessonCount} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{enrollmentCount} students</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-foreground font-medium">4.8</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="font-bold text-lg">
              {price === 0 ? (
                <span className="text-green-500">Free</span>
              ) : (
                <span>₹{price.toLocaleString("en-IN")}</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">Lifetime access</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
