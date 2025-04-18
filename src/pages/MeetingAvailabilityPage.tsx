import React, { useState, useEffect } from 'react';
import { MeetingAvailabilitySettings } from '@/components/meetings/MeetingAvailabilitySettings';
import { MeetingAnalytics } from '@/components/meetings/MeetingAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MeetingAvailabilityPage() {
  const { user } = useAuth();
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
      <div className="mx-auto max-w-[1216px] px-4 sm:px-6 lg:px-8 pb-32 pt-32">
        {/* Back button skeleton */}
        <Skeleton className="h-8 w-20 mb-2" />

        {/* Page title skeleton */}
        <Skeleton className="h-10 w-64 mb-6" />

        {/* Tabs skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />

          {/* Tab content skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-5 w-full max-w-2xl" />

            {/* Availability Settings Skeleton */}
            <div className="space-y-6">
              <div className="border rounded-lg shadow-sm">
                <div className="p-6 pb-3">
                  <Skeleton className="h-7 w-48 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="p-6 space-y-6">
                  {/* Weekly Recurring Slots */}
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-3">
                        <div className="flex">
                          <Skeleton className="h-4 w-16 mr-auto" />
                          <Skeleton className="h-4 w-24 mx-auto" />
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </div>
                      </div>
                      <div className="divide-y">
                        {[1, 2, 3].map((_, index) => (
                          <div key={index} className="p-3 flex items-center">
                            <Skeleton className="h-8 w-24 mr-auto" />
                            <Skeleton className="h-8 w-48 mx-auto" />
                            <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* One-time Availability */}
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 p-3">
                        <div className="flex">
                          <Skeleton className="h-4 w-16 mr-auto" />
                          <Skeleton className="h-4 w-24 mx-auto" />
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </div>
                      </div>
                      <div className="divide-y">
                        {[1, 2].map((_, index) => (
                          <div key={index} className="p-3 flex items-center">
                            <Skeleton className="h-8 w-32 mr-auto" />
                            <Skeleton className="h-8 w-48 mx-auto" />
                            <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Templates */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-8 w-28" />
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Skeleton */}
            <div className="hidden space-y-6"> {/* Hidden by default since Availability is the default tab */}
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <Skeleton className="h-6 w-48 mb-1" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <div className="h-80">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <Skeleton className="h-6 w-48 mb-1" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <div className="h-80">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1216px] px-4 sm:px-6 lg:px-8 pb-32 pt-32">
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
      <h1 className="text-4xl font-bold text-brand pb-2">Meeting Settings</h1>

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
          <MeetingAnalytics userId={user?.id ? parseInt(user.id) : undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
