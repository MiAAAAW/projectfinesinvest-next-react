import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-4 w-60 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-10" />

        {/* Hero */}
        <div className="flex gap-6 mb-10">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-7 w-24 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
          </div>
        </div>

        {/* Sections */}
        {Array.from({ length: 4 }).map((_, s) => (
          <div key={s} className="mb-10">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-12 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
