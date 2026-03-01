import { redirect } from "next/navigation"

export default function EditCourseRedirect({
  params,
}: {
  params: { courseId: string }
}) {
  redirect(`/admin/courses/${params.courseId}/edit`)
}