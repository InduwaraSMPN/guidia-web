"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, CalendarIcon } from "lucide-react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// --- ScrollArea Component ---
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

// --- Calendar Component ---
export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "relative mx-10 mb-1 flex h-9 items-center justify-center z-20",
    caption_label: "text-sm font-medium",
    nav: "absolute top-0 flex w-full justify-between z-10",
    button_previous: cn("size-9 text-muted-foreground/80 hover:text-foreground p-0 transition-colors duration-300"),
    button_next: cn("size-9 text-muted-foreground/80 hover:text-foreground p-0 transition-colors duration-300"),
    weekday: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
    day_button:
      "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg p-0 text-foreground outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-300 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-data-[selected]:group-[.range-middle]:bg-accent group-data-[selected]:group-[.range-middle]:text-foreground transition-colors duration-300",
    day: "group size-9 px-0 text-sm",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    hidden: "invisible",
    week_number: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
  }

  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(defaultClassNames[key as keyof typeof defaultClassNames], classNames[key as keyof typeof classNames])
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as typeof defaultClassNames,
  )

  const defaultComponents = {
    Chevron: (props: any) => {
      if (props.orientation === "left") {
        return <ChevronLeft size={16} strokeWidth={2} {...props} aria-hidden="true" />
      }
      return <ChevronRight size={16} strokeWidth={2} {...props} aria-hidden="true" />
    },
  }

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

// --- TimeSlot Interface ---
export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
}

// --- TimeSlotGroup Component ---
interface TimeSlotGroupProps {
  title: string
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onTimeSelect: (slot: TimeSlot) => void
}

function TimeSlotGroup({ title, slots, selectedSlot, onTimeSelect }: TimeSlotGroupProps) {
  if (slots.length === 0) return null

  // Format time for display (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${period}`
  }

  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-1.5">
        {slots.map((slot, index) => (
          <Button
            key={`${title.toLowerCase()}-${index}`}
            variant={selectedSlot?.startTime === slot.startTime ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full justify-start transition-all duration-300",
              !slot.available && "opacity-50",
              selectedSlot?.startTime === slot.startTime && "shadow-sm",
            )}
            onClick={() => onTimeSelect(slot)}
            disabled={!slot.available}
            aria-label={`Select time slot at ${formatTime(slot.startTime)}`}
          >
            <Clock className="mr-2 h-3 w-3" aria-hidden="true" />
            <span>{formatTime(slot.startTime)}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

// --- Loading Skeleton Component ---
function TimeSlotSkeleton() {
  return (
    <div className="space-y-4 px-5">
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  )
}

// --- AppointmentPicker Component ---
interface AppointmentPickerProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  timeSlots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onTimeSelect: (slot: TimeSlot) => void
  isLoadingSlots?: boolean
  minDate?: Date
}

export function AppointmentPicker({
  selectedDate,
  onDateSelect,
  timeSlots,
  selectedSlot,
  onTimeSelect,
  isLoadingSlots = false,
  minDate = new Date(),
}: AppointmentPickerProps) {
  // Group time slots by morning, afternoon, and evening
  const morningSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.startTime.split(":")[0])
    return hour >= 0 && hour < 12
  })

  const afternoonSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.startTime.split(":")[0])
    return hour >= 12 && hour < 17
  })

  const eveningSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.startTime.split(":")[0])
    return hour >= 17 && hour < 24
  })

  // Format time for display (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${period}`
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 pt-4">
        <h2 className="text-lg font-medium flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" aria-hidden="true" />
          Schedule Appointment
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex max-sm:flex-col">
          {/* Calendar component */}
          <div className="p-4 sm:border-r border-border">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              className="bg-background"
              disabled={[{ before: minDate }]} // Disable past dates
              aria-label="Select appointment date"
            />
          </div>
          <div className="relative w-full max-sm:h-[350px] sm:w-[240px]">
            <div className="absolute inset-0 border-border py-4 max-sm:border-t">
              {/* ScrollArea component */}
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <div className="flex items-center px-5">
                    {selectedDate ? (
                      <Badge variant="outline" className="px-3 py-1">
                        <span className="font-medium">{format(selectedDate, "EEEE, MMMM d")}</span>
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Select a date</span>
                    )}
                  </div>

                  {isLoadingSlots ? (
                    <TimeSlotSkeleton />
                  ) : !selectedDate ? (
                    <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                      <CalendarIcon className="h-10 w-10 text-muted-foreground/50 mb-3" aria-hidden="true" />
                      <p className="text-muted-foreground">Please select a date to view available time slots</p>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                      <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" aria-hidden="true" />
                      <p className="text-muted-foreground">No available time slots for the selected date</p>
                    </div>
                  ) : (
                    <div className="px-3">
                      <TimeSlotGroup
                        title="Morning"
                        slots={morningSlots}
                        selectedSlot={selectedSlot}
                        onTimeSelect={onTimeSelect}
                      />
                      <TimeSlotGroup
                        title="Afternoon"
                        slots={afternoonSlots}
                        selectedSlot={selectedSlot}
                        onTimeSelect={onTimeSelect}
                      />
                      <TimeSlotGroup
                        title="Evening"
                        slots={eveningSlots}
                        selectedSlot={selectedSlot}
                        onTimeSelect={onTimeSelect}
                      />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Display selected date and time for confirmation */}
      {selectedDate && selectedSlot && (
        <CardFooter className="border-t border-border bg-secondary/30 p-4">
          <div className="w-full">
            <h3 className="text-sm font-medium mb-1">Your Appointment</h3>
            <p className="text-sm">
              <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span> at{" "}
              <span className="font-medium">{formatTime(selectedSlot.startTime)}</span>
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}