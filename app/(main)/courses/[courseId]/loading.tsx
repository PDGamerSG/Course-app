import { Skeleton } from "@/components/ui/skeleton"

export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-muted/50 border-b border-border/40 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-11 w-full" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        <Skeleton className="h-7 w-48 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-3 rounded-lg border border-border/50 p-4">
            <Skeleton className="h-5 w-48" />
          </div>
        ))}
      </div>
    </div>
  )
}
