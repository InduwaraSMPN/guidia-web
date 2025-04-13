import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Calendar, Clock, User, Check, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Meeting } from './MeetingList';
import { MeetingFeedbackForm } from './MeetingFeedbackForm';

interface MeetingDetailsDialogProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserID: number;
  onAccept?: (meetingId: number) => void;
  onDecline?: (meetingId: number, reason: string) => void;
  onCancel?: (meetingId: number) => void;
}

export function MeetingDetailsDialog({
  meeting,
  isOpen,
  onClose,
  currentUserID,
  onAccept,
  onDecline,
  onCancel,
}: MeetingDetailsDialogProps) {
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  if (!meeting) return null;

  // Format time for display (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Get status badge color
  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'declined':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get formatted status text
  const getStatusText = (status: Meeting['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Check if the current user is the recipient of the meeting
  // Convert both to strings for comparison to avoid type mismatch
  const isRecipient = String(meeting.recipientID) === String(currentUserID);

  // Check if the meeting can be accepted/declined
  const canRespond = isRecipient && meeting.status === 'requested';

  // Log for debugging
  console.log('Meeting details:', {
    meetingID: meeting.meetingID,
    status: meeting.status,
    recipientID: meeting.recipientID,
    currentUserID,
    canRespond
  });

  // Check if the meeting can be cancelled
  // Convert both to strings for comparison to avoid type mismatch
  const canCancel = (String(meeting.requestorID) === String(currentUserID) || String(meeting.recipientID) === String(currentUserID)) &&
                    (meeting.status === 'requested' || meeting.status === 'accepted');

  // Check if feedback can be provided
  // Convert both to strings for comparison to avoid type mismatch
  const canProvideFeedback = (meeting.status === 'completed' || meeting.status === 'accepted') &&
                            (String(meeting.requestorID) === String(currentUserID) || String(meeting.recipientID) === String(currentUserID));

  // Log for debugging feedback permissions
  console.log('Feedback permissions check:', {
    meetingStatus: meeting.status,
    canProvideFeedback,
    requestorMatch: String(meeting.requestorID) === String(currentUserID),
    recipientMatch: String(meeting.recipientID) === String(currentUserID)
  });

  // Handle decline with reason
  const handleDecline = () => {
    if (onDecline) {
      onDecline(meeting.meetingID, declineReason);
      setShowDeclineForm(false);
      setDeclineReason('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{meeting.meetingTitle}</span>
            <Badge className={cn("ml-2", getStatusColor(meeting.status))}>
              {getStatusText(meeting.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Meeting details
          </DialogDescription>
        </DialogHeader>

        {showFeedbackForm ? (
          <MeetingFeedbackForm
            meetingID={meeting.meetingID}
            onSuccess={() => {
              setShowFeedbackForm(false);
              onClose();
            }}
            onCancel={() => setShowFeedbackForm(false)}
          />
        ) : showDeclineForm ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for declining this meeting request:
            </p>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for declining"
              className="resize-none"
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeclineForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDecline}
              >
                Decline Meeting
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium text-muted-foreground">
                  With:
                </div>
                <div className="col-span-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {isRecipient ? meeting.requestorName : meeting.recipientName}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium text-muted-foreground">
                  Date:
                </div>
                <div className="col-span-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(meeting.meetingDate), 'MMMM d, yyyy')}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium text-muted-foreground">
                  Time:
                </div>
                <div className="col-span-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                </div>
              </div>
              {meeting.meetingDescription && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <div className="text-right text-sm font-medium text-muted-foreground">
                    Description:
                  </div>
                  <div className="col-span-3">
                    {meeting.meetingDescription}
                  </div>
                </div>
              )}
              {meeting.status === 'declined' && meeting.declineReason && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <div className="text-right text-sm font-medium text-muted-foreground">
                    Decline Reason:
                  </div>
                  <div className="col-span-3 p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm">
                    {meeting.declineReason}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-wrap gap-2">
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
                    onClick={() => setShowDeclineForm(true)}
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
                  Cancel Meeting
                </Button>
              )}
              {canProvideFeedback && (
                <Button
                  size="sm"
                  onClick={() => setShowFeedbackForm(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Provide Feedback
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
