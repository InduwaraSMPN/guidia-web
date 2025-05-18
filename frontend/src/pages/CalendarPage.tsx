import { useState, useEffect } from 'react';
import { FullScreenCalendar, CalendarData, Event } from '@/components/FullScreenCalendar';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { API_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { MeetingDetailsDialog } from '@/components/meetings/MeetingDetailsDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Helper function to format time (e.g., "09:30" to "9:30 AM")
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

// Helper function to get meeting type display name
const getMeetingTypeName = (type: string): string => {
  switch (type) {
    case 'student_company':
      return 'Student ↔ Company';
    case 'student_counselor':
      return 'Student ↔ Counselor';
    case 'company_counselor':
      return 'Company ↔ Counselor';
    case 'student_student':
      return 'Student ↔ Student';
    case 'company_company':
      return 'Company ↔ Company';
    case 'counselor_counselor':
      return 'Counselor ↔ Counselor';
    default:
      return type;
  }
};

// Interface for meeting data from API
interface MeetingData {
  meetingID: number;
  requestorID: number;
  recipientID: number;
  requestorName: string;
  recipientName: string;
  meetingTitle: string;
  meetingDescription: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  status: 'requested' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  meetingType: string;
  declineReason?: string;
}

// Interface for the raw meeting data from API
export function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [rawMeetings, setRawMeetings] = useState<MeetingData[]>([]);

  // Redirect to login if user is not logged in
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  // Fetch meetings from API
  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/api/meeting/meetings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const meetingsData = (response.data as any).data || [];
      console.log('Meetings fetched:', meetingsData);

      // Store the raw meetings data for later use
      setRawMeetings(meetingsData);

      // Convert meetings to calendar data format
      const calendarEvents = convertMeetingsToCalendarData(meetingsData);
      setCalendarData(calendarEvents);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meetings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Handle clicking on an event in the calendar
  const handleEventClick = (event: Event) => {
    // Find the original meeting data for this event
    const meeting = rawMeetings.find(m => m.meetingID === event.id);
    if (meeting) {
      setSelectedMeeting(meeting);
      setIsDetailsOpen(true);
    }
  };

  // Handle meeting actions
  const handleAcceptMeeting = async (meetingId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/meeting/meetings/${meetingId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Meeting accepted successfully',
      });

      // Refresh meetings
      fetchMeetings();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error accepting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept meeting',
        variant: 'destructive',
      });
    }
  };

  const handleDeclineMeeting = async (meetingId: number, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/meeting/meetings/${meetingId}/decline`,
        { declineReason: reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Meeting declined successfully',
      });

      // Refresh meetings
      fetchMeetings();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error declining meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline meeting',
        variant: 'destructive',
      });
    }
  };

  const handleCancelMeeting = async (meetingId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/meeting/meetings/${meetingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Meeting cancelled successfully',
      });

      // Refresh meetings
      fetchMeetings();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel meeting',
        variant: 'destructive',
      });
    }
  };

  // Convert meetings data to calendar data format
  const convertMeetingsToCalendarData = (meetings: MeetingData[]): CalendarData[] => {
    // Create a map to group events by day
    const eventsByDay = new Map<string, Event[]>();

    meetings.forEach(meeting => {
      // Skip meetings that are declined or cancelled
      if (meeting.status === 'declined' || meeting.status === 'cancelled') {
        return;
      }

      const dateStr = meeting.meetingDate;
      const day = parseISO(dateStr);
      const dateKey = format(day, 'yyyy-MM-dd');

      // Format the event name and time
      const formattedStartTime = formatTime(meeting.startTime);
      const formattedEndTime = formatTime(meeting.endTime);
      const timeRange = `${formattedStartTime} - ${formattedEndTime}`;

      // Create the event object
      const event: Event = {
        id: meeting.meetingID,
        name: meeting.meetingTitle,
        time: timeRange,
        datetime: `${dateStr}T${meeting.startTime}`,
        status: meeting.status,
        type: getMeetingTypeName(meeting.meetingType),
        participants: `${meeting.requestorName} & ${meeting.recipientName}`,
      };

      // Add to the map
      if (!eventsByDay.has(dateKey)) {
        eventsByDay.set(dateKey, []);
      }
      eventsByDay.get(dateKey)!.push(event);
    });

    // Convert the map to the CalendarData array
    const result: CalendarData[] = [];
    eventsByDay.forEach((events, dateKey) => {
      result.push({
        day: parseISO(dateKey),
        events,
      });
    });

    return result;
  };

  return (
    <div className="max-w-[1216px] min-h-screen pt-32 pb-32 flex flex-col mx-auto">
      <div className="container mx-auto px-4 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
            <h1 className="text-4xl font-bold text-brand pb-2">Meetings Calendar</h1>
            <p className="text-muted-foreground">View and manage all your scheduled meetings.</p>
          </div>
        </div>

        <div className="flex-1 bg-card rounded-lg border shadow-sm overflow-hidden min-h-[600px] flex">
          {isLoading ? (
            <div className="w-full p-6">
              {/* Calendar Header Skeleton */}
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>

              {/* Calendar Grid Skeleton */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {[...Array(7)].map((_, index) => (
                  <Skeleton key={index} className="h-8 w-full" />
                ))}
              </div>

              {/* Calendar Days Skeleton */}
              <div className="grid grid-cols-7 gap-1">
                {[...Array(42)].map((_, index) => (
                  <div key={index} className="min-h-[100px] border border-border rounded-md p-1">
                    <Skeleton className="h-6 w-6 mb-2" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <FullScreenCalendar
              data={calendarData}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>

      {/* Meeting Details Dialog */}
      <MeetingDetailsDialog
        meeting={selectedMeeting}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        currentUserID={user?.id ? parseInt(user.id) : 0}
        onAccept={handleAcceptMeeting}
        onDecline={handleDeclineMeeting}
        onCancel={handleCancelMeeting}
      />
    </div>
  );
}
