"use client";

import * as React from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility Function (cn) ---
// Typically from '@/lib/utils', included here for self-containment
function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return twMerge(clsx(inputs));
}

// No longer needed - removed useMediaQuery hook


// --- Button Component ---
// Based on button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm shadow-black/5 hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";


// --- Separator Component ---
// Based on separator.tsx
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName


// --- FullScreenCalendar Component ---
// Based on fullscreen-calendar.tsx
interface Event {
  id: number;
  name: string;
  time: string;
  datetime: string; // Keeping string type as per original code
  status?: 'requested' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  type?: string;
  participants?: string;
}

interface CalendarData {
  day: Date;
  events: Event[];
}

interface FullScreenCalendarProps {
  data: CalendarData[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onEventClick?: (event: Event) => void;
}

const colStartClasses = [
  "", // 0 index for Sunday
  "col-start-2", // 1 index for Monday
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7", // 6 index for Saturday
];

// Helper function to get CSS class based on meeting status
const getEventStatusClass = (status?: string) => {
  if (!status) return 'bg-muted/50';

  switch (status) {
    case 'requested':
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800/50';
    case 'accepted':
      return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50';
    case 'completed':
      return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50';
    default:
      return 'bg-muted/50';
  }
};

function FullScreenCalendar({
  data,
  searchQuery = "",
  onSearchChange = () => {},
  onEventClick = () => {}
}: FullScreenCalendarProps) {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  );
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

  // Calculate days to always show 6 rows (42 days) for consistent layout
  const firstDayOfMonth = startOfWeek(firstDayCurrentMonth);

