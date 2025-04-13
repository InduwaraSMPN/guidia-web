import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppointmentPicker, TimeSlot as AppointmentTimeSlot } from './AppointmentPicker';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import axios from 'axios';

// Use the TimeSlot interface from AppointmentPicker
type TimeSlot = AppointmentTimeSlot;

interface MeetingRequestFormProps {
  recipientID: number;
  recipientName: string;
  recipientType: 'Student' | 'Company' | 'Counselor';
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Define the form schema
const formSchema = z.object({
  meetingTitle: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  meetingDescription: z.string().optional(),
  meetingDate: z.date({ required_error: 'Please select a date' }),
  startTime: z.string({ required_error: 'Please select a time slot' }),
  endTime: z.string({ required_error: 'Please select a time slot' }),
});

type FormValues = z.infer<typeof formSchema>;

export function MeetingRequestForm({
  recipientID,
  recipientName,
  recipientType,
  onSuccess,
  onCancel,
}: MeetingRequestFormProps) {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine meeting type based on user role and recipient type
  const getMeetingType = () => {
    const userType = user?.roleId === 2 ? 'Student' : user?.roleId === 3 ? 'Counselor' : 'Company';

    if (userType === 'Student' && recipientType === 'Company') return 'student_company';
    if (userType === 'Student' && recipientType === 'Counselor') return 'student_counselor';
    if (userType === 'Company' && recipientType === 'Counselor') return 'company_counselor';
    if (userType === 'Student' && recipientType === 'Student') return 'student_student';
    if (userType === 'Company' && recipientType === 'Company') return 'company_company';
    if (userType === 'Counselor' && recipientType === 'Counselor') return 'counselor_counselor';

    // Reverse the order if needed
    if (userType === 'Company' && recipientType === 'Student') return 'student_company';
    if (userType === 'Counselor' && recipientType === 'Student') return 'student_counselor';
    if (userType === 'Counselor' && recipientType === 'Company') return 'company_counselor';

    return 'student_student'; // Default fallback
  };

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingTitle: '',
      meetingDescription: '',
    },
  });

  // Fetch available time slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const response = await axios.get(
          `${API_URL}/api/meeting/meetings/available-slots/${recipientID}/${formattedDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Add available property to each slot
        const responseData = response.data as { availableSlots?: { startTime: string; endTime: string }[] };
        const slots = (responseData.availableSlots || []).map((slot) => ({
          ...slot,
          available: true
        }));
        setAvailableSlots(slots);
      } catch (error: any) {
        console.error('Error fetching available slots:', error);

        // Handle specific error cases
        if (error.response) {
          if (error.response.status === 404) {
            toast({
              title: 'No Availability Found',
              description: 'The recipient has not set up their availability for this date.',
              // @ts-ignore - variant is supported by the toast implementation
              variant: 'default',
            });
          } else {
            toast({
              title: 'Error',
              description: 'Failed to fetch available time slots. Please try again later.',
              // @ts-ignore - variant is supported by the toast implementation
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch available time slots. Please check your connection.',
            // @ts-ignore - variant is supported by the toast implementation
            variant: 'destructive',
          });
        }

        // Set empty slots array
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, recipientID, token, toast]);

  // Handle time slot selection
  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    form.setValue('startTime', slot.startTime);
    form.setValue('endTime', slot.endTime);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    form.setValue('meetingDate', date as Date);
    setSelectedSlot(null);
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const meetingData = {
        recipientID,
        meetingTitle: values.meetingTitle,
        meetingDescription: values.meetingDescription || '',
        meetingDate: values.meetingDate.toISOString().split('T')[0],
        startTime: values.startTime,
        endTime: values.endTime,
        meetingType: getMeetingType(),
      };

      await axios.post(`${API_URL}/api/meeting/meetings`, meetingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: 'Success',
        description: 'Meeting request sent successfully',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error requesting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to send meeting request',
        // @ts-ignore - variant is supported by the toast implementation
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="meetingTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter meeting title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meetingDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter meeting description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meetingDate"
            render={() => (
              <FormItem>
                <AppointmentPicker
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  timeSlots={availableSlots}
                  selectedSlot={selectedSlot}
                  onTimeSelect={handleSelectSlot}
                  isLoadingSlots={isLoadingSlots}
                  minDate={new Date()}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedDate || !selectedSlot}
            >
              {isSubmitting ? 'Sending...' : 'Request Meeting'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
