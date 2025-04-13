import React, { useState } from 'react';
import { AppointmentPicker, TimeSlot } from '@/components/meetings/AppointmentPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export function AppointmentPickerDemo() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  // Mock time slots - in a real app, these would be fetched from an API
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Generate slots from 9:00 to 17:30 in 30-minute increments
    for (let hour = 9; hour < 18; hour++) {
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
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    
    // In a real app, you would fetch available slots for the selected date
    // For demo purposes, we'll just regenerate random slots
    setTimeSlots(generateTimeSlots());
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
  
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Picker Demo</CardTitle>
          <CardDescription>
            Select a date and time for your appointment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AppointmentPicker
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
