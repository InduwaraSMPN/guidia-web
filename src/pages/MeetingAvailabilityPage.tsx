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
      <div className="mx-auto max-w-[1216px] px-4 sm:px-6 lg:px-8 pb-32">
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
      <h1 className="text-3xl font-bold text-brand pb-2">Meeting Settings</h1>

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
