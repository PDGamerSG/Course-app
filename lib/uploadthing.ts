import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "./auth"

const f = createUploadthing()

export const ourFileRouter = {
  courseThumb: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
        throw new Error("Only teachers can upload thumbnails")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
