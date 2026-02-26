"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Lesson {
  id: string
  title: string
  duration: string | null
  isFree: boolean
  order: number
  moduleId: string
}

function SortableLesson({
  lesson,
  onEdit,
  onDelete,
}: {
  lesson: Lesson
  onEdit: (lesson: Lesson) => void
  onDelete: (lessonId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-background border border-border/50 rounded-lg group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block">{lesson.title}</span>
        {lesson.duration && (
          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {lesson.isFree ? (
          <Badge variant="outline" className="text-xs text-green-500 border-green-500/30 py-0">
            <Eye className="h-2.5 w-2.5 mr-1" />
            Free
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs py-0">
            <EyeOff className="h-2.5 w-2.5 mr-1" />
            Paid
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(lesson)}
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(lesson.id)}
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface Props {
  lessons: Lesson[]
  moduleId: string
  courseId: string
  onUpdate: (lessons: Lesson[]) => void
  onEdit: (lesson: Lesson) => void
  onDelete: (lessonId: string) => void
}

export default function DraggableLessonList({
  lessons,
  moduleId,
  courseId,
  onUpdate,
  onEdit,
  onDelete,
}: Props) {
  const { toast } = useToast()
  const [items, setItems] = useState(lessons)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((l) => l.id === active.id)
    const newIndex = items.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }))

    setItems(reordered)
    onUpdate(reordered)

    try {
      await axios.put(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
        lessons: reordered.map((l) => ({ id: l.id, order: l.order })),
      })
    } catch {
      toast({ title: "Error", description: "Failed to save lesson order.", variant: "destructive" })
      setItems(lessons) // revert
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-3">
        No lessons yet. Add your first lesson below.
      </p>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((lesson) => (
            <SortableLesson key={lesson.id} lesson={lesson} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
