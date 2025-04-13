import React, { useState, useEffect } from 'react';
import { FullScreenCalendar, CalendarData, Event } from '@/components/FullScreenCalendar';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { API_URL } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { MeetingDetailsDialog } from '@/components/meetings/MeetingDetailsDialog';

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
      return 'Student-Company';
    case 'student_counselor':
      return 'Student-Counselor';
    case 'company_counselor':
      return 'Company-Counselor';
    case 'student_student':
      return 'Student-Student';
    case 'company_company':
      return 'Company-Company';
    case 'counselor_counselor':
      return 'Counselor-Counselor';
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
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [rawMeetings, setRawMeetings] = useState<MeetingData[]>([]);

  // Fetch meetings from API
  useEffect(() => {
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

    fetchMeetings();
  }, [toast]);

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
    <div className="min-h-screen pt-20 pb-10 flex flex-col">
      <div className="container mx-auto px-4 flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Meeting Calendar</h1>
          <p className="text-muted-foreground">View and manage all your scheduled meetings</p>
        </div>

        <div className="flex-1 bg-card rounded-lg border shadow-sm overflow-hidden min-h-[600px] flex">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="w-12 h-12 border-4 border-border border-t-brand rounded-full animate-spin" />
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
