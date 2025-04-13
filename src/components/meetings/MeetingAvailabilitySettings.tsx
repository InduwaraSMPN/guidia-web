import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface AvailabilitySlot {
  availabilityID?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string | null;
}

// Define the form schema
const availabilitySlotSchema = z.object({
  availabilityID: z.number().optional(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' }),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' }),
  isRecurring: z.boolean(),
  specificDate: z.string().nullable().optional(),
});

const formSchema = z.object({
  availabilitySlots: z.array(availabilitySlotSchema),
});

type FormValues = z.infer<typeof formSchema>;

export function MeetingAvailabilitySettings() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availabilitySlots: [],
    },
  });

  // Set up field array for dynamic availability slots
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availabilitySlots',
  });

  // Fetch user's availability settings
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.id || !token) return;

      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/meeting/availability/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const availabilityData = response.data.data || [];

        if (availabilityData.length > 0) {
          form.reset({
            availabilitySlots: availabilityData.map((slot: any) => ({
              availabilityID: slot.availabilityID,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime.substring(0, 5), // Format: HH:MM
              endTime: slot.endTime.substring(0, 5), // Format: HH:MM
              isRecurring: Boolean(slot.isRecurring),
              specificDate: slot.specificDate,
            })),
          });
        } else {
          // Add default availability (weekdays 9 AM - 5 PM)
          const defaultSlots = [1, 2, 3, 4, 5].map(day => ({
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            isRecurring: true,
            specificDate: null,
          }));

          form.reset({
            availabilitySlots: defaultSlots,
          });
        }
      } catch (error: any) {
        console.error('Error fetching availability settings:', error);

        // Handle specific error cases
        if (error.response) {
          if (error.response.status === 403) {
            // Permission error - use default slots
            console.log('Permission error, using default availability slots');
            const defaultSlots = [1, 2, 3, 4, 5].map(day => ({
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '17:00',
              isRecurring: true,
              specificDate: null,
            }));

            form.reset({
              availabilitySlots: defaultSlots,
            });

            toast({
              title: 'Using Default Settings',
              description: 'We\'ve loaded default availability settings that you can customize.',
              variant: 'default',
            });
            return;
          }
        }

        // Generic error handling
        toast({
          title: 'Error',
          description: 'Failed to fetch availability settings. Using default settings instead.',
          variant: 'destructive',
        });

        // Set default slots for any error
        const defaultSlots = [1, 2, 3, 4, 5].map(day => ({
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          specificDate: null,
        }));

        form.reset({
          availabilitySlots: defaultSlots,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [user?.id, token, form, toast]);

  // Add a new availability slot
  const addAvailabilitySlot = () => {
    append({
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true,
      specificDate: null,
    });
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user?.id || !token) return;

    setIsSaving(true);
    try {
      await axios.post(
        `${API_URL}/api/meeting/availability`,
        {
          userID: user.id,
          availabilitySlots: values.availabilitySlots,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Availability settings saved successfully',
      });
    } catch (error: any) {
      console.error('Error saving availability settings:', error);

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          toast({
            title: 'Permission Error',
            description: 'You don\'t have permission to save availability settings. Please contact support.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Generic error handling
      toast({
        title: 'Error',
        description: 'Failed to save availability settings. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get day name from day number
  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Settings</CardTitle>
        <CardDescription>
          Set your availability for meetings. Others will only be able to request meetings during these times.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md bg-background">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Availability Slot {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`availabilitySlots.${index}.isRecurring`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Recurring weekly</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch(`availabilitySlots.${index}.isRecurring`) ? (
                      <FormField
                        control={form.control}
                        name={`availabilitySlots.${index}.dayOfWeek`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day of Week</FormLabel>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {getDayName(day)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name={`availabilitySlots.${index}.specificDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specific Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={field.value || ''}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name={`availabilitySlots.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`availabilitySlots.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addAvailabilitySlot}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Availability Slot
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Availability Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
