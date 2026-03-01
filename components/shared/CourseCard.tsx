import Link from "next/link"
import Image from "next/image"
import { Users, BookOpen, PlayCircle, Star } from "lucide-react"

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
  instructorName?: string | null
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
  instructorName,
  lessonCount,
  enrollmentCount = 0,
  subject,
  level,
}: CourseCardProps) {
  const displayName = instructorName || teacher.name || "Anonymous"
  const levelColor = level === "FOUNDATION"
    ? "from-blue-600 to-blue-500"
    : level === "DIPLOMA"
    ? "from-indigo-600 to-violet-500"
    : "from-primary to-primary"

  return (
    <Link href={`/courses/${id}`} className="group block h-full">
      <div className="rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/8 transition-all duration-300 h-full flex flex-col">

        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${levelColor} opacity-80 gap-2`}>
              <BookOpen className="h-10 w-10 text-white/80" />
              <span className="text-xs text-white/70 font-medium">LearnHub</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white rounded-full p-3.5 shadow-xl scale-90 group-hover:scale-100 transition-transform duration-300">
              <PlayCircle className="h-6 w-6 text-blue-600 fill-blue-600" />
            </div>
          </div>

          {/* Price badge */}
          <div className="absolute top-3 left-3">
            {price === 0 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-lg">
                FREE
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-sm text-white text-xs font-bold shadow-lg">
                ₹{price.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Level badge */}
          {level && (
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r ${levelColor} text-white text-[10px] font-bold shadow-lg uppercase tracking-wide`}>
                {level === "FOUNDATION" ? "Foundation" : "Diploma"}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1 gap-2.5">
          {subject && (
            <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">{subject}</span>
          )}

          <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">{description}</p>
          )}

          {/* Rating row (static placeholder) */}
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-3 w-3 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-amber-600">4.0</span>
            <span className="text-[11px] text-muted-foreground">({enrollmentCount.toLocaleString()})</span>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-2 pt-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {displayName[0].toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              <span className="text-foreground font-semibold">{displayName}</span>
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-border/40">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <PlayCircle className="h-3.5 w-3.5" />
              {lessonCount} lessons
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {enrollmentCount.toLocaleString()} students
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
