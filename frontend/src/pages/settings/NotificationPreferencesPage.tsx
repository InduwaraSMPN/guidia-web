import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { API_URL } from "@/config"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Mail, BellOff, AlertTriangle } from "lucide-react" // AlertTriangle is already imported
import { secureApiRequest } from "@/lib/tokenHelper"

interface NotificationPreference {
  preferenceID?: number
  userID?: number
  notificationType: string
  isEnabled: boolean
  emailEnabled: boolean
  pushEnabled: boolean
}

interface CategoryPreference {
  preferenceID?: number
  userID?: number
  category: string
  isEnabled: boolean
  emailEnabled: boolean
  pushEnabled: boolean
}

// Group notification types by category
const notificationCategories = {
  JOBS: [
    { type: 'NEW_JOB_POSTING', label: 'New Job Postings' },
    { type: 'JOB_APPLICATION_UPDATE', label: 'Job Application Updates' },
    { type: 'JOB_APPLICATION_DEADLINE', label: 'Job Application Deadlines' },
    { type: 'JOB_POSTING_EXPIRING', label: 'Job Posting Expiring' },
    { type: 'JOB_POSTING_STATS', label: 'Job Posting Statistics' },
    { type: 'NEW_JOB_APPLICATION', label: 'New Job Applications' },
    { type: 'STUDENT_JOB_APPLICATION', label: 'Student Job Applications' },
    { type: 'JOB_POSTING_REVIEW', label: 'Job Posting Reviews' },
  ],
  PROFILE: [
    { type: 'PROFILE_VIEW', label: 'Profile Views' },
    { type: 'PROFILE_INCOMPLETE', label: 'Profile Completion Reminders' },
    { type: 'PROFILE_UPDATE', label: 'Profile Updates' },
    { type: 'RECOMMENDED_PROFILE', label: 'Recommended Profiles' },
    { type: 'STUDENT_PROFILE_UPDATE', label: 'Student Profile Updates' },
  ],
  MESSAGES: [
    { type: 'NEW_MESSAGE', label: 'New Messages' },
    { type: 'UNREAD_MESSAGES', label: 'Unread Message Reminders' },
    { type: 'GUIDANCE_REQUEST', label: 'Guidance Requests' },
  ],
  MEETINGS: [
    { type: 'MEETING_REQUESTED', label: 'Meeting Requests' },
    { type: 'MEETING_ACCEPTED', label: 'Meeting Acceptances' },
    { type: 'MEETING_DECLINED', label: 'Meeting Declines' },
    { type: 'MEETING_REMINDER', label: 'Meeting Reminders' },
    { type: 'MEETING_FEEDBACK_REQUEST', label: 'Meeting Feedback Requests' },
  ],
  SYSTEM: [
    { type: 'SECURITY_ALERT', label: 'Security Alerts' },
    { type: 'SYSTEM_UPDATE', label: 'System Updates' },
    { type: 'PLATFORM_ANNOUNCEMENT', label: 'Platform Announcements' },
    { type: 'ACCOUNT_NOTIFICATION', label: 'Account Notifications' },
    { type: 'USER_ACCOUNT_ISSUE', label: 'User Account Issues' },
  ],
  ADMIN: [
    { type: 'NEW_USER_REGISTRATION', label: 'New User Registrations' },
    { type: 'VERIFICATION_REQUEST', label: 'Verification Requests' },
    { type: 'REPORTED_CONTENT', label: 'Reported Content' },
    { type: 'SYSTEM_HEALTH_ALERT', label: 'System Health Alerts' },
    { type: 'PERFORMANCE_METRIC', label: 'Performance Metrics' },
    { type: 'SUPPORT_REQUEST', label: 'Support Requests' },
  ]
}

// Map notification types to categories
const notificationTypeToCategory: Record<string, string> = {};
Object.entries(notificationCategories).forEach(([category, items]) => {
  items.forEach(item => {
    notificationTypeToCategory[item.type] = category;
  });
});

