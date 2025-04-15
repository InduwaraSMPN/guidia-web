import { useState, useEffect } from 'react';
import { PageHeading } from '@/components/PageHeading';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Select } from '@/components/ui/Select';
import { Loader2, RefreshCw, Play, Calendar, Clock, Bell, Send, Check, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface SchedulerStatus {
  isRunning: boolean;
  scheduledJobs: {
    name: string;
    nextInvocation: string | null;
  }[];
}

interface NotificationSettings {
  jobDeadlineNotifications: boolean;
  jobExpiryNotifications: boolean;
  profileCompletionNotifications: boolean;
}

interface AnnouncementData {
  message: string;
  targetRoles: string[];
}

interface SystemSettings {
  siteName: string;
  supportEmail: string;
  dateFormat: string;
  maintenanceMode: boolean;
}

export function AdminSettingsPage() {
  const { } = useAuth(); // We'll use this context later if needed
  const [isLoading, setIsLoading] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState('daily');
  const [isRunningTask, setIsRunningTask] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    jobDeadlineNotifications: true,
    jobExpiryNotifications: true,
    profileCompletionNotifications: true
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'Guidia',
    supportEmail: 'support@guidia.com',
    dateFormat: 'd MMMM yyyy',
    maintenanceMode: false
  });
  const [isSavingSystem, setIsSavingSystem] = useState(false);

  // Announcement state
  const [announcement, setAnnouncement] = useState<AnnouncementData>({
    message: '',
    targetRoles: ['Student', 'Counselor', 'Company']
  });
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);

  // Fetch scheduler status
  const fetchSchedulerStatus = async () => {
    setIsLoading(true);
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/scheduler-status`, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scheduler status');
      }

      const data = await response.json();
      setSchedulerStatus(data);
    } catch (error) {
      console.error('Error fetching scheduler status:', error);
      toast.error('Failed to fetch scheduler status');
    } finally {
      setIsLoading(false);
    }
  };

  // Run a scheduled task manually
  const runTask = async (taskType: string) => {
    setIsRunningTask(true);
    try {
      console.log(`Running task: ${taskType}`);
      const headers = await createAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/run-task`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ taskType }),
        credentials: 'include'
      });

      // Parse the response data
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run task');
      }

      console.log('Task response:', data);
      toast.success(`Task ${taskType} executed successfully: ${data.result || ''}`);
      // Refresh scheduler status after running a task
      fetchSchedulerStatus();
    } catch (error) {
      console.error('Error running task:', error);
      toast.error(`Failed to run task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningTask(false);
    }
  };

  // Create auth headers with CSRF token
  const createAuthHeaders = async () => {
    const token = localStorage.getItem('token');
    const csrfToken = localStorage.getItem('csrfToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-CSRF-Token': csrfToken || ''
    };
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    setIsSavingNotifications(true);
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/notification-settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(notificationSettings),
        credentials: 'include' // Important for cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save notification settings');
      }

      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error(`Failed to save notification settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Save system settings
  const saveSystemSettings = async () => {
    setIsSavingSystem(true);
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/system-settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(systemSettings),
        credentials: 'include' // Important for cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save system settings');
      }

      toast.success('System settings saved successfully');
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast.error(`Failed to save system settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingSystem(false);
    }
  };

  // Fetch notification settings
  const fetchNotificationSettings = async () => {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/notification-settings`, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification settings');
      }

      const data = await response.json();
      setNotificationSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      // Don't show error toast here, just use defaults
    }
  };

  // Fetch system settings
  const fetchSystemSettings = async () => {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/system-settings`, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system settings');
      }

      const data = await response.json();
      setSystemSettings(data);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      // Don't show error toast here, just use defaults
    }
  };

  // Send platform announcement
  const sendAnnouncement = async () => {
    if (!announcement.message.trim()) {
      toast.error('Please enter an announcement message');
      return;
    }

    if (announcement.targetRoles.length === 0) {
      toast.error('Please select at least one user role');
      return;
    }

    setIsSendingAnnouncement(true);
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/send-announcement`, {
        method: 'POST',
        headers,
        body: JSON.stringify(announcement),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send announcement');
      }

      const data = await response.json();
      toast.success(`Announcement sent to ${data.recipientCount} users`);

      // Reset the form
      setAnnouncement({
        message: '',
        targetRoles: ['Student', 'Counselor', 'Company']
      });
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error(`Failed to send announcement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  // Handle role checkbox change
  const handleRoleChange = (role: string, checked: boolean) => {
    setAnnouncement(prev => {
      if (checked) {
        return { ...prev, targetRoles: [...prev.targetRoles, role] };
      } else {
        return { ...prev, targetRoles: prev.targetRoles.filter(r => r !== role) };
      }
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchSchedulerStatus();
    fetchNotificationSettings();
    fetchSystemSettings();
  }, []);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get task icon based on task name
  const getTaskIcon = (taskName: string) => {
    if (taskName.includes('deadline')) return <Calendar className="h-4 w-4" />;
    if (taskName.includes('expiring')) return <Clock className="h-4 w-4" />;
    if (taskName.includes('notification')) return <Bell className="h-4 w-4" />;
    return <RefreshCw className="h-4 w-4" />;
  };

  // Render skeleton UI when initially loading
  if (isLoading && !schedulerStatus) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="mb-4">
          <Skeleton className="h-10 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-5 w-40 mt-4" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-secondary p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-32 ml-auto" />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="pt-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <PageHeading title="Admin Settings" subtitle="Manage system settings and scheduled tasks" />

      <Tabs defaultValue="scheduler" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="scheduler">Task Scheduler</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduler">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduler Status</CardTitle>
                <CardDescription>Current status of the task scheduler</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 text-brand animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading scheduler status...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scheduler-status">Scheduler Active</Label>
                      <Switch
                        id="scheduler-status"
                        checked={schedulerStatus?.isRunning || false}
                        disabled
                      />
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Scheduled Jobs</h4>
                      <div className="space-y-2">
                        {schedulerStatus?.scheduledJobs.length === 0 && (
                          <p className="text-sm text-muted-foreground">No scheduled jobs found</p>
                        )}
                        {schedulerStatus?.scheduledJobs.map((job, index) => (
                          <div key={index} className="bg-secondary p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              {getTaskIcon(job.name)}
                              <span className="text-sm font-medium">{job.name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Next run: {formatDate(job.nextInvocation)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSchedulerStatus}
                  disabled={isLoading}
                  className="ml-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Run Tasks Manually</CardTitle>
                <CardDescription>Execute scheduled tasks on demand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-select" className="mb-2 block">Select Task</Label>
                    <Select
                      options={[
                        { value: 'daily', label: 'Daily Tasks' },
                        { value: 'weekly', label: 'Weekly Tasks' },
                        { value: 'deadlineReminders', label: 'Job Application Deadline Reminders' },
                        { value: 'expiringJobs', label: 'Check Expiring Jobs' },
                        { value: 'incompleteProfiles', label: 'Check Incomplete Profiles' },
                        { value: 'jobStats', label: 'Send Job Posting Stats' }
                      ]}
                      value={{
                        value: selectedTask,
                        label: selectedTask === 'daily' ? 'Daily Tasks' :
                               selectedTask === 'weekly' ? 'Weekly Tasks' :
                               selectedTask === 'deadlineReminders' ? 'Job Application Deadline Reminders' :
                               selectedTask === 'expiringJobs' ? 'Check Expiring Jobs' :
                               selectedTask === 'incompleteProfiles' ? 'Check Incomplete Profiles' :
                               'Send Job Posting Stats'
                      }}
                      onChange={(option) => option && setSelectedTask(option.value)}
                      placeholder="Select a task"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => runTask(selectedTask)}
                      disabled={isRunningTask}
                      className="w-full"
                    >
                      {isRunningTask ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running Task...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run Task Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system-wide notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="job-deadline-notifications" className="block">Job Deadline Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send reminders for approaching job application deadlines</p>
                  </div>
                  <Switch
                    id="job-deadline-notifications"
                    checked={notificationSettings.jobDeadlineNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, jobDeadlineNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="job-expiry-notifications" className="block">Job Expiry Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify companies when their job postings are about to expire</p>
                  </div>
                  <Switch
                    id="job-expiry-notifications"
                    checked={notificationSettings.jobExpiryNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, jobExpiryNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-completion-notifications" className="block">Profile Completion Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind users to complete their profiles</p>
                  </div>
                  <Switch
                    id="profile-completion-notifications"
                    checked={notificationSettings.profileCompletionNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, profileCompletionNotifications: checked }))}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="ml-auto"
                onClick={saveNotificationSettings}
                disabled={isSavingNotifications}
              >
                {isSavingNotifications ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Send Platform Announcement</CardTitle>
              <CardDescription>Send announcements to all users or specific user types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="announcement-message" className="block mb-2">Announcement Message</Label>
                  <Textarea
                    id="announcement-message"
                    placeholder="Enter your announcement message here..."
                    value={announcement.message}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                    className="min-h-[120px]"
                  />
                </div>

                <div>
                  <Label className="block mb-2">Send To</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant={announcement.targetRoles.includes('Student') ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRoleChange('Student', !announcement.targetRoles.includes('Student'))}
                      className={`text-sm w-full text-left h-auto py-3 px-4 justify-between group transition-all duration-200 ${announcement.targetRoles.includes('Student') ? 'bg-brand text-white' : 'text-brand hover:bg-brand-dark hover:text-white'}`}
                    >
                      <span>Students</span>
                      {announcement.targetRoles.includes('Student') ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant={announcement.targetRoles.includes('Counselor') ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRoleChange('Counselor', !announcement.targetRoles.includes('Counselor'))}
                      className={`text-sm w-full text-left h-auto py-3 px-4 justify-between group transition-all duration-200 ${announcement.targetRoles.includes('Counselor') ? 'bg-brand text-white' : 'text-brand hover:bg-brand-dark hover:text-white'}`}
                    >
                      <span>Counselors</span>
                      {announcement.targetRoles.includes('Counselor') ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant={announcement.targetRoles.includes('Company') ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRoleChange('Company', !announcement.targetRoles.includes('Company'))}
                      className={`text-sm w-full text-left h-auto py-3 px-4 justify-between group transition-all duration-200 ${announcement.targetRoles.includes('Company') ? 'bg-brand text-white' : 'text-brand hover:bg-brand-dark hover:text-white'}`}
                    >
                      <span>Companies</span>
                      {announcement.targetRoles.includes('Company') ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="ml-auto"
                onClick={sendAnnouncement}
                disabled={isSendingAnnouncement}
              >
                {isSendingAnnouncement ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Announcement
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="site-name" className="block mb-2">Site Name</Label>
                  <Input
                    id="site-name"
                    value={systemSettings.siteName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="support-email" className="block mb-2">Support Email</Label>
                  <Input
                    id="support-email"
                    value={systemSettings.supportEmail}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="date-format" className="block mb-2">Default Date Format</Label>
                  <Select
                    options={[
                      { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (04/09/2025)' },
                      { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (09/04/2025)' },
                      { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (2025-04-09)' },
                      { value: 'd MMMM yyyy', label: 'D MMMM YYYY (9 April 2025)' },
                      { value: 'MMMM d, yyyy', label: 'MMMM D, YYYY (April 9, 2025)' }
                    ]}
                    value={{
                      value: systemSettings.dateFormat,
                      label: systemSettings.dateFormat === 'MM/dd/yyyy' ? 'MM/DD/YYYY (04/09/2025)' :
                             systemSettings.dateFormat === 'dd/MM/yyyy' ? 'DD/MM/YYYY (09/04/2025)' :
                             systemSettings.dateFormat === 'yyyy-MM-dd' ? 'YYYY-MM-DD (2025-04-09)' :
                             systemSettings.dateFormat === 'd MMMM yyyy' ? 'D MMMM YYYY (9 April 2025)' :
                             'MMMM D, YYYY (April 9, 2025)'
                    }}
                    onChange={(option) => option && setSystemSettings(prev => ({ ...prev, dateFormat: option.value }))}
                    placeholder="Select date format"
                  />
                </div>

                <div>
                  <Label htmlFor="maintenance-mode" className="block">Maintenance Mode</Label>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                    <Switch
                      id="maintenance-mode"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="ml-auto"
                onClick={saveSystemSettings}
                disabled={isSavingSystem}
              >
                {isSavingSystem ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


