import React from 'react';
import { MeetingAvailabilitySettings } from '@/components/meetings/MeetingAvailabilitySettings';
import { MeetingAnalytics } from '@/components/meetings/MeetingAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MeetingAvailabilityPage() {
  const { user } = useAuth();

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
