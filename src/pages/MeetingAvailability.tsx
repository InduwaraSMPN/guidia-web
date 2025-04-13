import { MeetingAvailabilitySettings } from '@/components/meetings/MeetingAvailabilitySettings';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MeetingAvailability() {
  const navigate = useNavigate();

  return (
    <main className="container pt-32 mx-auto px-4 py-8 max-w-[1216px]">
      {/* Improved navigation with back button and clear heading hierarchy */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 ml-2 text-muted-foreground hover:text-foreground transition-colors"
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