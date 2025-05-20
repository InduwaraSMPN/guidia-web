

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select-radix"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { API_URL } from "@/config"
import axios from "axios"
import { Plus, Trash2, Clock, Calendar, Save, X } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false)

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

      console.log('Fetching availability settings for user ID:', user.id);
      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${API_URL}/api/meeting/availability/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log('Availability settings response:', response.data);
        const availabilityData = response.data.data || []

        if (availabilityData.length > 0) {
          setIsFirstTimeSetup(false)
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
          // This is a first-time setup
          setIsFirstTimeSetup(true)
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
            setIsFirstTimeSetup(true)
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

            toast.info("Using Default Settings", {
              description: "We've loaded default availability settings that you can customize."
            })
            return
          }
        }

        // Generic error handling
        toast.error("Error", {
          description: "Failed to fetch availability settings. Using default settings instead."
        })

        // Set default slots for any error
        setIsFirstTimeSetup(true)
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
  const addAvailabilitySlot = (isRecurring = true, day = 1) => {
    append({
      dayOfWeek: day, // Default to Monday
      startTime: "09:00",
      endTime: "17:00",
      isRecurring: isRecurring,
      specificDate: isRecurring ? null : new Date().toISOString().split("T")[0],
    })

    // Scroll to the newly added slot
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  }

  // Add quick template for weekdays 9-5
  const addWeekdayTemplate = () => {
    // Check if there are existing slots
    if (fields.length > 0) {
      // Use Sonner toast for confirmation
      toast('Apply weekday template?', {
        description: 'This will replace your existing availability slots with the weekday template.',
        position: 'top-center',
        action: {
          label: 'Apply',
          onClick: () => {
            // Safely remove existing slots
            const fieldsCopy = [...fields];
            fieldsCopy.forEach(() => {
              remove(0); // Always remove the first item as the array shifts
            });

            // Add Monday through Friday, 9am-5pm
            setTimeout(() => {
              [1, 2, 3, 4, 5].forEach(day => {
                append({
                  dayOfWeek: day,
                  startTime: "09:00",
                  endTime: "17:00",
                  isRecurring: true,
                  specificDate: null,
                });
              });

              toast.success("Weekday template applied");
            }, 0);
          },
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {},
        },
      });
      return;
    }

    // If no existing slots, just add the template without confirmation
    [1, 2, 3, 4, 5].forEach(day => {
      append({
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true,
        specificDate: null,
      });
    });

    toast.success("Weekday template applied");
  }

  // Function to clear all slots
  const clearAllSlots = () => {
    if (fields.length === 0) {
      toast.info("No slots to clear");
      return;
    }

    // Directly remove all slots without confirmation
    const fieldsCopy = [...fields];
    fieldsCopy.forEach(() => {
      remove(0); // Always remove the first item as the array shifts
    });

    toast.success("All slots cleared");
  }

  // Add quick template for weekend availability
  const addWeekendTemplate = () => {
    // Check if there are existing slots
    if (fields.length > 0) {
      // Use Sonner toast for confirmation
      toast('Apply weekend template?', {
        description: 'This will replace your existing availability slots with the weekend template.',
        position: 'top-center',
        action: {
          label: 'Apply',
          onClick: () => {
            // Safely remove existing slots
            const fieldsCopy = [...fields];
            fieldsCopy.forEach(() => {
              remove(0); // Always remove the first item as the array shifts
            });

            // Add Saturday and Sunday, 10am-4pm
            setTimeout(() => {
              [0, 6].forEach(day => {
                append({
                  dayOfWeek: day,
                  startTime: "10:00",
                  endTime: "16:00",
                  isRecurring: true,
                  specificDate: null,
                });
              });

              toast.success("Weekend template applied");
            }, 0);
          },
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {},
        },
      });
      return;
    }

    // If no existing slots, just add the template without confirmation
    [0, 6].forEach(day => {
      append({
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "16:00",
        isRecurring: true,
        specificDate: null,
      });
    });

    toast.success("Weekend template applied");
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user?.id || !token) return

    setIsSaving(true)
    setError(null)

    console.log('Saving availability settings for user ID:', user.id);
    console.log('Availability slots to save:', JSON.stringify(values.availabilitySlots));

    try {
      const response = await axios.post(
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

      console.log('Availability settings saved successfully:', response.data);

      // After successful save, it's no longer a first-time setup
      setIsFirstTimeSetup(false)
      // Mark form as pristine after successful save
      form.reset(values)

      toast.success("Success", {
        description: "Your availability settings have been saved successfully"
      })
    } catch (error: any) {
      console.error("Error saving availability settings:", error)
      setError("Failed to save your availability settings")

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          toast.error("Permission Error", {
            description: "You don't have permission to save availability settings. Please contact support."
          })
          return
        }
      }

      // Generic error handling
      toast.error("Error", {
        description: "Failed to save availability settings. Please try again later."
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skeleton for recurring slots table */}
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-3">
                <div className="flex">
                  <Skeleton className="h-4 w-16 mr-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
              <div className="divide-y">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="p-3 flex items-center">
                    <Skeleton className="h-8 w-24 mr-auto" />
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton for template buttons */}
          <div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton for save button */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-primary" />
          <span>When are you available?</span>
          {isFirstTimeSetup && (
            <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
              New Setup
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          Set times when you're available for meetings. Others can only request meetings during these times.
          {isFirstTimeSetup && (
            <span className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium block">
              We've added some default times to get you started. Save to activate your schedule.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form className="space-y-6">
            <div className="space-y-4">
              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No availability slots configured yet.</p>
                  <p className="text-sm">Add your first availability slot below.</p>
                </div>
              )}

              {/* Group slots by type for better organization */}
              {fields.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Your Availability</h3>
                  </div>
                  {/* Weekly recurring slots */}
                  {fields.some((_field, i) => form.watch(`availabilitySlots.${i}.isRecurring`)) && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Weekly Recurring Slots</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 text-xs font-medium">Day</th>
                              <th className="text-left p-3 text-xs font-medium">Time</th>
                              <th className="text-right p-3 text-xs font-medium w-16">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {fields.map((field, index) =>
                              form.watch(`availabilitySlots.${index}.isRecurring`) ? (
                                <tr key={field.id} className="hover:bg-muted/30 transition-colors">
                                  <td className="p-3">
                                    <Select
                                      value={form.watch(`availabilitySlots.${index}.dayOfWeek`).toString()}
                                      onValueChange={(value) => form.setValue(`availabilitySlots.${index}.dayOfWeek`, Number.parseInt(value), { shouldDirty: true })}
                                    >
                                      <SelectTrigger className="w-full border-none shadow-none h-8 p-0 bg-transparent">
                                        <SelectValue placeholder="Select day" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                          <SelectItem key={day} value={day.toString()}>
                                            {getDayName(day)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        <Input
                                          type="time"
                                          value={form.watch(`availabilitySlots.${index}.startTime`)}
                                          onChange={(e) => form.setValue(`availabilitySlots.${index}.startTime`, e.target.value, { shouldDirty: true })}
                                          className="border-none shadow-none h-8 p-0 w-20 bg-transparent"
                                        />
                                        <span className="text-sm font-medium ml-1">
                                          {form.watch(`availabilitySlots.${index}.startTime`) ?
                                            Number.parseInt(form.watch(`availabilitySlots.${index}.startTime`).split(':')[0]) >= 12 ? 'PM' : 'AM'
                                            : ''}
                                        </span>
                                      </div>
                                      <span>to</span>
                                      <div className="flex items-center">
                                        <Input
                                          type="time"
                                          value={form.watch(`availabilitySlots.${index}.endTime`)}
                                          onChange={(e) => form.setValue(`availabilitySlots.${index}.endTime`, e.target.value, { shouldDirty: true })}
                                          className="border-none shadow-none h-8 p-0 w-20 bg-transparent"
                                        />
                                        <span className="text-sm font-medium ml-1">
                                          {form.watch(`availabilitySlots.${index}.endTime`) ?
                                            Number.parseInt(form.watch(`availabilitySlots.${index}.endTime`).split(':')[0]) >= 12 ? 'PM' : 'AM'
                                            : ''}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Remove</span>
                                    </Button>
                                  </td>
                                </tr>
                              ) : null
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={clearAllSlots}
                          className="text-brand text-xs font-style: italic hover:underline mt-2"
                        >
                          Clear All Slots
                        </button>
                      </div>
                    </div>
                  )}

                  {/* One-time slots */}
                  {fields.some((_field, i) => !form.watch(`availabilitySlots.${i}.isRecurring`)) && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">One-time Availability</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 text-xs font-medium">Date</th>
                              <th className="text-left p-3 text-xs font-medium">Time</th>
                              <th className="text-right p-3 text-xs font-medium w-16">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {fields.map((field, index) =>
                              !form.watch(`availabilitySlots.${index}.isRecurring`) ? (
                                <tr key={field.id} className="hover:bg-muted/30 transition-colors">
                                  <td className="p-3">
                                    <Input
                                      type="date"
                                      value={form.watch(`availabilitySlots.${index}.specificDate`) || ""}
                                      onChange={(e) => form.setValue(`availabilitySlots.${index}.specificDate`, e.target.value, { shouldDirty: true })}
                                      min={new Date().toISOString().split("T")[0]}
                                      className="border-none shadow-none h-8 p-0 bg-transparent"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        <Input
                                          type="time"
                                          value={form.watch(`availabilitySlots.${index}.startTime`)}
                                          onChange={(e) => form.setValue(`availabilitySlots.${index}.startTime`, e.target.value, { shouldDirty: true })}
                                          className="border-none shadow-none h-8 p-0 w-20 bg-transparent"
                                        />
                                        <span className="text-sm font-medium ml-1">
                                          {form.watch(`availabilitySlots.${index}.startTime`) ?
                                            Number.parseInt(form.watch(`availabilitySlots.${index}.startTime`).split(':')[0]) >= 12 ? 'PM' : 'AM'
                                            : ''}
                                        </span>
                                      </div>
                                      <span>to</span>
                                      <div className="flex items-center">
                                        <Input
                                          type="time"
                                          value={form.watch(`availabilitySlots.${index}.endTime`)}
                                          onChange={(e) => form.setValue(`availabilitySlots.${index}.endTime`, e.target.value, { shouldDirty: true })}
                                          className="border-none shadow-none h-8 p-0 w-20 bg-transparent"
                                        />
                                        <span className="text-sm font-medium ml-1">
                                          {form.watch(`availabilitySlots.${index}.endTime`) ?
                                            Number.parseInt(form.watch(`availabilitySlots.${index}.endTime`).split(':')[0]) >= 12 ? 'PM' : 'AM'
                                            : ''}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Remove</span>
                                    </Button>
                                  </td>
                                </tr>
                              ) : null
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Quick Templates</h4>
                    <p className="text-xs text-muted-foreground">Templates replace all existing slots</p>
                  </div>
                  <div className="flex flex-wrap">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Apply Templates:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addWeekdayTemplate}
                          className="text-xs"
                        >
                          Weekdays (9-5)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addWeekendTemplate}
                          className="text-xs"
                        >
                          Weekends (10-4)
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Add Individual Slots:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addAvailabilitySlot(true)}
                          className="text-xs"
                        >
                          Add Weekly Slot
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addAvailabilitySlot(false)}
                          className="text-xs"
                        >
                          Add One-time Slot
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={(e) => {
                  if (!form.formState.isDirty && !isFirstTimeSetup) {
                    // Show toast message when trying to save without changes
                    e.preventDefault();
                    toast.info("No Changes Detected", {
                      description: "Please make changes first to update availability settings"
                    });
                  } else {
                    // Submit the form if there are changes
                    form.handleSubmit(onSubmit)(e);
                  }
                }}
                disabled={isSaving}
                className="px-6"
              >
                {isSaving ? "Saving..." : "Save Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
