import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-radix';
import { MeetingList, Meeting } from '@/components/meetings/MeetingList';
import { MeetingDetailsDialog } from '@/components/meetings/MeetingDetailsDialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock } from 'lucide-react';
import { API_URL } from '@/config';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export function MeetingsPage() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [meetingToDecline, setMeetingToDecline] = useState<number | null>(null);

  // Fetch meetings
  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching meetings with user ID:', user?.id);
      const response = await axios.get(`${API_URL}/api/meeting/meetings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const meetingsData = (response.data as any).data || [];
      console.log('Meetings fetched:', meetingsData);

      // For each meeting, check if feedback exists
      const meetingsWithFeedbackInfo = await Promise.all(
        meetingsData.map(async (meeting: any) => {
          try {
            // Only check for completed meetings
            if (meeting.status === 'completed') {
              const feedbackResponse = await axios.get(
                `${API_URL}/api/meeting/meetings/${meeting.meetingID}/feedback`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const feedbackData = (feedbackResponse.data as any).data || [];
              return {
                ...meeting,
                hasFeedback: feedbackData.length > 0,
              };
            }
            return meeting;
          } catch (error) {
            // If there's an error (like 404 for no feedback), just return the meeting as is
            return meeting;
          }
        })
      );

      setMeetings(meetingsWithFeedbackInfo);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch meetings',
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
  }, [token]);

  // Filter meetings based on active tab and filters
  useEffect(() => {
    if (!meetings.length) {
      setFilteredMeetings([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...meetings];

    // Apply tab filter (upcoming/past)
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.meetingDate);
        meetingDate.setHours(0, 0, 0, 0);
        // Exclude completed meetings from upcoming tab
        return meetingDate >= today && meeting.status !== 'completed';
      });
    } else if (activeTab === 'past') {
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.meetingDate);
        meetingDate.setHours(0, 0, 0, 0);
        // Include meetings that are either in the past or completed
        return meetingDate < today || meeting.status === 'completed';
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(meeting => meeting.meetingType === typeFilter);
    }

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

    // Sort by date (upcoming: ascending, past: descending)
    filtered.sort((a, b) => {
      const dateA = new Date(a.meetingDate);
      const dateB = new Date(b.meetingDate);

      if (activeTab === 'upcoming') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });

    setFilteredMeetings(filtered);
  }, [meetings, activeTab, statusFilter, typeFilter, searchQuery]);

  // Handle meeting actions
  const handleAcceptMeeting = async (meetingId: number) => {
    try {
      await axios.put(
        `${API_URL}/api/meeting/meetings/${meetingId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Meeting accepted successfully',
      });

      // Refresh meetings
      fetchMeetings();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error accepting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept meeting',
      });
    }
  };

  const handleDeclineMeeting = async (meetingId: number, reason: string) => {
    try {
      await axios.put(
        `${API_URL}/api/meeting/meetings/${meetingId}/decline`,
        { declineReason: reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Meeting declined successfully',
      });

      // Refresh meetings
      fetchMeetings();
      setIsDetailsOpen(false);
      setIsDeclineDialogOpen(false);
      setDeclineReason('');
      setMeetingToDecline(null);
    } catch (error) {
      console.error('Error declining meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline meeting',
      });
    }
  };

  const handleCancelMeeting = async (meetingId: number) => {
    try {
      await axios.put(
        `${API_URL}/api/meeting/meetings/${meetingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Meeting cancelled successfully',
      });

      // Refresh meetings
      fetchMeetings();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel meeting',
      });
    }
  };

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsDetailsOpen(true);
  };

  const openDeclineDialog = (meetingId: number) => {
    setMeetingToDecline(meetingId);
    setIsDeclineDialogOpen(true);
  };

  const submitDecline = () => {
    if (meetingToDecline) {
      handleDeclineMeeting(meetingToDecline, declineReason);
    }
  };

  if (isLoading) {
    return (
      <div className="container pb-32 pt-32 max-w-[1216px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* Card Skeleton */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="border rounded-md p-4 mb-4 bg-card animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-muted-foreground" />
                        <Skeleton className="h-4 w-32 ml-1" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  <Skeleton className="h-16 w-full mb-4" />

                  <div className="flex justify-end space-x-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-32 pt-32 max-w-[1216px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/meeting-availability')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Set Availability
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <SelectItem value="student_company">Student ↔ Company</SelectItem>
              <SelectItem value="student_counselor">Student ↔ Counselor</SelectItem>
              <SelectItem value="company_counselor">Company ↔ Counselor</SelectItem>
              <SelectItem value="student_student">Student ↔ Student</SelectItem>
              <SelectItem value="company_company">Company ↔ Company</SelectItem>
              <SelectItem value="counselor_counselor">Counselor ↔ Counselor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="past">Past Meetings</TabsTrigger>
          <TabsTrigger value="all">All Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>
                View and manage your upcoming meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MeetingList
                meetings={filteredMeetings}
                currentUserID={user?.id ? parseInt(user.id) : 0}
                onAccept={handleAcceptMeeting}
                onDecline={openDeclineDialog}
                onCancel={handleCancelMeeting}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Past Meetings</CardTitle>
              <CardDescription>
                View your past meetings and provide feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MeetingList
                meetings={filteredMeetings}
                currentUserID={user?.id ? parseInt(user.id) : 0}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Meetings</CardTitle>
              <CardDescription>
                View all your meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MeetingList
                meetings={filteredMeetings}
                currentUserID={user?.id ? parseInt(user.id) : 0}
                onAccept={handleAcceptMeeting}
                onDecline={openDeclineDialog}
                onCancel={handleCancelMeeting}
                onViewDetails={handleViewDetails}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meeting Details Dialog */}
      <MeetingDetailsDialog
        meeting={selectedMeeting}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        currentUserID={user?.id ? parseInt(user.id) : 0}
        onAccept={handleAcceptMeeting}
        onDecline={openDeclineDialog}
        onCancel={handleCancelMeeting}
      />

      {/* Decline Reason Dialog */}
      <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Meeting</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this meeting request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter reason for declining"
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeclineDialogOpen(false);
                setDeclineReason('');
                setMeetingToDecline(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitDecline}
            >
              Decline Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
