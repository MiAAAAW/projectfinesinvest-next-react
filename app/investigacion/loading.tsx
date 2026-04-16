import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Skeleton className="h-10 w-24 mb-8" />
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-96 mb-8" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
