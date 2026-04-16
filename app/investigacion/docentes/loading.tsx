import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-9 w-56 mb-3" />
        <Skeleton className="h-5 w-full max-w-2xl mb-10" />

        <Skeleton className="h-10 w-full mb-6" />
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