export function NotificationPreferencesPage() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [categoryPreferences, setCategoryPreferences] = useState<CategoryPreference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(() => {
    // Make sure we don't try to select a tab that no longer exists
    const savedTab = localStorage.getItem('notification-active-tab')
    return savedTab && ['JOBS', 'PROFILE', 'MESSAGES', 'MEETINGS'].includes(savedTab) ? savedTab : 'JOBS'
  })
  const [useCategories, setUseCategories] = useState(true)

  // Fetch notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Always fetch both types of preferences for completeness
        let categoryPrefsData: CategoryPreference[] = [];
        let individualPrefsData: NotificationPreference[] = [];

        // First fetch category preferences
        try {
          const categoryResponse = await secureApiRequest(`${API_URL}/api/notifications/category-preferences`);
          if (categoryResponse.ok) {
            categoryPrefsData = await categoryResponse.json();
            setCategoryPreferences(categoryPrefsData);
            console.log("Fetched category preferences:", categoryPrefsData.length);
            setUseCategories(true);
          } else {
            console.error("Failed to fetch category preferences:", categoryResponse.status);
            setUseCategories(false);
          }
        } catch (categoryError) {
          console.error("Error fetching category preferences:", categoryError);
          setUseCategories(false);
        }

        // Then fetch individual preferences
        try {
          const individualResponse = await secureApiRequest(`${API_URL}/api/notifications/preferences`);
          if (individualResponse.ok) {
            individualPrefsData = await individualResponse.json();
            console.log("Fetched individual preferences:", individualPrefsData.length);
          } else {
            console.error("Failed to fetch individual preferences:", individualResponse.status);
          }
        } catch (individualError) {
          console.error("Error fetching individual preferences:", individualError);
        }

        // If using categories, expand category preferences to individual preferences for UI
        if (useCategories && categoryPrefsData.length > 0) {
          const expandedPrefs: NotificationPreference[] = [];

          Object.entries(notificationCategories).forEach(([category, items]) => {
            const categoryPref = categoryPrefsData.find((p: CategoryPreference) => p.category === category) || {
              isEnabled: true,
              emailEnabled: true,
              pushEnabled: true
            };

            items.forEach(item => {
              // First check if we have an individual preference for this type
              const individualPref = individualPrefsData.find(p => p.notificationType === item.type);

              if (individualPref) {
                // Use the individual preference if it exists
                expandedPrefs.push(individualPref);
              } else {
                // Otherwise derive from category preference
                expandedPrefs.push({
                  notificationType: item.type,
                  isEnabled: categoryPref.isEnabled,
                  emailEnabled: categoryPref.emailEnabled,
                  pushEnabled: categoryPref.pushEnabled
                });
              }
            });
          });

          setPreferences(expandedPrefs);
        } else if (individualPrefsData.length > 0) {
          // If not using categories or no category data, use individual preferences directly
          setPreferences(individualPrefsData);
        } else {
          // If no data from either source, use defaults
          console.log("No preference data found, using defaults");

          // Create default preferences
          const defaultCategoryPrefs = Object.keys(notificationCategories).map(category => ({
            category,
            isEnabled: true,
            emailEnabled: true,
            pushEnabled: true
          }));

          setCategoryPreferences(defaultCategoryPrefs);

          // Create expanded preferences
          const expandedPrefs: NotificationPreference[] = [];
          Object.entries(notificationCategories).forEach(([category, items]) => {
            items.forEach(item => {
              expandedPrefs.push({
                notificationType: item.type,
                isEnabled: true,
                emailEnabled: true,
                pushEnabled: true
              });
            });
          });

          setPreferences(expandedPrefs);
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        toast.error("Failed to load notification preferences");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreferences();
  }, [user])

  // Update a notification preference
  const updatePreference = async (notificationType: string, field: 'isEnabled' | 'emailEnabled' | 'pushEnabled', value: boolean) => {
    if (!user) return

    // Get the category for this notification type
    const category = notificationTypeToCategory[notificationType]

    if (useCategories && category) {
      // Update the category preference
      await updateCategoryPreference(category, field, value)
    } else {
      // Optimistically update UI for individual preference
      setPreferences(prev =>
        prev.map(pref =>
          pref.notificationType === notificationType
            ? { ...pref, [field]: value }
            : pref
        )
      )

      try {
        setIsSaving(true)

        const payload: any = { notificationType }
        payload[field] = value

        const response = await secureApiRequest(
          `${API_URL}/api/notifications/preferences`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          }
        )

        if (!response.ok) {
          console.error(`Failed to update preference: Status ${response.status}`);
          throw new Error(`Failed to update preference: Status ${response.status}`);
        }

        toast.success("Notification preference updated");
      } catch (error) {
        console.error("Error updating notification preference:", error);
        toast.error("Failed to update notification preference");

        // Revert the change in UI
        setPreferences(prev =>
          prev.map(pref =>
            pref.notificationType === notificationType
              ? { ...pref, [field]: !value }
              : pref
          )
        );

        // Try to fetch fresh data to ensure UI is in sync
        try {
          const response = await secureApiRequest(`${API_URL}/api/notifications/preferences`);
          if (response.ok) {
            const data = await response.json();
            setPreferences(data);
          }
        } catch (syncError) {
          console.error("Error syncing preferences after failure:", syncError);
        }
      } finally {
        setIsSaving(false);
      }
    }
  }

  // Update a category preference
  const updateCategoryPreference = async (category: string, field: 'isEnabled' | 'emailEnabled' | 'pushEnabled', value: boolean) => {
    if (!user) return

    // Optimistically update UI for category
    setCategoryPreferences(prev =>
      prev.map(pref =>
        pref.category === category
          ? { ...pref, [field]: value }
          : pref
      )
    )

    // Also update all individual preferences in this category
    setPreferences(prev =>
      prev.map(pref =>
        notificationTypeToCategory[pref.notificationType] === category
          ? { ...pref, [field]: value }
          : pref
      )
    )

    try {
      setIsSaving(true)

      const payload = {
        category,
        [field]: value
      }

      const response = await secureApiRequest(
        `${API_URL}/api/notifications/category-preferences`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        console.error(`Failed to update category preference: Status ${response.status}`);
        throw new Error(`Failed to update category preference: Status ${response.status}`);
      }

      toast.success("Notification preferences updated");
    } catch (error) {
      console.error("Error updating category preference:", error);
      toast.error("Failed to update notification preferences");

      // Revert the change in UI
      setCategoryPreferences(prev =>
        prev.map(pref =>
          pref.category === category
            ? { ...pref, [field]: !value }
            : pref
        )
      );

      // Also revert individual preferences
      setPreferences(prev =>
        prev.map(pref =>
          notificationTypeToCategory[pref.notificationType] === category
            ? { ...pref, [field]: !value }
            : pref
        )
      );

      // Try to fetch fresh data to ensure UI is in sync
      try {
        const response = await secureApiRequest(`${API_URL}/api/notifications/category-preferences`);
        if (response.ok) {
          const data = await response.json();
          setCategoryPreferences(data);

          // Update individual preferences for UI consistency
          const expandedPrefs: NotificationPreference[] = [];
          Object.entries(notificationCategories).forEach(([cat, items]) => {
            const categoryPref = data.find((p: CategoryPreference) => p.category === cat) || {
              isEnabled: true,
              emailEnabled: true,
              pushEnabled: true
            };

            items.forEach(item => {
              expandedPrefs.push({
                notificationType: item.type,
                isEnabled: categoryPref.isEnabled,
                emailEnabled: categoryPref.emailEnabled,
                pushEnabled: categoryPref.pushEnabled
              });
            });
          });

          setPreferences(expandedPrefs);
        }
      } catch (syncError) {
        console.error("Error syncing preferences after failure:", syncError);
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Get preference for a notification type
  const getPreference = (notificationType: string) => {
    return preferences.find(pref => pref.notificationType === notificationType) || {
      notificationType,
      isEnabled: true,
      emailEnabled: true,
      pushEnabled: true
    }
  }

  // Get category preference (used for debugging)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getCategoryPreference = (category: string) => {
    return categoryPreferences.find(pref => pref.category === category) || {
      category,
      isEnabled: true,
      emailEnabled: true,
      pushEnabled: true
    }
  }

  // Disable all notifications
  const disableAllNotifications = async () => {
    if (!user) return

    if (!confirm("Are you sure you want to disable all notifications? You won't receive any notifications until you enable them again.")) {
      return
    }

    setIsSaving(true)
    let hasErrors = false;

    try {
      if (useCategories) {
        // Update all category preferences in UI first
        setCategoryPreferences(prev =>
          prev.map(pref => ({ ...pref, isEnabled: false }))
        )

        // Also update individual preferences for UI consistency
        setPreferences(prev =>
          prev.map(pref => ({ ...pref, isEnabled: false }))
        )

        // Make API calls for each category sequentially instead of in parallel
        for (const pref of categoryPreferences) {
          try {
            const response = await secureApiRequest(
              `${API_URL}/api/notifications/category-preferences`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  category: pref.category,
                  isEnabled: false
                })
              }
            )

            if (!response.ok) {
              console.error(`Error updating category ${pref.category}: Status ${response.status}`);
              hasErrors = true;
            }

            // Add a small delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (categoryError) {
            console.error(`Error updating category ${pref.category}:`, categoryError);
            hasErrors = true;
            // Continue with other categories even if one fails
          }
        }
      } else {
        // Update all preferences in UI first
        setPreferences(prev =>
          prev.map(pref => ({ ...pref, isEnabled: false }))
        )

        // Make API calls for each preference sequentially instead of in parallel
        for (const pref of preferences) {
          try {
            const response = await secureApiRequest(
              `${API_URL}/api/notifications/preferences`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  notificationType: pref.notificationType,
                  isEnabled: false
                })
              }
            )

            if (!response.ok) {
              console.error(`Error updating preference ${pref.notificationType}: Status ${response.status}`);
              hasErrors = true;
            }

            // Add a small delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (prefError) {
            console.error(`Error updating preference ${pref.notificationType}:`, prefError);
            hasErrors = true;
            // Continue with other preferences even if one fails
          }
        }
      }

      if (hasErrors) {
        toast.warning("Some notifications could not be disabled. UI may not reflect actual settings.");
      } else {
        toast.success("All notifications disabled");
      }
    } catch (error) {
      console.error("Error disabling all notifications:", error);
      toast.error("Failed to disable all notifications");

      // Fetch fresh data to ensure UI is in sync
      try {
        if (useCategories) {
          const response = await secureApiRequest(`${API_URL}/api/notifications/category-preferences`);
          if (response.ok) {
            const data = await response.json();
            setCategoryPreferences(data);

            // Update individual preferences for UI consistency
            const expandedPrefs: NotificationPreference[] = [];

            Object.entries(notificationCategories).forEach(([category, items]) => {
              const categoryPref = data.find((p: CategoryPreference) => p.category === category) || {
                isEnabled: true,
                emailEnabled: true,
                pushEnabled: true
              };

              items.forEach(item => {
                expandedPrefs.push({
                  notificationType: item.type,
                  isEnabled: categoryPref.isEnabled,
                  emailEnabled: categoryPref.emailEnabled,
                  pushEnabled: categoryPref.pushEnabled
                });
              });
            });

            setPreferences(expandedPrefs);
          }
        } else {
          const response = await secureApiRequest(`${API_URL}/api/notifications/preferences`);
          if (response.ok) {
            const data = await response.json();
            setPreferences(data);
          }
        }
      } catch (syncError) {
        console.error("Error syncing preferences after failure:", syncError);
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Enable all notifications
  const enableAllNotifications = async () => {
    if (!user) return

    setIsSaving(true)
    let hasErrors = false;

    try {
      if (useCategories) {
        // Update all category preferences in UI first
        setCategoryPreferences(prev =>
          prev.map(pref => ({ ...pref, isEnabled: true }))
        )

        // Also update individual preferences for UI consistency
        setPreferences(prev =>
          prev.map(pref => ({ ...pref, isEnabled: true }))
        )

        // Make API calls for each category sequentially instead of in parallel
        for (const pref of categoryPreferences) {
          try {
            const response = await secureApiRequest(
              `${API_URL}/api/notifications/category-preferences`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  category: pref.category,
                  isEnabled: true
                })
              }
            )

            if (!response.ok) {
              console.error(`Error updating category ${pref.category}: Status ${response.status}`);
              hasErrors = true;
            }

            // Add a small delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (categoryError) {
            console.error(`Error updating category ${pref.category}:`, categoryError);
            hasErrors = true;
            // Continue with other categories even if one fails
          }
        }
      } else {
        // Update all preferences in UI first
        setPreferences(prev =>
          prev.map(pref => ({ ...pref, isEnabled: true }))
        )

        // Make API calls for each preference sequentially instead of in parallel
        for (const pref of preferences) {
          try {
            const response = await secureApiRequest(
              `${API_URL}/api/notifications/preferences`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  notificationType: pref.notificationType,
                  isEnabled: true
                })
              }
            )

            if (!response.ok) {
              console.error(`Error updating preference ${pref.notificationType}: Status ${response.status}`);
              hasErrors = true;
            }

            // Add a small delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (prefError) {
            console.error(`Error updating preference ${pref.notificationType}:`, prefError);
            hasErrors = true;
            // Continue with other preferences even if one fails
          }
        }
      }

      if (hasErrors) {
        toast.warning("Some notifications could not be enabled. UI may not reflect actual settings.");
      } else {
        toast.success("All notifications enabled");
      }
    } catch (error) {
      console.error("Error enabling all notifications:", error);
      toast.error("Failed to enable all notifications");

      // Fetch fresh data to ensure UI is in sync
      try {
        if (useCategories) {
          const response = await secureApiRequest(`${API_URL}/api/notifications/category-preferences`);
          if (response.ok) {
            const data = await response.json();
            setCategoryPreferences(data);

            // Update individual preferences for UI consistency
            const expandedPrefs: NotificationPreference[] = [];

            Object.entries(notificationCategories).forEach(([category, items]) => {
              const categoryPref = data.find((p: CategoryPreference) => p.category === category) || {
                isEnabled: true,
                emailEnabled: true,
                pushEnabled: true
              };

              items.forEach(item => {
                expandedPrefs.push({
                  notificationType: item.type,
                  isEnabled: categoryPref.isEnabled,
                  emailEnabled: categoryPref.emailEnabled,
                  pushEnabled: categoryPref.pushEnabled
                });
              });
            });

            setPreferences(expandedPrefs);
          }
        } else {
          const response = await secureApiRequest(`${API_URL}/api/notifications/preferences`);
          if (response.ok) {
            const data = await response.json();
            setPreferences(data);
          }
        }
      } catch (syncError) {
        console.error("Error syncing preferences after failure:", syncError);
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Render notification preference item
  const renderPreferenceItem = (type: string, label: string) => {
    const pref = getPreference(type)

    return (
      <div key={type} className="flex flex-col space-y-4 py-4 border-b last:border-0">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h4 className="text-sm font-medium">{label}</h4>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id={`${type}-email`}
                checked={pref.emailEnabled}
                onCheckedChange={(checked) => updatePreference(type, 'emailEnabled', checked)}
                disabled={!pref.isEnabled || isSaving}
              />
              <label htmlFor={`${type}-email`} className="text-xs text-muted-foreground">
                <Mail className="h-4 w-4" />
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`${type}-push`}
                checked={pref.pushEnabled}
                onCheckedChange={(checked) => updatePreference(type, 'pushEnabled', checked)}
                disabled={!pref.isEnabled || isSaving}
              />
              <label htmlFor={`${type}-push`} className="text-xs text-muted-foreground">
                <Bell className="h-4 w-4" />
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`${type}-enabled`}
                checked={pref.isEnabled}
                onCheckedChange={(checked) => updatePreference(type, 'isEnabled', checked)}
                disabled={isSaving}
              />
              <label htmlFor={`${type}-enabled`} className="text-xs text-muted-foreground">
                All
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container py-8 pt-32 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="py-4 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-48" />
                      <div className="flex items-center space-x-6">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 pt-32 pb-32">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose which notifications you want to receive and how you want to receive them.
            </CardDescription>
            {/* BETA WARNING MESSAGE START */}
            <div className="mt-4 mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm font-medium">
                  This feature is currently in beta. Some functionalities may not work as expected or could change in the future.
                </p>
              </div>
            </div>
            {/* BETA WARNING MESSAGE END */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Bell className="h-4 w-4" />
                  <span>Push</span>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <span>All</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enableAllNotifications}
                  disabled={isSaving}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Enable All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disableAllNotifications}
                  disabled={isSaving}
                >
                  <BellOff className="h-4 w-4 mr-1" />
                  Disable All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="JOBS"
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value)
                localStorage.setItem('notification-active-tab', value)
              }}
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="JOBS">Jobs</TabsTrigger>
                <TabsTrigger value="PROFILE">Profile</TabsTrigger>
                <TabsTrigger value="MESSAGES">Messages</TabsTrigger>
                <TabsTrigger value="MEETINGS">Meetings</TabsTrigger>
              </TabsList>

              <TabsContent value="JOBS" className="space-y-4">
                {notificationCategories.JOBS.map(({ type, label }) =>
                  renderPreferenceItem(type, label)
                )}
              </TabsContent>

              <TabsContent value="PROFILE" className="space-y-4">
                {notificationCategories.PROFILE.map(({ type, label }) =>
                  renderPreferenceItem(type, label)
                )}
              </TabsContent>

              <TabsContent value="MESSAGES" className="space-y-4">
                {notificationCategories.MESSAGES.map(({ type, label }) =>
                  renderPreferenceItem(type, label)
                )}
              </TabsContent>

              <TabsContent value="MEETINGS" className="space-y-4">
                {notificationCategories.MEETINGS.map(({ type, label }) =>
                  renderPreferenceItem(type, label)
                )}
              </TabsContent>


            </Tabs>

            {preferences.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No notification preferences found</h3>
                <p className="text-muted-foreground mt-2">
                  Your notification preferences couldn't be loaded. Please try refreshing the page.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}