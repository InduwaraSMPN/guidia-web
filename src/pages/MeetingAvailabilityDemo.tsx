
import { MeetingAvailabilitySettingsDemo } from '@/components/meetings/MeetingAvailabilitySettingsDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function MeetingAvailabilityDemo() {
  const navigate = useNavigate();

  return (
    <div className="container pb-32 pt-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meeting Availability Settings</h1>
        <Button onClick={() => navigate('/appointment-picker-demo')}>
          View Appointment Picker Demo
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How to Set Up Your Availability</CardTitle>
          <CardDescription>
            Before others can request meetings with you, you need to set up your availability.
            This determines when you're available for meetings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h3 className="font-medium mb-2">Step 1: Add Availability Slots</h3>
              <p>Use the form below to add time slots when you're available for meetings. You can add multiple slots for different days of the week.</p>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg">
              <h3 className="font-medium mb-2">Step 2: Set Recurring or Specific Dates</h3>
              <p>Choose whether each slot is recurring (happens every week) or for a specific date only.</p>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg">
              <h3 className="font-medium mb-2">Step 3: Save Your Settings</h3>
              <p>Click "Save Availability Settings" to save your changes. Others will only be able to request meetings during these times.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <MeetingAvailabilitySettingsDemo />
    </div>
  );
}
