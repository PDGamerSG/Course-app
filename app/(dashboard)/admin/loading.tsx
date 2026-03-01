import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Skeleton className="h-9 w-52 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border/50 rounded-xl p-4">
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      {/* Tabs placeholder */}
      <Skeleton className="h-10 w-80 mb-6 rounded-xl" />
      {/* Course rows */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-border/50 rounded-xl p-4 flex gap-4">
            <Skeleton className="w-20 h-14 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="w-20 h-8 rounded-lg flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
