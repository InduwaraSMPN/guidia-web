import React, { useState, useEffect } from 'react';
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
import { Calendar, Clock, User, Check, X, MessageSquare, Loader2 } from 'lucide-react';
import { cn, formatMeetingType } from '@/lib/utils';
import { formatSafeDate, formatTime } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { Meeting } from './MeetingList';
import { MeetingFeedbackForm } from './MeetingFeedbackForm';
import { MeetingFeedbackDisplay } from './MeetingFeedbackDisplay';
import axios from 'axios';
import { API_URL } from '@/config';
import { useToast } from '@/components/ui/use-toast';

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
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const { toast } = useToast();

  // Fetch feedback when meeting changes
  useEffect(() => {
    if (meeting && isOpen) {
      fetchFeedback();
    }
  }, [meeting, isOpen]);

  // Function to fetch feedback for the meeting
  const fetchFeedback = async () => {
    if (!meeting) return;

    setLoadingFeedback(true);
    setFeedback([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found when fetching feedback');
        toast({
          title: 'Authentication Error',
          description: 'Please log in again to view feedback',
          variant: 'destructive',
        });
        setLoadingFeedback(false);
        return;
      }

      console.log(`Fetching feedback for meeting ${meeting.meetingID}`);
      const response = await axios.get(
        `${API_URL}/api/meeting/meetings/${meeting.meetingID}/feedback`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Feedback response:', response.status, response.data);

      // Ensure we have a valid response with data property
      if (response.data && typeof response.data === 'object') {
        const feedbackData = response.data.data || [];

        // Validate that feedbackData is an array
        if (Array.isArray(feedbackData)) {
          setFeedback(feedbackData);

          // Check if current user has submitted feedback
          const userID = String(currentUserID);
          console.log('Checking if user has submitted feedback:', { userID, feedbackData });
          const userHasSubmitted = feedbackData.some(
            (item: any) => String(item.userID) === userID
          );
          setHasSubmittedFeedback(userHasSubmitted);
        } else {
          console.error('Feedback data is not an array:', feedbackData);
          setFeedback([]);
          setHasSubmittedFeedback(false);
        }
      } else {
        console.error('Invalid response format:', response.data);
        setFeedback([]);
        setHasSubmittedFeedback(false);
      }
    } catch (error: any) {
      console.error('Error fetching meeting feedback:', error);
      // More detailed error logging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });

        // Only show toast for non-404 errors (404 means no feedback yet, which is normal)
        if (error.response.status !== 404) {
          toast({
            title: 'Error',
            description: error.response.data?.message || 'Failed to load meeting feedback',
            variant: 'destructive',
          });
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast({
          title: 'Network Error',
          description: 'Could not connect to the server',
          variant: 'destructive',
        });
      } else {
        console.error('Error message:', error.message);
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }

      // Reset state on error
      setFeedback([]);
      setHasSubmittedFeedback(false);
    } finally {
      setLoadingFeedback(false);
    }
  };

  if (!meeting) return null;



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
                            (String(meeting.requestorID) === String(currentUserID) || String(meeting.recipientID) === String(currentUserID)) &&
                            !hasSubmittedFeedback;

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
              fetchFeedback(); // Refresh feedback after submission
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
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium text-muted-foreground">
                  Type:
                </div>
                <div className="col-span-3">
                  {formatMeetingType(meeting.meetingType)}
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

            {/* Feedback Display Section */}
            {meeting.status === 'completed' || meeting.status === 'accepted' ? (
              loadingFeedback ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading feedback...</span>
                </div>
              ) : feedback.length > 0 ? (
                <MeetingFeedbackDisplay feedback={feedback} />
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  <p>No feedback has been submitted for this meeting yet.</p>
                </div>
              )
            ) : null}

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
