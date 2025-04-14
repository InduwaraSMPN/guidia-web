import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { AnimatedGridPattern } from '../components/ui/animated-grid-pattern';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function HomePage() {
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
      <div className="relative min-h-screen overflow-hidden bg-background">
        <AnimatedGridPattern
          numSquares={40}
          maxOpacity={0.15}
          duration={4}
          repeatDelay={0.8}
          className="absolute top-0 left-0 w-full h-full [mask-image:linear-gradient(to_bottom,transparent,white_15%,white_85%,transparent)]"
        />
        <div className="relative z-10 mx-auto max-w-[1440px]">
          {/* Hero Section Skeleton */}
          <div className="px-4 pt-32 pb-16 sm:px-6 lg:px-8 lg:pt-40 lg:pb-24">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
                <div className="flex flex-col justify-center space-y-8">
                  <div>
                    <Skeleton className="h-12 w-3/4 mb-4" />
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-12 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-full max-w-md" />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="h-12 w-40 rounded-md" />
                    <Skeleton className="h-12 w-40 rounded-md" />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Skeleton className="h-80 w-full max-w-md rounded-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section Skeleton */}
          <div className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <Skeleton className="h-10 w-64 mx-auto mb-4" />
                <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-secondary p-6 rounded-xl border border-border">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-48 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-8 md:grid-cols-4">
                <div>
                  <Skeleton className="h-8 w-32 mb-4" />
                  <Skeleton className="h-4 w-full max-w-xs mb-2" />
                  <Skeleton className="h-4 w-3/4 max-w-xs" />
                </div>
                {[...Array(3)].map((_, index) => (
                  <div key={index}>
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-32" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-border pt-8">
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.15}
        duration={4}
        repeatDelay={0.8}
        className="absolute top-0 left-0 w-full h-full [mask-image:linear-gradient(to_bottom,transparent,white_15%,white_85%,transparent)]"
      />
      <div className="relative z-10 mx-auto max-w-[1440px]">
        <Hero />
        <Features />
        <Footer />
      </div>
    </div>
  )
}