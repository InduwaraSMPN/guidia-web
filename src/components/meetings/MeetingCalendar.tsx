import React, { useState, ButtonHTMLAttributes } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define interface for CalendarDay from react-day-picker
interface CalendarDay {
  date: Date;
  displayMonth: Date;
  outside: boolean;
}

// Define interface for DayButton props
interface DayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  day: CalendarDay;
  modifiers: Record<string, boolean>;
}

interface MeetingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
}

export function MeetingCalendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  minDate = new Date(),
  maxDate,
}: MeetingCalendarProps) {
  const [month, setMonth] = useState<Date>(selectedDate || new Date());

  // Function to check if a date is available
  const isDateAvailable = (date: Date) => {
    if (!availableDates || availableDates.length === 0) return true;

    return availableDates.some(availableDate =>
      availableDate.getDate() === date.getDate() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getFullYear() === date.getFullYear()
    );
  };

  // Custom DayButton renderer to highlight available dates
  const CustomDayButton = (props: DayButtonProps) => {
    const { day, modifiers, className, ...buttonProps } = props;
    const dateObj = day.date; // In react-day-picker v9, day is a CalendarDay object with a date property
    const isAvailable = isDateAvailable(dateObj);

    return (
      <button
        type="button"
        {...buttonProps}
        className={cn(
          className,
          'relative',
          isAvailable ? 'bg-background hover:bg-secondary' : 'text-muted-foreground opacity-50 cursor-not-allowed',
          selectedDate &&
            dateObj.getDate() === selectedDate.getDate() &&
            dateObj.getMonth() === selectedDate.getMonth() &&
            dateObj.getFullYear() === selectedDate.getFullYear()
            ? 'bg-brand text-white hover:bg-brand hover:text-white'
            : ''
        )}
        disabled={!isAvailable}
      >
        {dateObj.getDate()}
      </button>
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Select a Date</h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const prevMonth = new Date(month);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setMonth(prevMonth);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const nextMonth = new Date(month);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setMonth(nextMonth);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        month={month}
        onMonthChange={setMonth}
        className="rounded-md border"
        components={{
          DayButton: CustomDayButton
        }}
        disabled={[
          { before: minDate },
          ...(maxDate ? [{ after: maxDate }] : []),
        ]}
      />
    </div>
  );
}
