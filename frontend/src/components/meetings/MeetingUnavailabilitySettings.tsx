"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { API_URL } from "@/config"
import axios from "axios"
import { Plus, Trash2, Calendar, Save, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UnavailabilityPeriod {
  unavailabilityID?: number
  startDateTime: string
  endDateTime: string
  reason?: string | null
}

// Define the form schema
const unavailabilityPeriodSchema = z
  .object({
    unavailabilityID: z.number().optional(),
    startDateTime: z.string(),
    endDateTime: z.string(),
    reason: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDateTime);
      const end = new Date(data.endDateTime);
      return end > start;
    },
    {
      message: "End date/time must be after start date/time",
      path: ["endDateTime"],
    },
  );

const formSchema = z.object({
  unavailabilityPeriods: z.array(unavailabilityPeriodSchema),
});

type FormValues = z.infer<typeof formSchema>;

export function MeetingUnavailabilitySettings() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unavailabilityPeriods: [],
    },
    mode: "onChange", // Validate on change for better user feedback
  });

  // Track if this is first time setup
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  // Set up field array for dynamic unavailability periods
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "unavailabilityPeriods",
  });

  // Fetch user's unavailability periods
  useEffect(() => {
    const fetchUnavailability = async () => {
      if (!user?.id || !token) return;

      console.log('Fetching unavailability periods for user ID:', user.id);
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/api/meeting/unavailability/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Unavailability periods response:', response.data);
        const unavailabilityData = response.data.data || [];

        if (unavailabilityData.length > 0) {
          setIsFirstTimeSetup(false);
          form.reset({
            unavailabilityPeriods: unavailabilityData.map((period: any) => ({
              unavailabilityID: period.unavailabilityID,
              startDateTime: formatDateTimeForInput(period.startDateTime),
              endDateTime: formatDateTimeForInput(period.endDateTime),
              reason: period.reason || "",
            })),
          });
        } else {
          // This is a first-time setup
          setIsFirstTimeSetup(true);

          // Add a default unavailability period (optional)
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);

          form.reset({
            unavailabilityPeriods: [],
          });
        }
      } catch (error: any) {
        console.error("Error fetching unavailability periods:", error);
        setError("Failed to fetch your unavailability periods");

        // Generic error handling
        toast.error("Error", {
          description: "Failed to fetch unavailability periods. Please try again later."
        });

        form.reset({
          unavailabilityPeriods: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnavailability();
  }, [user?.id, token, form, toast]);

  // Format date-time string for input fields (YYYY-MM-DDTHH:MM)
  const formatDateTimeForInput = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toISOString().slice(0, 16);
  };

  // Add a new unavailability period
  const addUnavailabilityPeriod = () => {
    // Create default start and end times (today and tomorrow)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    append({
      startDateTime: now.toISOString().slice(0, 16),
      endDateTime: tomorrow.toISOString().slice(0, 16),
      reason: "",
    });

    // Scroll to the newly added period
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  // Function to clear all periods
  const clearAllPeriods = () => {
    if (fields.length === 0) {
      toast.info("No periods to clear");
      return;
    }

    // Directly remove all periods without confirmation
    const fieldsCopy = [...fields];
    fieldsCopy.forEach(() => {
      remove(0); // Always remove the first item as the array shifts
    });

    // Explicitly mark the form as dirty to allow saving the empty state
    form.setValue('unavailabilityPeriods', [], { shouldDirty: true });

    toast.success("All periods cleared");
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user?.id || !token) return;

    setIsSaving(true);
    setError(null);

    console.log('Saving unavailability periods for user ID:', user.id);
    console.log('Unavailability periods to save:', JSON.stringify(values.unavailabilityPeriods));

    try {
      const response = await axios.post(
        `${API_URL}/api/meeting/unavailability`,
        {
          userID: user.id,
          unavailabilityPeriods: values.unavailabilityPeriods,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Unavailability periods saved successfully:', response.data);

      // After successful save, it's no longer a first-time setup
      setIsFirstTimeSetup(false);
      // Mark form as pristine after successful save
      form.reset(values);

      toast.success("Success", {
        description: "Your unavailability periods have been saved successfully"
      });
    } catch (error: any) {
      console.error("Error saving unavailability periods:", error);
      setError("Failed to save your unavailability periods");

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          toast.error("Permission Error", {
            description: "You don't have permission to save unavailability periods. Please contact support."
          });
          return;
        }
      }

      // Generic error handling
      toast.error("Error", {
        description: "Failed to save unavailability periods. Please try again later."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format date for display
  const formatDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
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
                {[1, 2].map((_, index) => (
                  <div key={index} className="p-3 flex items-center">
                    <Skeleton className="h-8 w-32 mr-auto" />
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton for save button */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-primary" />
          <span>When are you unavailable?</span>
          {isFirstTimeSetup && (
            <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
              New Setup
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          Set specific periods when you're unavailable for meetings, such as vacations, holidays, or other commitments.
          These periods will override your regular availability settings.
          {isFirstTimeSetup && (
            <span className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium block">
              Add your unavailability periods to prevent meetings during those times.
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
                  <p>No unavailability periods configured yet.</p>
                  <p className="text-sm">Add your first unavailability period below.</p>
                </div>
              )}

              {/* Unavailability periods list */}
              {fields.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Your Unavailability Periods</h3>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-xs font-medium">Start Date/Time</th>
                          <th className="text-left p-3 text-xs font-medium">End Date/Time</th>
                          <th className="text-left p-3 text-xs font-medium">Reason</th>
                          <th className="text-right p-3 text-xs font-medium w-16">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {fields.map((field, index) => (
                          <tr key={field.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center">
                                <Input
                                  type="datetime-local"
                                  value={form.watch(`unavailabilityPeriods.${index}.startDateTime`)}
                                  onChange={(e) => form.setValue(`unavailabilityPeriods.${index}.startDateTime`, e.target.value, { shouldDirty: true })}
                                  className="border-none shadow-none h-8 p-0 bg-transparent"
                                />
                                {form.watch(`unavailabilityPeriods.${index}.startDateTime`) && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {new Date(form.watch(`unavailabilityPeriods.${index}.startDateTime`)).getHours() >= 12 ? 'PM' : 'AM'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <Input
                                  type="datetime-local"
                                  value={form.watch(`unavailabilityPeriods.${index}.endDateTime`)}
                                  onChange={(e) => form.setValue(`unavailabilityPeriods.${index}.endDateTime`, e.target.value, { shouldDirty: true })}
                                  className="border-none shadow-none h-8 p-0 bg-transparent"
                                />
                                {form.watch(`unavailabilityPeriods.${index}.endDateTime`) && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {new Date(form.watch(`unavailabilityPeriods.${index}.endDateTime`)).getHours() >= 12 ? 'PM' : 'AM'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <Input
                                type="text"
                                placeholder="Vacation, holiday, etc."
                                value={form.watch(`unavailabilityPeriods.${index}.reason`) || ""}
                                onChange={(e) => form.setValue(`unavailabilityPeriods.${index}.reason`, e.target.value, { shouldDirty: true })}
                                className="border-none shadow-none h-8 p-0 bg-transparent w-full"
                              />
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={clearAllPeriods}
                      className="text-brand text-xs font-style: italic hover:underline mt-2"
                    >
                      Clear All Periods
                    </button>
                  </div>
                </div>
              )}

              {/* Add period button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUnavailabilityPeriod}
                  className="text-xs"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Unavailability Period
                </Button>
              </div>

              {/* Information alert */}
              <Alert className="bg-muted/50 border-muted">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <AlertDescription className="text-xs text-muted-foreground">
                    Unavailability periods will override your regular availability settings.
                    Others will not be able to schedule meetings with you during these times.
                  </AlertDescription>
                </div>
              </Alert>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                onClick={(e) => {
                  if (!form.formState.isDirty && !isFirstTimeSetup && fields.length > 0) {
                    // Show toast message when trying to save without changes
                    // Only show this message if there are periods and no changes
                    e.preventDefault();
                    toast.info("No Changes Detected", {
                      description: "Please make changes first to update unavailability periods"
                    });
                  } else {
                    // Submit the form if there are changes, it's first time setup, or all periods were cleared
                    form.handleSubmit(onSubmit)(e);
                  }
                }}
                disabled={isSaving}
                className="px-6"
              >
                {isSaving ? "Saving..." : "Save Unavailability"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
