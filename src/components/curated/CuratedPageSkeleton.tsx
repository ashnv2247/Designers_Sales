import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Skeleton, ProductCardSkeleton } from "@/components/Skeleton";

export function CuratedPageSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-grow pt-16 md:pt-20">
        {/* Hero Skeleton */}
        <div className="relative min-h-[60vh] bg-cream/40 flex items-center justify-center p-8">
          <div className="w-full max-w-3xl space-y-4 text-center">
            <Skeleton className="h-4 w-32 mx-auto rounded-full" />
            <Skeleton className="h-14 md:h-20 w-4/5 mx-auto rounded-lg" />
            <Skeleton className="h-6 w-3/5 mx-auto rounded-md" />
          </div>
        </div>

        {/* Section Skeleton */}
        <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 space-y-12">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-4 w-96 rounded-sm" />
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
