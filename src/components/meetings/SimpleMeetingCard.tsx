import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquare, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Meeting } from './MeetingList';

interface SimpleMeetingCardProps {
  meeting: Meeting;
  currentUserID: number;
  onAccept?: (meetingId: number) => void;
  onDecline?: (meetingId: number, reason: string) => void;
  onViewDetails?: (meeting: Meeting) => void;
}

export function SimpleMeetingCard({
  meeting,
  currentUserID,
  onAccept,
  onDecline,
  onViewDetails,
}: SimpleMeetingCardProps) {
  // Format time for display (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Check if the current user is the recipient of the meeting
  const isRecipient = meeting.recipientID === currentUserID;

  // Check if the meeting can be accepted/declined
  const canRespond = isRecipient && meeting.status === 'requested';

  return (
    <div className="border rounded-md p-4 mb-4 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{meeting.meetingTitle}</h3>
          <div className="flex items-center mt-1 text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span>{isRecipient ? meeting.requestorName : meeting.recipientName}</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{format(new Date(meeting.meetingDate), 'MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
        </div>
      </div>

      {meeting.meetingDescription && (
        <p className="text-gray-600 mb-4">{meeting.meetingDescription}</p>
      )}

      <div className="flex justify-end gap-2">
        {canRespond && (
          <>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onAccept && onAccept(meeting.meetingID)}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDecline && onDecline(meeting.meetingID, '')}
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails && onViewDetails(meeting)}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Details
        </Button>
      </div>
    </div>
  );
}
