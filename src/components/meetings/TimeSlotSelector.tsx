import React from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface TimeSlotSelectorProps {
  availableSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export function TimeSlotSelector({
  availableSlots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}: TimeSlotSelectorProps) {
  // Group time slots by morning, afternoon, and evening
  const morningSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour >= 0 && hour < 12;
  });

  const afternoonSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour >= 12 && hour < 17;
  });

  const eveningSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    return hour >= 17 && hour < 24;
  });

  // Format time for display (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Render a group of time slots
  const renderTimeSlotGroup = (slots: TimeSlot[], title: string) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {slots.map((slot, index) => (
            <Button
              key={index}
              variant={selectedSlot && selectedSlot.startTime === slot.startTime ? "default" : "outline"}
              className={cn(
                "justify-start",
                selectedSlot && selectedSlot.startTime === slot.startTime ? "bg-brand text-white hover:bg-brand/90" : ""
              )}
              onClick={() => onSelectSlot(slot)}
            >
              <Clock className="mr-2 h-4 w-4" />
              {formatTime(slot.startTime)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <h3 className="text-lg font-medium mb-4">Select a Time</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No available time slots for the selected date.
        </div>
      ) : (
        <>
          {renderTimeSlotGroup(morningSlots, "Morning")}
          {renderTimeSlotGroup(afternoonSlots, "Afternoon")}
          {renderTimeSlotGroup(eveningSlots, "Evening")}
        </>
      )}
    </div>
  );
}
