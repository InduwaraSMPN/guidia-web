"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-radix"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { API_URL } from "@/config"
import axios from "axios"
import { Plus, Trash2, Clock, Calendar, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AvailabilitySlot {
  availabilityID?: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
  specificDate?: string | null
}

// Define the form schema
const availabilitySlotSchema = z
  .object({
    availabilityID: z.number().optional(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)" }),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)" }),
    isRecurring: z.boolean(),
    specificDate: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (!data.isRecurring && !data.specificDate) {
        return false
      }
      return true
    },
    {
      message: "Please select a specific date for non-recurring slots",
      path: ["specificDate"],
    },
  )
  .refine(
    (data) => {
      // Convert times to minutes for comparison
      const startMinutes =
        Number.parseInt(data.startTime.split(":")[0]) * 60 + Number.parseInt(data.startTime.split(":")[1])
      const endMinutes = Number.parseInt(data.endTime.split(":")[0]) * 60 + Number.parseInt(data.endTime.split(":")[1])
      return endMinutes > startMinutes
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  )

const formSchema = z.object({
  availabilitySlots: z.array(availabilitySlotSchema),
})

type FormValues = z.infer<typeof formSchema>

export function MeetingAvailabilitySettings() {
  const { user } = useAuth()
  const token = localStorage.getItem("token")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availabilitySlots: [],
    },
    mode: "onChange", // Validate on change for better user feedback
  })

  // Set up field array for dynamic availability slots
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availabilitySlots",
  })

  // Fetch user's availability settings
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.id || !token) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${API_URL}/api/meeting/availability/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const availabilityData = response.data.data || []

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
          })
        } else {
          // Add default availability (weekdays 9 AM - 5 PM)
          const defaultSlots = [1, 2, 3, 4, 5].map((day) => ({
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "17:00",
            isRecurring: true,
            specificDate: null,
          }))

          form.reset({
            availabilitySlots: defaultSlots,
          })
        }
      } catch (error: any) {
        console.error("Error fetching availability settings:", error)
        setError("Failed to fetch your availability settings")

        // Handle specific error cases
        if (error.response) {
          if (error.response.status === 403) {
            // Permission error - use default slots
            console.log("Permission error, using default availability slots")
            const defaultSlots = [1, 2, 3, 4, 5].map((day) => ({
              dayOfWeek: day,
              startTime: "09:00",
              endTime: "17:00",
              isRecurring: true,
              specificDate: null,
            }))

            form.reset({
              availabilitySlots: defaultSlots,
            })

            toast({
              title: "Using Default Settings",
              description: "We've loaded default availability settings that you can customize.",
              variant: "default",
            })
            return
          }
        }

        // Generic error handling
        toast({
          title: "Error",
          description: "Failed to fetch availability settings. Using default settings instead.",
          variant: "destructive",
        })

        // Set default slots for any error
        const defaultSlots = [1, 2, 3, 4, 5].map((day) => ({
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isRecurring: true,
          specificDate: null,
        }))

        form.reset({
          availabilitySlots: defaultSlots,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [user?.id, token, form, toast])

  // Add a new availability slot
  const addAvailabilitySlot = () => {
    append({
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      isRecurring: true,
      specificDate: null,
    })

    // Scroll to the newly added slot
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user?.id || !token) return

    setIsSaving(true)
    setError(null)

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
        },
      )

      toast({
        title: "Success",
        description: "Your availability settings have been saved successfully",
      })
    } catch (error: any) {
      console.error("Error saving availability settings:", error)
      setError("Failed to save your availability settings")

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          toast({
            title: "Permission Error",
            description: "You don't have permission to save availability settings. Please contact support.",
            variant: "destructive",
          })
          return
        }
      }

      // Generic error handling
      toast({
        title: "Error",
        description: "Failed to save availability settings. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Get day name from day number
  const getDayName = (day: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[day]
  }

  // Format time for better readability
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="p-4 border rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span>Availability Settings</span>
        </CardTitle>
        <CardDescription>
          Set your availability for meetings. Others will only be able to request meetings during these times.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No availability slots configured yet.</p>
                  <p className="text-sm">Add your first availability slot below.</p>
                </div>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-5 border rounded-lg bg-card transition-all hover:shadow-sm focus-within:shadow-sm focus-within:border-primary/50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      {form.watch(`availabilitySlots.${index}.isRecurring`) ? (
                        <>
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs">
                            {getDayName(form.watch(`availabilitySlots.${index}.dayOfWeek`)).substring(0, 1)}
                          </span>
                          <span>{getDayName(form.watch(`availabilitySlots.${index}.dayOfWeek`))}</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs">
                            <Calendar className="h-3 w-3" />
                          </span>
                          <span>
                            {form.watch(`availabilitySlots.${index}.specificDate`)
                              ? new Date(
                                  form.watch(`availabilitySlots.${index}.specificDate`) as string,
                                ).toLocaleDateString()
                              : "Specific Date"}
                          </span>
                        </>
                      )}

                      {/* Show time summary */}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        {form.watch(`availabilitySlots.${index}.startTime`) &&
                          form.watch(`availabilitySlots.${index}.endTime`) && (
                            <>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatTime(form.watch(`availabilitySlots.${index}.startTime`))} -{" "}
                              {formatTime(form.watch(`availabilitySlots.${index}.endTime`))}
                            </>
                          )}
                      </span>
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label={`Remove availability slot ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove slot</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name={`availabilitySlots.${index}.isRecurring`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id={`recurring-${index}`}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel htmlFor={`recurring-${index}`} className="cursor-pointer">
                              Recurring weekly
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">This slot repeats every week</p>
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
                            <FormLabel htmlFor={`day-${index}`}>Day of Week</FormLabel>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => field.onChange(Number.parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger id={`day-${index}`} className="w-full">
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
                            <FormLabel htmlFor={`date-${index}`}>Specific Date</FormLabel>
                            <FormControl>
                              <Input
                                id={`date-${index}`}
                                type="date"
                                value={field.value || ""}
                                onChange={field.onChange}
                                min={new Date().toISOString().split("T")[0]} // Prevent past dates
                                className="w-full"
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
                          <FormLabel htmlFor={`start-${index}`}>Start Time</FormLabel>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input id={`start-${index}`} type="time" {...field} className="pl-10" />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`availabilitySlots.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={`end-${index}`}>End Time</FormLabel>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input id={`end-${index}`} type="time" {...field} className="pl-10" />
                            </FormControl>
                          </div>
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
                className="w-full h-12 border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Availability Slot
              </Button>
            </div>

            <CardFooter className="px-0 pt-6 pb-0 flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
                className="w-full sm:w-auto min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
