import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface MeetingAnalyticsProps {
  userId?: number; // Optional: If provided, shows analytics for a specific user
}

interface AnalyticsData {
  totalMeetings: number;
  meetingsByStatus: Array<{ status: string; count: number }>;
  meetingsByType: Array<{ meetingType: string; count: number }>;
  averageSuccessRating: number;
  averagePlatformRating: number;
  busiestDays: Array<{ dayOfWeek: string; count: number }>;
  busiestHours: Array<{ hour: number; count: number }>;
  // User-specific analytics
  averageSuccessRatingGiven?: number;
  averagePlatformRatingGiven?: number;
  averageSuccessRatingReceived?: number;
  upcomingMeetings?: Array<any>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const meetingTypeLabels: Record<string, string> = {
  'student_company': 'Student ↔ Company',
  'student_counselor': 'Student ↔ Counselor',
  'company_counselor': 'Company ↔ Counselor',
  'student_student': 'Student ↔ Student',
  'company_company': 'Company ↔ Company',
  'counselor_counselor': 'Counselor ↔ Counselor',
};

export function MeetingAnalytics({ userId }: MeetingAnalyticsProps) {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) {
        console.log('No token available, skipping analytics fetch');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use the userId from props if provided, otherwise use the current user's ID
        const actualUserId = userId || (user?.id ? parseInt(user.id) : undefined);

        console.log('Fetching analytics with user ID:', actualUserId);

        let url = `${API_URL}/api/meeting/analytics/meetings`;
        if (actualUserId) {
          url = `${API_URL}/api/meeting/analytics/meetings/user/${actualUserId}`;
        }

        console.log('Analytics API URL:', url);

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Analytics API response:', response.data);
        setAnalyticsData(response.data.data || null);
      } catch (error: any) {
        console.error('Error fetching meeting analytics:', error);
        // More detailed error logging
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }

        toast({
          title: 'Error',
          description: 'Failed to fetch meeting analytics. Please try again later.',
          variant: 'destructive',
        });

        // Set analytics data to null to show the no data message
        setAnalyticsData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, userId, user, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-12 h-12 border-4 border-border border-t-brand rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading analytics data...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-muted-foreground">
          No analytics data available. This could be because you haven't had any meetings yet.
        </p>
        <p className="text-muted-foreground">
          Once you have scheduled and completed meetings, you'll see analytics data here.
        </p>
      </div>
    );
  }

  // Format meeting type data for display
  const formattedMeetingTypeData = analyticsData.meetingsByType.map(item => ({
    ...item,
    name: meetingTypeLabels[item.meetingType] || item.meetingType,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{analyticsData.totalMeetings}</CardTitle>
            <CardDescription>Total Meetings</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{typeof analyticsData.averageSuccessRating === 'number' && !isNaN(analyticsData.averageSuccessRating) ? analyticsData.averageSuccessRating.toFixed(1) : '0.0'}</CardTitle>
            <CardDescription>Avg. Meeting Success Rating</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{typeof analyticsData.averagePlatformRating === 'number' && !isNaN(analyticsData.averagePlatformRating) ? analyticsData.averagePlatformRating.toFixed(1) : '0.0'}</CardTitle>
            <CardDescription>Avg. Platform Experience Rating</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {userId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Ratings</CardTitle>
              <CardDescription>Ratings you've given and received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Success Rating Given</p>
                  <p className="text-2xl font-bold">{typeof analyticsData.averageSuccessRatingGiven === 'number' ? analyticsData.averageSuccessRatingGiven.toFixed(1) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Platform Rating Given</p>
                  <p className="text-2xl font-bold">{typeof analyticsData.averagePlatformRatingGiven === 'number' ? analyticsData.averagePlatformRatingGiven.toFixed(1) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Success Rating Received</p>
                  <p className="text-2xl font-bold">{typeof analyticsData.averageSuccessRatingReceived === 'number' ? analyticsData.averageSuccessRatingReceived.toFixed(1) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meetings by Status</CardTitle>
            <CardDescription>Distribution of meetings by status</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.meetingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {analyticsData.meetingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meetings by Type</CardTitle>
            <CardDescription>Distribution of meetings by type</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedMeetingTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                >
                  {formattedMeetingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Busiest Days</CardTitle>
            <CardDescription>Number of meetings by day of week</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.busiestDays}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayOfWeek" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Meetings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Busiest Hours</CardTitle>
            <CardDescription>Number of meetings by hour of day</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.busiestHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickFormatter={(hour) => {
                    const h = hour % 12 || 12;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    return `${h} ${ampm}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [value, 'Meetings']}
                  labelFormatter={(hour) => {
                    const h = hour % 12 || 12;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    return `${h} ${ampm}`;
                  }}
                />
                <Legend />
                <Bar dataKey="count" name="Number of Meetings" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
