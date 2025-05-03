import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppointmentPicker, TimeSlot as AppointmentTimeSlot } from './AppointmentPicker';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { RichTextEditor } from '../ui/RichTextEditor';
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
import { getCompanyUserID } from '@/utils/companyUserMapping';
import { formatLocalDate } from '@/utils/dateUtils';

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
    if (!user || !user.roleId) {
      console.error('User or user role ID is missing');
      return 'student_student'; // Default fallback
    }

    // Map role IDs to user types
    // 1 = Admin, 2 = Student, 3 = Counselor, 4 = Company
    let userType;
    switch (user.roleId) {
      case 1: userType = 'Admin'; break;
      case 2: userType = 'Student'; break;
      case 3: userType = 'Counselor'; break;
      case 4: userType = 'Company'; break;
      default:
        console.error(`Unknown user role ID: ${user.roleId}`);
        userType = 'Student'; // Default fallback
    }

    // Create a standardized meeting type string
    // Always put types in alphabetical order for consistency
    const types = [userType, recipientType].sort();
    const meetingType = types.join('_').toLowerCase();
    console.log(`Generated meeting type: ${meetingType} for user role ${user.roleId} (${userType}) and recipient type ${recipientType}`);
    return meetingType;
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
        // Format date as YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];

        // For companies, we need to get the user ID associated with the company ID
        let actualRecipientID = recipientID;
        if (recipientType === 'Company') {
          try {
            actualRecipientID = await getCompanyUserID(recipientID);
          } catch (error) {
            console.error('Error mapping company ID to user ID:', error);
            // Continue with the original ID if mapping fails
          }
        }

        // Calculate day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = selectedDate.getDay();

        // Add a timestamp to avoid caching issues
        const timestamp = new Date().getTime();
        const response = await axios.get(
          `${API_URL}/api/meeting/meetings/available-slots/${actualRecipientID}/${formattedDate}?t=${timestamp}&dayOfWeek=${dayOfWeek}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Process the response

        // Add available property to each slot
        const responseData = response.data as {
          availableSlots?: { startTime: string; endTime: string }[],
          message?: string
        };

        const slots = (responseData.availableSlots || []).map((slot) => ({
          ...slot,
          available: true
        }));


        // If server returned a message, show it to the user
        if (responseData.message && slots.length === 0) {
          toast({
            title: 'No Available Slots',
            description: responseData.message,
            // @ts-ignore - variant is supported by the toast implementation
            variant: 'default',
          });
        } else if (slots.length === 0) {
          // If no slots are available but no message was provided, show a generic message
          toast({
            title: 'No Available Slots',
            description: 'No available time slots found for the selected date. Please try another date.',
            // @ts-ignore - variant is supported by the toast implementation
            variant: 'default',
          });
        }

        setAvailableSlots(slots);
      } catch (error: any) {
        console.error('Error fetching available slots:', error);
        console.error('Error details:', error.response?.data || 'No response data');
        console.error('Error status:', error.response?.status || 'No status code');

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
    // Prevent any automatic form submission
    setSelectedSlot(slot);
    form.setValue('startTime', slot.startTime);
    form.setValue('endTime', slot.endTime);
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    // Prevent any automatic form submission
    setSelectedDate(date);
    if (date) {
      form.setValue('meetingDate', date);
    }
    setSelectedSlot(null);
    form.setValue('startTime', '');
    form.setValue('endTime', '');
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // For companies, we need to use the user ID instead of the company ID
      let actualRecipientID = recipientID;
      if (recipientType === 'Company') {
        try {
          actualRecipientID = await getCompanyUserID(recipientID);
        } catch (error) {
          console.error('Error mapping company ID to user ID:', error);
          // Continue with the original ID if mapping fails
        }
      }

      // Use the utility function to format the date
      const localDate = formatLocalDate(values.meetingDate);

      const meetingData = {
        recipientID: actualRecipientID,
        meetingTitle: values.meetingTitle,
        meetingDescription: values.meetingDescription || '',
        meetingDate: localDate, // Use local date format instead of ISO
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
    } catch (error: any) {
      console.error('Error requesting meeting:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      console.error('Error status:', error.response?.status || 'No status code');

      // Show a more specific error message if available
      const errorMessage = error.response?.data?.message || 'Failed to send meeting request';

      toast({
        title: 'Error',
        description: errorMessage,
        // @ts-ignore - variant is supported by the toast implementation
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a custom submit handler to ensure it only triggers on button click
  const handleFormSubmit = (e: React.FormEvent) => {
    // Only proceed with form submission if the user clicked the submit button
    if (e.target instanceof HTMLFormElement) {
      const submitter = (e as any).nativeEvent?.submitter;
      if (!submitter || submitter.type !== 'submit' || submitter.disabled) {
        e.preventDefault();
        return;
      }
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            handleFormSubmit(e);
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-6">
          <FormField
            control={form.control}
            name="meetingTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter meeting title"
                    {...field}
                    onKeyDown={(e) => {
                      // Prevent form submission on Enter key
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
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
                  <RichTextEditor
                    placeholder="Enter meeting description"
                    value={field.value}
                    onChange={field.onChange}
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
