import { useState, type ImgHTMLAttributes } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton-shimmer ${className}`} />;
}

export function ImageWithSkeleton({
  className = "",
  onLoad,
  onError,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [ready, setReady] = useState(false);

  return (
    <>
      {!ready && <Skeleton className="absolute inset-0 h-full w-full" />}
      <img
        {...props}
        className={`${className} ${ready ? "" : "invisible"}`}
        onLoad={(event) => {
          setReady(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setReady(true);
          onError?.(event);
        }}
      />
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <article aria-label="Loading product" className="h-full bg-background">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-2.5 w-2/5 rounded-sm" />
        <Skeleton className="h-5 w-4/5 rounded-sm" />
        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function HomeSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="min-h-[85vh] bg-olive-deep text-ivory px-5 pb-16 pt-32 md:px-10 lg:pt-40">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <Skeleton className="h-7 w-48 rounded-full" />
            <Skeleton className="h-16 w-full max-w-xl rounded-xl" />
            <Skeleton className="h-16 w-4/5 max-w-lg rounded-xl" />
            <Skeleton className="h-4 w-full max-w-lg rounded-md" />
            <Skeleton className="h-4 w-3/4 max-w-md rounded-md" />
            <div className="flex gap-4 pt-3">
              <Skeleton className="h-13 w-40 rounded-full" />
              <Skeleton className="h-13 w-48 rounded-full" />
            </div>
          </div>
          <Skeleton className="aspect-[4/5] w-full max-w-lg rounded-2xl lg:col-span-6 lg:justify-self-center opacity-90" />
        </div>
      </section>
      <section className="mx-auto grid max-w-[1600px] grid-cols-2 gap-5 px-5 py-20 md:px-10 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </section>
    </main>
  );
}
