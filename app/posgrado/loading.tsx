import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Skeleton className="h-10 w-24 mb-8" />
      <Skeleton className="h-9 w-48 mb-3" />
      <Skeleton className="h-5 w-80 mb-8" />
      <div className="space-y-4 mb-12">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-10">
          <Skeleton className="h-8 w-48 mb-3" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
