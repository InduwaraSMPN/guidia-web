import React, { useState } from 'react';
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

export function MeetingAvailabilitySettingsDemo() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availabilitySlots: [
        {
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          specificDate: null,
        },
        {
          dayOfWeek: 2, // Tuesday
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          specificDate: null,
        },
        {
          dayOfWeek: 3, // Wednesday
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          specificDate: null,
        }
      ],
    },
  });

  // Set up field array for dynamic availability slots
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availabilitySlots',
  });

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
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Availability settings:', values);
      toast({
        title: 'Success',
        description: 'Availability settings saved successfully',
      });
      setIsSaving(false);
    }, 1000);
  };

  // Helper function to get day name
  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

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
                            <FormLabel>Recurring Weekly</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              This slot repeats every week
                            </p>
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
                                onChange={(e) => field.onChange(e.target.value || null)}
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
