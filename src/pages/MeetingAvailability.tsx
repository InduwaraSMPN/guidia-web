import { MeetingAvailabilitySettings } from '@/components/meetings/MeetingAvailabilitySettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function MeetingAvailability() {
  const navigate = useNavigate();

  return (
    <div className="container pb-32 pt-32 max-w-[1216px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meeting Availability Settings</h1>
      </div>
      <MeetingAvailabilitySettings />
    </div>
  );
}
