import { MeetingAvailabilitySettings } from '@/components/meetings/MeetingAvailabilitySettings';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function MeetingAvailability() {
  const navigate = useNavigate();
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
      <main className="container pt-32 mx-auto px-4 py-8 max-w-[1216px]">
        {/* Navigation Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-20 mb-2 ml-2" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        {/* Main content Skeleton */}
        <div className="space-y-8">
          <div className="border rounded-lg p-6">
            <Skeleton className="h-7 w-48 mb-4" />
            <div className="grid grid-cols-7 gap-2 mb-6">
              {[...Array(7)].map((_, index) => (
                <div key={index} className="text-center">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex justify-between items-center border-t pt-4">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <Skeleton className="h-7 w-48 mb-4" />
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <Skeleton className="h-5 w-48" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container pt-32 mx-auto px-4 py-8 max-w-[1216px]">
      {/* Improved navigation with back button and clear heading hierarchy */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand">Meeting Availability</h1>
          <p className="text-muted-foreground mt-1">Set when you're available for meetings</p>
        </div>
      </div>

      {/* Main content */}
      <MeetingAvailabilitySettings />
    </main>
  );
}