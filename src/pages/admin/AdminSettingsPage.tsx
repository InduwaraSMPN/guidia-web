import { useState, useEffect } from 'react';
import { PageHeading } from '@/components/PageHeading';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { Loader2, RefreshCw, Play, Calendar, Clock, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SchedulerStatus {
  isRunning: boolean;
  scheduledJobs: {
    name: string;
    nextInvocation: string | null;
  }[];
}

export function AdminSettingsPage() {
  const { } = useAuth(); // We'll use this context later if needed
  const [isLoading, setIsLoading] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState('daily');
  const [isRunningTask, setIsRunningTask] = useState(false);

  // Fetch scheduler status
  const fetchSchedulerStatus = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/scheduler-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/run-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to run task');
      }

      toast.success(`Task ${taskType} executed successfully`);
      // Refresh scheduler status after running a task
      fetchSchedulerStatus();
    } catch (error) {
      console.error('Error running task:', error);
      toast.error(`Failed to run task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunningTask(false);
    }
  };

  // Load scheduler status on component mount
  useEffect(() => {
    fetchSchedulerStatus();
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

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <PageHeading title="Admin Settings" subtitle="Manage system settings and scheduled tasks" />

      <Tabs defaultValue="scheduler" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="scheduler">Task Scheduler</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
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
                    <Loader2 className="h-6 w-6 text-[#800020] animate-spin" />
                    <span className="ml-2 text-sm text-gray-600">Loading scheduler status...</span>
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
                          <p className="text-sm text-gray-500">No scheduled jobs found</p>
                        )}
                        {schedulerStatus?.scheduledJobs.map((job, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              {getTaskIcon(job.name)}
                              <span className="text-sm font-medium">{job.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
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
                    <p className="text-sm text-gray-500">Send reminders for approaching job application deadlines</p>
                  </div>
                  <Switch id="job-deadline-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="job-expiry-notifications" className="block">Job Expiry Notifications</Label>
                    <p className="text-sm text-gray-500">Notify companies when their job postings are about to expire</p>
                  </div>
                  <Switch id="job-expiry-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-completion-notifications" className="block">Profile Completion Reminders</Label>
                    <p className="text-sm text-gray-500">Remind users to complete their profiles</p>
                  </div>
                  <Switch id="profile-completion-notifications" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Settings</Button>
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
                  <Input id="site-name" defaultValue="Guidia" />
                </div>

                <div>
                  <Label htmlFor="support-email" className="block mb-2">Support Email</Label>
                  <Input id="support-email" defaultValue="support@guidia.com" />
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
                      value: 'd MMMM yyyy',
                      label: 'D MMMM YYYY (9 April 2025)'
                    }}
                    onChange={() => {}}
                    placeholder="Select date format"
                  />
                </div>

                <div>
                  <Label htmlFor="maintenance-mode" className="block">Maintenance Mode</Label>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-500">Put the site in maintenance mode</p>
                    <Switch id="maintenance-mode" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
