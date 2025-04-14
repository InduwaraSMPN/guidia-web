import React, { useState, useEffect } from "react"
import { NotFound, Illustration } from "@/components/ui/not-found"
import { Skeleton } from "@/components/ui/skeleton"

export function NotFoundPage() {
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="relative flex flex-col w-full justify-center min-h-svh bg-background p-6 md:p-10">
        <div className="relative max-w-5xl mx-auto w-full flex flex-col items-center justify-center">
          <Skeleton className="h-40 w-40 rounded-full mb-8" />
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full justify-center min-h-svh bg-background p-6 md:p-10">
      <div className="relative max-w-5xl mx-auto w-full">
        <Illustration className="absolute inset-0 w-full h-[50vh] opacity-[0.04] dark:opacity-[0.03] text-foreground" />
        <NotFound
          title="Page not found"
          description="Lost, this page is. In another system, it may be."
        />
      </div>
    </div>
  )
}
