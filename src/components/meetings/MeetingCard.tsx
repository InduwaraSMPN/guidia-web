import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquare, User, Calendar, Clock, Star } from 'lucide-react';
import { formatMeetingType } from '@/lib/utils';
import { formatSafeDate, formatTime } from '@/utils/dateUtils';
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


  // Check if the current user is the recipient of the meeting
  // Convert both to strings for comparison to avoid type mismatch
  const isRecipient = String(meeting.recipientID) === String(currentUserID);

  // Check if the meeting can be accepted/declined
  const canRespond = isRecipient && meeting.status === 'requested';

  // Check if the meeting can be cancelled
  // Convert both to strings for comparison to avoid type mismatch
  const canCancel = (String(meeting.requestorID) === String(currentUserID) || String(meeting.recipientID) === String(currentUserID)) &&
                    (meeting.status === 'requested' || meeting.status === 'accepted');



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
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Completed
            </div>
            {meeting.hasFeedback && (
              <div className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center">
                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                Feedback
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {meeting.meetingDate && meeting.meetingDate.includes('T')
              ? (() => {
                  // Extract just the date part from the ISO string
                  const datePart = meeting.meetingDate.split('T')[0];
                  const [year, month, day] = datePart.split('-').map(Number);

                  // Create date with local timezone (months are 0-indexed in JS Date)
                  const date = new Date(year, month - 1, day);
                  return format(date, 'MMMM d, yyyy');
                })()
              : formatSafeDate(meeting.meetingDate)
            }
          </span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <span className="text-sm">{formatMeetingType(meeting.meetingType)}</span>
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
