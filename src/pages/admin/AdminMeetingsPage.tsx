import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-radix';
import { Button } from '@/components/ui/button';
import { MeetingList, Meeting } from '@/components/meetings/MeetingList';
import { MeetingDetailsDialog } from '@/components/meetings/MeetingDetailsDialog';
import { MeetingAnalytics } from '@/components/meetings/MeetingAnalytics';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/config';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns';

export function AdminMeetingsPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('meetings');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Fetch all meetings (admin view)
  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (dateRange.from) params.append('startDate', dateRange.from.toISOString().split('T')[0]);
      if (dateRange.to) params.append('endDate', dateRange.to.toISOString().split('T')[0]);

      const response = await axios.get(`${API_URL}/api/meeting/meetings?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMeetings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meetings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchMeetings();
    }
  }, [token, statusFilter, typeFilter, dateRange]);

  // Filter meetings based on search query
  useEffect(() => {
    if (!meetings.length) {
      setFilteredMeetings([]);
      return;
    }

    let filtered = [...meetings];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        meeting =>
          meeting.meetingTitle.toLowerCase().includes(query) ||
          meeting.requestorName.toLowerCase().includes(query) ||
          meeting.recipientName.toLowerCase().includes(query)
      );
    }

    setFilteredMeetings(filtered);
  }, [meetings, searchQuery]);

  // Handle meeting actions
  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meeting Management</h1>
        <Button onClick={fetchMeetings}>Refresh Data</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="meetings">All Meetings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter meetings by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search meetings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="student_company">Student-Company</SelectItem>
                      <SelectItem value="student_counselor">Student-Counselor</SelectItem>
                      <SelectItem value="company_counselor">Company-Counselor</SelectItem>
                      <SelectItem value="student_student">Student-Student</SelectItem>
                      <SelectItem value="company_company">Company-Company</SelectItem>
                      <SelectItem value="counselor_counselor">Counselor-Counselor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Range</Label>
                  <DateRangePicker
                    date={dateRange}
                    onDateChange={setDateRange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meetings</CardTitle>
              <CardDescription>
                {filteredMeetings.length} meetings found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MeetingList
                meetings={filteredMeetings}
                currentUserID={user?.id}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Analytics</CardTitle>
              <CardDescription>
                Analytics and insights about meetings across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MeetingAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meeting Details Dialog */}
      <MeetingDetailsDialog
        meeting={selectedMeeting}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        currentUserID={user?.id}
      />
    </div>
  );
}
