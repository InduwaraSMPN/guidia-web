"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { API_URL } from "@/config"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Mail, BellOff, AlertTriangle } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("JOBS")
  const [useCategories, setUseCategories] = useState(true)

  // Fetch notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // First try to fetch category preferences
        const categoryResponse = await secureApiRequest(`${API_URL}/api/notifications/category-preferences`)

        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json()
          setCategoryPreferences(categoryData)
          setUseCategories(true)

          // Convert category preferences to individual preferences for compatibility
          const expandedPrefs: NotificationPreference[] = []

          Object.entries(notificationCategories).forEach(([category, items]) => {
            const categoryPref = categoryData.find((p: CategoryPreference) => p.category === category) || {
              isEnabled: true,
              emailEnabled: true,
              pushEnabled: true
            }

            items.forEach(item => {
              expandedPrefs.push({
                notificationType: item.type,
                isEnabled: categoryPref.isEnabled,
                emailEnabled: categoryPref.emailEnabled,
                pushEnabled: categoryPref.pushEnabled
              })
            })
          })

          setPreferences(expandedPrefs)
        } else {
          // Fall back to individual preferences
          const response = await secureApiRequest(`${API_URL}/api/notifications/preferences`)

          if (!response.ok) {
            throw new Error("Failed to fetch notification preferences")
          }

          const data = await response.json()
          setPreferences(data)
          setUseCategories(false)
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error)
        toast.error("Failed to load notification preferences")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
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
          throw new Error("Failed to update preference")
        }

        toast.success("Notification preference updated")
      } catch (error) {
        console.error("Error updating notification preference:", error)
        toast.error("Failed to update notification preference")

        // Revert the change in UI
        setPreferences(prev =>
          prev.map(pref =>
            pref.notificationType === notificationType
              ? { ...pref, [field]: !value }
              : pref
          )
        )
      } finally {
        setIsSaving(false)
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
        throw new Error("Failed to update category preference")
      }

      toast.success("Notification preferences updated")
    } catch (error) {
      console.error("Error updating category preference:", error)
      toast.error("Failed to update notification preferences")

      // Revert the change in UI
      setCategoryPreferences(prev =>
        prev.map(pref =>
          pref.category === category
            ? { ...pref, [field]: !value }
            : pref
        )
      )

      // Also revert individual preferences
      setPreferences(prev =>
        prev.map(pref =>
          notificationTypeToCategory[pref.notificationType] === category
            ? { ...pref, [field]: !value }
            : pref
        )
      )
    } finally {
      setIsSaving(false)
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

  // Get category preference
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

        // Make API calls for each category
        const promises = categoryPreferences.map(pref =>
          secureApiRequest(
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
        )

        await Promise.all(promises)
      } else {
        // Update all preferences in UI first
        setPreferences(prev =>
          prev.map(pref => ({ ...pref, isEnabled: false }))
        )

        // Make API calls for each preference
        const promises = preferences.map(pref =>
          secureApiRequest(
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
        )

        await Promise.all(promises)
      }

      toast.success("All notifications disabled")
    } catch (error) {
      console.error("Error disabling all notifications:", error)
      toast.error("Failed to disable all notifications")

      // Fetch fresh data to ensure UI is in sync
      if (useCategories) {
        const response = await secureApiRequest(`${API_URL}/api/notifications/category-preferences`)
        if (response.ok) {
          const data = await response.json()
          setCategoryPreferences(data)

          // Update individual preferences for UI consistency
          const expandedPrefs: NotificationPreference[] = []

          Object.entries(notificationCategories).forEach(([category, items]) => {
            const categoryPref = data.find((p: CategoryPreference) => p.category === category) || {
              isEnabled: true,
              emailEnabled: true,
              pushEnabled: true
            }

            items.forEach(item => {
              expandedPrefs.push({
                notificationType: item.type,
                isEnabled: categoryPref.isEnabled,
                emailEnabled: categoryPref.emailEnabled,
                pushEnabled: categoryPref.pushEnabled
              })
            })
          })

          setPreferences(expandedPrefs)
        }
      } else {
        const response = await secureApiRequest(`${API_URL}/api/notifications/preferences`)
        if (response.ok) {
          const data = await response.json()
          setPreferences(data)
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Enable all notifications
  const enableAllNotifications = async () => {
    if (!user) return

    setIsSaving(true)

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

        // Make API calls for each category
        const promises = categoryPreferences.map(pref =>
          secureApiRequest(
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
        )

        await Promise.all(promises)
      } else {
        // Update all preferences in UI first
        setPreferences(prev =>
          prev.map(pref => ({ ...pref, isEnabled: true }))
        )

        // Make API calls for each preference
        const promises = preferences.map(pref =>
          secureApiRequest(
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
        )

        await Promise.all(promises)
      }

      toast.success("All notifications enabled")
    } catch (error) {
      console.error("Error enabling all notifications:", error)
      toast.error("Failed to enable all notifications")

      // Fetch fresh data to ensure UI is in sync
      if (useCategories) {
        const response = await secureApiRequest(`${API_URL}/api/notifications/category-preferences`)
        if (response.ok) {
          const data = await response.json()
          setCategoryPreferences(data)

          // Update individual preferences for UI consistency
          const expandedPrefs: NotificationPreference[] = []

          Object.entries(notificationCategories).forEach(([category, items]) => {
            const categoryPref = data.find((p: CategoryPreference) => p.category === category) || {
              isEnabled: true,
              emailEnabled: true,
              pushEnabled: true
            }

            items.forEach(item => {
              expandedPrefs.push({
                notificationType: item.type,
                isEnabled: categoryPref.isEnabled,
                emailEnabled: categoryPref.emailEnabled,
                pushEnabled: categoryPref.pushEnabled
              })
            })
          })

          setPreferences(expandedPrefs)
        }
      } else {
        const response = await secureApiRequest(`${API_URL}/api/notifications/preferences`)
        if (response.ok) {
          const data = await response.json()
          setPreferences(data)
        }
      }
    } finally {
      setIsSaving(false)
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
      <div className="container py-8">
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
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Notification Preferences</h1>
          <p className="text-muted-foreground">
            Manage how and when you receive notifications from Guidia.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Choose which notifications you want to receive and how you want to receive them.
            </CardDescription>
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
            <Tabs defaultValue="JOBS" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 mb-4">
                <TabsTrigger value="JOBS">Jobs</TabsTrigger>
                <TabsTrigger value="PROFILE">Profile</TabsTrigger>
                <TabsTrigger value="MESSAGES">Messages</TabsTrigger>
                <TabsTrigger value="MEETINGS">Meetings</TabsTrigger>
                <TabsTrigger value="SYSTEM">System</TabsTrigger>
                <TabsTrigger value="ADMIN">Admin</TabsTrigger>
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

              <TabsContent value="SYSTEM" className="space-y-4">
                {notificationCategories.SYSTEM.map(({ type, label }) =>
                  renderPreferenceItem(type, label)
                )}
              </TabsContent>

              <TabsContent value="ADMIN" className="space-y-4">
                {notificationCategories.ADMIN.map(({ type, label }) =>
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
