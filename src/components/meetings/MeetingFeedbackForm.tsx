import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
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
import { Star } from 'lucide-react';

interface MeetingFeedbackFormProps {
  meetingID: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Define the form schema
const formSchema = z.object({
  meetingSuccessRating: z.number().min(1, { message: 'Please rate the meeting success' }).max(5),
  platformExperienceRating: z.number().min(1, { message: 'Please rate the platform experience' }).max(5),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function MeetingFeedbackForm({
  meetingID,
  onSuccess,
  onCancel,
}: MeetingFeedbackFormProps) {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log for debugging
  console.log('MeetingFeedbackForm - User and Token:', {
    user,
    tokenExists: !!token,
    tokenLength: token ? token.length : 0
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingSuccessRating: 0,
      platformExperienceRating: 0,
      comments: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Check if token exists
      if (!token) {
        console.error('No token found when submitting feedback');
        toast({
          title: 'Authentication Error',
          description: 'Please log in again to submit feedback',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting feedback with token:', {
        meetingID,
        tokenExists: !!token,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
      });

      const response = await axios.post(
        `${API_URL}/api/meeting/meetings/${meetingID}/feedback`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Feedback submission response:', response.status, response.data);

      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);

      let errorMessage = 'Failed to submit feedback';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });

        if (error.response.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to submit feedback for this meeting.';
        } else if (error.response.status === 404) {
          errorMessage = 'Meeting not found.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid feedback data.';
        } else {
          errorMessage = `Server error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'An unexpected error occurred';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // If it's an authentication error, suggest logging in again
      if (error.response && error.response.status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Star rating component
  const StarRating = ({
    rating,
    onRatingChange
  }: {
    rating: number;
    onRatingChange: (rating: number) => void
  }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-medium">Meeting Feedback</h3>
      <p className="text-sm text-muted-foreground">
        Please rate your experience and provide any comments.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="meetingSuccessRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How successful was the meeting?</FormLabel>
                <FormControl>
                  <StarRating
                    rating={field.value}
                    onRatingChange={(rating) => field.onChange(rating)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platformExperienceRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How was your experience with the platform?</FormLabel>
                <FormControl>
                  <StarRating
                    rating={field.value}
                    onRatingChange={(rating) => field.onChange(rating)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter your description"
                    className="min-h-[120px]"
                  />
                </FormControl>
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
              disabled={isSubmitting || form.getValues().meetingSuccessRating === 0 || form.getValues().platformExperienceRating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
