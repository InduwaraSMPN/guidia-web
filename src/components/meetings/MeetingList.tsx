import React from 'react';
import { Badge } from '../ui/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MeetingCard } from './MeetingCard';

export interface Meeting {
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

interface MeetingListProps {
  meetings: Meeting[];
  currentUserID: number;
  onAccept?: (meetingId: number) => void;
  onDecline?: (meetingId: number, reason: string) => void;
  onCancel?: (meetingId: number) => void;
  onViewDetails?: (meeting: Meeting) => void;
  isLoading?: boolean;
}

export function MeetingList({
  meetings,
  currentUserID,
  onAccept,
  onDecline,
  onCancel,
  onViewDetails,
  isLoading = false,
}: MeetingListProps) {
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
  const isRecipient = (meeting: Meeting) => String(meeting.recipientID) === String(currentUserID);

  // Check if the meeting can be accepted/declined
  const canRespond = (meeting: Meeting) => {
    const result = isRecipient(meeting) && meeting.status === 'requested';
    console.log(`Meeting ${meeting.meetingID} canRespond:`, {
      isRecipient: isRecipient(meeting),
      status: meeting.status,
      result
    });
    return result;
  };

  // Check if the meeting can be cancelled
  // Convert both to strings for comparison to avoid type mismatch
  const canCancel = (meeting: Meeting) => {
    return (String(meeting.requestorID) === String(currentUserID) || String(meeting.recipientID) === String(currentUserID)) &&
           (meeting.status === 'requested' || meeting.status === 'accepted');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No meetings found.
      </div>
    );
  }

  if (meetings.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium">No meetings found</p>
        <p className="text-sm">You don't have any meetings in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.meetingID}
          meeting={meeting}
          currentUserID={currentUserID}
          onAccept={onAccept}
          onDecline={onDecline}
          onCancel={onCancel}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
