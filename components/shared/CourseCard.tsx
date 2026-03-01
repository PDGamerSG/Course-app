import Link from "next/link"
import Image from "next/image"
import { Users, BookOpen, PlayCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CourseCardProps {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  price: number
  teacher: {
    name: string | null
    image: string | null
  }
  lessonCount: number
  enrollmentCount?: number
  subject?: string
  level?: "FOUNDATION" | "DIPLOMA"
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
  subject,
  level,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`} className="group block">
      <div className="rounded-xl overflow-hidden border border-border/60 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col">

        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-muted gap-2">
              <BookOpen className="h-10 w-10 text-primary/50" />
              <span className="text-xs text-muted-foreground font-medium">LearnHub</span>
            </div>
          )}

          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <PlayCircle className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            {price === 0 ? (
              <Badge className="bg-green-500 hover:bg-green-500 text-white text-[11px] font-semibold shadow">
                Free
              </Badge>
            ) : (
              <Badge className="bg-black/70 hover:bg-black/70 text-white text-[11px] font-semibold backdrop-blur-sm shadow">
                &#8377;{price.toLocaleString("en-IN")}
              </Badge>
            )}
          </div>

          {/* Level badge top-right */}
          {level && (
            <div className="absolute top-2.5 right-2.5">
              <Badge className={`text-[10px] font-semibold shadow ${
                level === "FOUNDATION"
                  ? "bg-blue-600/80 hover:bg-blue-600/80 text-white"
                  : "bg-indigo-600/80 hover:bg-indigo-600/80 text-white"
              }`}>
                {level === "FOUNDATION" ? "Foundation" : "Diploma"}
              </Badge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div className="flex-1">
            {subject && (
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">{subject}</p>
            )}
            <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Teacher */}
          <div className="flex items-center gap-2">
            {teacher.image ? (
              <Image
                src={teacher.image}
                alt={teacher.name ?? "Teacher"}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                {(teacher.name ?? "T")[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{teacher.name || "Anonymous"}</span>
            </span>
          </div>

          {/* Footer stats */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
            <span className="flex items-center gap-1">
              <PlayCircle className="h-3 w-3" />
              {lessonCount} lessons
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {enrollmentCount.toLocaleString()} students
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
