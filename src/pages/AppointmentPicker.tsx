import React, { useState, useEffect } from 'react';
import { AppointmentPicker as AppointmentPickerComponent, TimeSlot } from '@/components/meetings/AppointmentPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function AppointmentPicker() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock time slots - in a real app, these would be fetched from an API
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    // Generate slots from 9:00 to 20:30 in 30-minute increments (covering morning, afternoon, and evening)
    // Morning: 9:00 AM to 11:30 AM
    // Afternoon: 12:00 PM to 2:30 PM
    // Evening: 3:00 PM to 8:30 PM
    for (let hour = 9; hour < 21; hour++) {
      for (let minute of [0, 30]) {
        // Make some slots unavailable randomly
        const available = Math.random() > 0.3;

        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

        slots.push({
          startTime,
          endTime,
          available
        });
      }
    }

    return slots;
  };

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);

    // Simulate loading when changing date
    setLoading(true);
    setTimeout(() => {
      // In a real app, you would fetch available slots for the selected date
      setTimeSlots(generateTimeSlots());
      setLoading(false);
    }, 500);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = () => {
    if (selectedDate && selectedSlot) {
      toast({
        title: 'Appointment Scheduled',
        description: `Your appointment has been scheduled for ${selectedDate.toLocaleDateString()} at ${selectedSlot.startTime}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calendar Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="grid grid-cols-7 gap-1">
                  {/* Calendar header */}
                  {[...Array(7)].map((_, index) => (
                    <Skeleton key={`header-${index}`} className="h-8 w-full" />
                  ))}

                  {/* Calendar days */}
                  {[...Array(35)].map((_, index) => (
                    <Skeleton key={`day-${index}`} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              </div>

              {/* Time slots skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="h-[400px] overflow-y-auto space-y-2 pr-2">
                  {[...Array(12)].map((_, index) => (
                    <Skeleton key={`slot-${index}`} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Picker</CardTitle>
          <CardDescription>
            Select a date and time for your appointment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AppointmentPickerComponent
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            timeSlots={timeSlots}
            selectedSlot={selectedSlot}
            onTimeSelect={handleTimeSelect}
            minDate={new Date()}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedSlot}
            >
              Schedule Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
