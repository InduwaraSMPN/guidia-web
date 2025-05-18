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
import { motion } from "framer-motion"

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
  // No need to check for empty slots here as we're doing conditional rendering in the parent component
  // Format time for display (e.g., "09:30" to "9:30 AM")
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${period}`
  }

  // Ensure we have valid slots to render
  if (!slots || slots.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3 px-1">{title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-2">
        {slots.map((slot, index) => (
          <motion.div
            key={`${title.toLowerCase()}-${index}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Button
              variant={selectedSlot?.startTime === slot.startTime ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-full justify-start transition-all duration-300 h-10",
                !slot.available && "opacity-50",
                selectedSlot?.startTime === slot.startTime && "shadow-md scale-[1.02]",
              )}
              onClick={(e) => {
                // Prevent form submission
                e.preventDefault();
                onTimeSelect(slot);
              }}
              disabled={!slot.available}
              aria-label={`Select time slot at ${formatTime(slot.startTime)}`}
            >
              <Clock className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-medium">{formatTime(slot.startTime)}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// --- Loading Skeleton Component ---
function TimeSlotSkeleton() {
  return (
    <div className="space-y-6 px-6">
      <div>
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Empty State Component ---
interface EmptyStateProps {
  icon: React.ReactNode
  message: string
}

function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-5 text-center"
    >
      <div className="bg-secondary/50 rounded-full p-4 mb-4">{icon}</div>
      <p className="text-muted-foreground font-medium">{message}</p>
    </motion.div>
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
  // Morning: 12 AM to 11:59 AM
  const morningSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.startTime.split(":")[0])
    return hour >= 0 && hour < 12
  })

  // Afternoon: 12 PM to 2:59 PM
  const afternoonSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.startTime.split(":")[0])
    return hour >= 12 && hour < 15
  })

  // Evening: 3 PM to 11:59 PM
  const eveningSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.startTime.split(":")[0])
    return hour >= 15 && hour < 24;
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
    <Card className="shadow-sm overflow-hidden border-border">
      <CardHeader className="p-4 pt-5 border-b border-border/70 bg-background">
        <h2 className="text-xl font-semibold flex items-center">
          <CalendarIcon className="mr-2.5 h-5 w-5 text-primary" aria-hidden="true" />
          Schedule Meeting
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex max-sm:flex-col">
          {/* Calendar component */}
          <div className="p-2 sm:border-r border-border bg-background/50">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                // Prevent any form submission when selecting a date
                if (onDateSelect) {
                  onDateSelect(date);
                }
              }}
              className="bg-background"
              disabled={[{ before: minDate }]} // Disable past dates
              aria-label="Select Meeting date"
            />
          </div>
          <div className="relative w-full max-sm:h-[350px] sm:w-[280px] bg-background/30">
            <div className="absolute inset-0 border-border py-5 max-sm:border-t pt-6 pb-12">
              {/* Date selection indicator */}
              <div className="flex items-center px-6 mb-4">
                {selectedDate ? (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <Badge variant="outline" className="px-3 py-1.5 text-sm bg-secondary/50 w-full justify-center">
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                      <span className="font-medium">{format(selectedDate, "EEEE, MMMM d")}</span>
                    </Badge>
                  </motion.div>
                ) : (
                  <span className="text-sm text-muted-foreground font-medium">Select a date to continue</span>
                )}
              </div>

              {/* ScrollArea component */}
              <ScrollArea className="h-full">
                {isLoadingSlots ? (
                  <TimeSlotSkeleton />
                ) : !selectedDate ? (
                  <EmptyState
                    icon={<CalendarIcon className="h-8 w-8 text-muted-foreground/70" aria-hidden="true" />}
                    message="Please select a date to view available time slots"
                  />
                ) : timeSlots.length === 0 ? (
                  <EmptyState
                    icon={<Clock className="h-8 w-8 text-muted-foreground/70" aria-hidden="true" />}
                    message="No available time slots for the selected date"
                  />
                ) : (
                  <div className="px-6">
                    {/* Morning slots */}
                    <TimeSlotGroup
                      title="Morning"
                      slots={morningSlots}
                      selectedSlot={selectedSlot}
                      onTimeSelect={onTimeSelect}
                    />

                    {/* Afternoon slots */}
                    <TimeSlotGroup
                      title="Afternoon"
                      slots={afternoonSlots}
                      selectedSlot={selectedSlot}
                      onTimeSelect={onTimeSelect}
                    />

                    {/* Evening slots */}
                    <TimeSlotGroup
                      title="Evening"
                      slots={eveningSlots}
                      selectedSlot={selectedSlot}
                      onTimeSelect={onTimeSelect}
                    />
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Display selected date and time for confirmation */}
      {selectedDate && selectedSlot && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <CardFooter className="border-t border-border bg-secondary/40 p-5">
            <div className="w-full">
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
                Your Meeting
              </h3>
              <p className="text-sm bg-background/50 p-3 rounded-md border border-border/50">
                <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                <span className="mx-1">at</span>
                <span className="font-medium text-primary">{formatTime(selectedSlot.startTime)}</span>
              </p>
            </div>
          </CardFooter>
        </motion.div>
      )}
    </Card>
  )
}