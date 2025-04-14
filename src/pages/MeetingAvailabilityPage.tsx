import React, { useState, useEffect } from 'react';
import { MeetingAvailabilitySettings } from '@/components/meetings/MeetingAvailabilitySettings';
import { MeetingAnalytics } from '@/components/meetings/MeetingAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export function MeetingAvailabilityPage() {
  const { user } = useAuth();
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
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-6" />

        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-64 mb-6" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-5 w-full max-w-2xl" />

            {/* Availability Settings Skeleton */}
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Meeting Settings</h1>

      <Tabs defaultValue="availability" className="space-y-6">
        <TabsList>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="space-y-6">
          <p className="text-muted-foreground">
            Set your availability for meetings. Others will only be able to request meetings during these times.
          </p>
          <MeetingAvailabilitySettings />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <p className="text-muted-foreground">
            View analytics about your meetings and feedback.
          </p>
          <MeetingAnalytics userId={user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