  // Calculate the end date to ensure we always have 6 weeks (42 days)
  const endDate = add(firstDayOfMonth, { days: 41 });

  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: endDate,
  });

  function previousMonth() {
    const firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayPrevMonth, "MMM-yyyy"));
    // Update selected day to be in the new month
    setSelectedDay(firstDayPrevMonth);
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    // Update selected day to be in the new month
    setSelectedDay(firstDayNextMonth);
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"));
    setSelectedDay(today); // Also select today when clicking "Today"
  }

  // Filter events based on search query
  const filteredData = searchQuery.trim() === ""
    ? data
    : data.map(dayData => ({
        day: dayData.day,
        events: dayData.events.filter(event =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.time.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }));

  const selectedDayEvents = filteredData.find((d) => isSameDay(d.day, selectedDay))?.events || [];

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground h-full w-full">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
             {/* Current Month Date Indicator */}
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                {format(selectedDay, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                <span>{format(selectedDay, "d")}</span>
              </div>
            </div>
             {/* Month Display */}
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM yyyy")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          {/* Search Bar */}
          <div className="w-full md:w-64 lg:w-80">
            <div className="relative">
              <input
                type="search"
                placeholder="Search Meetings..."
                className="w-full h-9 px-4 py-2 pl-10 pr-10 rounded-lg border border-input bg-background shadow-sm shadow-black/5 focus:outline-none focus:ring-1 focus:ring-brand text-sm"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </span>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

           {/* No New Event Button */}
        </div>
      </div>

      {/* Calendar Grid Area */}
      <div className="flex flex-1 flex-col overflow-hidden border-t border-border min-h-0">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-xs font-semibold leading-6 text-muted-foreground lg:flex-none">
          <div className="border-r border-border py-2">Sun</div>
          <div className="border-r border-border py-2">Mon</div>
          <div className="border-r border-border py-2">Tue</div>
          <div className="border-r border-border py-2">Wed</div>
          <div className="border-r border-border py-2">Thu</div>
          <div className="border-r border-border py-2">Fri</div>
          <div className="py-2">Sat</div>
        </div>

        {/* Calendar Days Grid */}
        <div className="flex flex-1 flex-col overflow-auto text-xs leading-6 lg:flex-row min-h-0">
          {/* Desktop/Large Screen View */}
          <div className="hidden w-full border-l border-border lg:grid lg:flex-1 lg:grid-cols-7 lg:grid-rows-6 auto-rows-fr">
            {days.map((day, dayIdx) => (
              <div
                key={day.toISOString()} // Use ISO string for stable key
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "relative flex flex-col border-b border-r border-border focus:z-10 min-h-[100px]",
                  // Apply column start based on the day of the week for the first row
                  dayIdx < 7 && colStartClasses[getDay(day)],
                   // Dim days outside the current month
                  !isSameMonth(day, firstDayCurrentMonth) && "bg-muted/20 text-muted-foreground/70",
                  // Highlight selected day slightly
                  isSameDay(day, selectedDay) && !isToday(day) && "bg-accent/50",
                   // Hover effect
                  isSameMonth(day, firstDayCurrentMonth) && "hover:bg-muted/40 cursor-pointer",
                )}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-end p-1.5">
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs",
                      isToday(day) && "bg-primary font-semibold text-primary-foreground", // Today marker
                      isSameDay(day, selectedDay) && !isToday(day) && "bg-foreground font-semibold text-background", // Selected marker
                      !isSameMonth(day, firstDayCurrentMonth) && "text-muted-foreground/70" // Dimmer text for outside days
                    )}
                  >
                    {format(day, "d")}
                  </time>
                </div>
                 {/* Events List */}
                <div className="flex-1 overflow-y-auto p-1.5 pt-0">
                  {filteredData
                    .filter((eventData) => isSameDay(eventData.day, day))
                    .flatMap((eventData) => eventData.events) // Get all events for the day
                    .slice(0, 2) // Limit displayed events initially
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`mb-1 flex flex-col items-start gap-0.5 rounded border p-1 text-[11px] leading-tight shadow-sm ${getEventStatusClass(event.status)} cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => onEventClick(event)}
                      >
                        <p className="font-medium leading-none mb-1">{event.name}</p>
                        <p className="leading-none text-muted-foreground">{event.time}</p>
                        {event.type && <p className="leading-none text-[10px] text-muted-foreground">{event.type}</p>}
                      </div>
                    ))}
                  {/* Indicator for more events */}
                  {(() => {
                    const dayEvents = filteredData.find((d) => isSameDay(d.day, day));
                    return dayEvents && dayEvents.events.length > 2 ? (
                      <div className="mt-1 text-center text-[10px] text-muted-foreground">
                        + {dayEvents.events.length - 2} more
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            ))}
          </div>

           {/* Mobile/Small Screen View - List of days and selected day's events */}
          <div className="flex flex-col border-l border-border lg:hidden flex-1">
             {/* Day buttons */}
             <div className="grid flex-none grid-cols-7 border-b border-border">
                {days.map((day) => (
                  <button
                    onClick={() => setSelectedDay(day)}
                    key={day.toISOString()}
                    type="button"
                    className={cn(
                      "flex h-12 flex-col items-center justify-center border-b border-r border-border py-1 text-xs focus:z-10",
                       // Base text color for current month
                       isSameMonth(day, firstDayCurrentMonth) && "text-foreground",
                       // Dim text for outside month
                      !isSameMonth(day, firstDayCurrentMonth) && "text-muted-foreground/50",
                      // Selected day style
                      isSameDay(day, selectedDay) && "bg-accent font-semibold",
                      // Today style (overrides selected if they are the same)
                      isToday(day) && "bg-primary font-semibold text-primary-foreground"
                    )}
                  >
                    <time dateTime={format(day, "yyyy-MM-dd")}>
                      {format(day, "d")}
                    </time>
                     {/* Event indicator dots */}
                     {filteredData.some((eventData) => isSameDay(eventData.day, day) && eventData.events.length > 0) && (
                       <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                         {filteredData
                           .filter((eventData) => isSameDay(eventData.day, day))
                           .flatMap(d => d.events)
                           .slice(0, 3) // Show max 3 dots
                           .map((_, index) => (
                              <span key={index} className="block size-1 rounded-full bg-current opacity-70" />
                           ))}
                       </div>
                     )}
                  </button>
                ))}
              </div>
              {/* Selected day's events */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <h3 className="mb-3 text-base font-semibold">
                  Events for {format(selectedDay, "MMMM d, yyyy")}
                </h3>
                {selectedDayEvents.length > 0 ? (
                  <ol className="space-y-3">
                    {selectedDayEvents.map((event) => (
                      <li
                        key={event.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 ${getEventStatusClass(event.status)} cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground">{event.time}</p>
                          {event.type && <p className="text-xs text-muted-foreground">{event.type}</p>}
                          {event.participants && <p className="text-xs text-muted-foreground mt-1">With: {event.participants}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">No meetings for this day.</p>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Export the main calendar component
export { FullScreenCalendar };

// Types are also useful to export if using this component elsewhere
export type { Event, CalendarData, FullScreenCalendarProps };
