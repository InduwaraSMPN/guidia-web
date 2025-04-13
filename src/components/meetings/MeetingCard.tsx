import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquare, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Meeting } from './MeetingList';

interface MeetingCardProps {
  meeting: Meeting;
  currentUserID: number;
  onAccept?: (meetingId: number) => void;
  onDecline?: (meetingId: number, reason: string) => void;
  onCancel?: (meetingId: number) => void;
  onViewDetails?: (meeting: Meeting) => void;
}

export function MeetingCard({
  meeting,
  currentUserID,
  onAccept,
  onDecline,
  onCancel,
  onViewDetails,
}: MeetingCardProps) {
  // Format time for display (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Check if the current user is the recipient of the meeting
  // Convert both to strings for comparison to avoid type mismatch
  const isRecipient = String(meeting.recipientID) === String(currentUserID);

  // Check if the meeting can be accepted/declined
  const canRespond = isRecipient && meeting.status === 'requested';

  // Check if the meeting can be cancelled
  // Convert both to strings for comparison to avoid type mismatch
  const canCancel = (String(meeting.requestorID) === String(currentUserID) || String(meeting.recipientID) === String(currentUserID)) &&
                    (meeting.status === 'requested' || meeting.status === 'accepted');

  // Log for debugging
  console.log(`MeetingCard ${meeting.meetingID}:`, {
    meetingID: meeting.meetingID,
    status: meeting.status,
    recipientID: meeting.recipientID,
    currentUserID,
    isRecipient,
    canRespond
  });

  return (
    <div className="border rounded-md p-4 mb-4 bg-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{meeting.meetingTitle}</h3>
          <div className="flex items-center mt-1 text-muted-foreground">
            <User className="h-4 w-4 mr-1" />
            <span>{isRecipient ? meeting.requestorName : meeting.recipientName}</span>
          </div>
        </div>
        {meeting.status === 'requested' && (
          <div className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            Requested
          </div>
        )}
        {meeting.status === 'accepted' && (
          <div className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Accepted
          </div>
        )}
        {meeting.status === 'declined' && (
          <div className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Declined
          </div>
        )}
        {meeting.status === 'cancelled' && (
          <div className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            Cancelled
          </div>
        )}
        {meeting.status === 'completed' && (
          <div className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Completed
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{format(new Date(meeting.meetingDate), 'MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
        </div>
      </div>

      {meeting.meetingDescription && (
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {meeting.meetingDescription}
        </p>
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
        {canCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel && onCancel(meeting.meetingID)}
          >
            Cancel
          </Button>
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
