import { useState } from 'react';
import { Button } from '../ui/button';
import { Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { MeetingRequestForm } from './MeetingRequestForm';

interface MeetingRequestButtonProps {
  recipientID: number;
  recipientName: string;
  recipientType: 'Student' | 'Company' | 'Counselor';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  id?: string; // Added id prop for DOM identification
  'data-userid'?: string; // Add data-userid attribute for companies
}

export function MeetingRequestButton({
  recipientID,
  recipientName,
  recipientType,
  variant = 'default',
  size = 'default',
  className,
  id,
  'data-userid': userID,
}: MeetingRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className} id={id}>
          <Calendar className="mr-2 h-4 w-4" />
          Request Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[680px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand">Request Meeting with {recipientName}</DialogTitle>
          <DialogDescription>
            Fill out the form below to request a meeting. Select a date and time slot that works for you.
          </DialogDescription>
        </DialogHeader>
        <MeetingRequestForm
          recipientID={recipientID}
          recipientName={recipientName}
          recipientType={recipientType}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          companyUserID={recipientType === 'Company' && userID ? parseInt(userID) : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
