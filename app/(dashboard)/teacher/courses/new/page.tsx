import { redirect } from "next/navigation"

export default function NewCourseRedirect() {
  redirect("/admin/courses/new")
}
