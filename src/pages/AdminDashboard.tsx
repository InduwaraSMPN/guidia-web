"use client";

import type React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, createContext } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { toast } from "../components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeading from "../components/PageHeading";
import AdminSidebarDrawer from "../components/admin/AdminSidebarDrawer";
import AdminSidebarFloatingButton from "../components/admin/AdminSidebarFloatingButton";
import { JobStatisticsCard } from "@/components/admin/JobStatisticsCard";
import { ApplicationStatisticsCard } from "@/components/admin/ApplicationStatisticsCard";
import { MeetingStatisticsCard } from "@/components/admin/MeetingStatisticsCard";
import { UserActivityCard } from "@/components/admin/UserActivityCard";
import { CommunicationStatisticsCard } from "@/components/admin/CommunicationStatisticsCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Define SidebarContext
export const SidebarContext = createContext({ collapsed: false });

interface JobStatistics {
  totalActiveJobs: number;
  jobsLast7Days: number;
  jobsLast30Days: number;
  jobsExpiringSoon: number;
  mostViewedJobs: Array<{
    jobID: number;
    title: string;
    companyID: number;
    companyName: string;
    viewCount: number;
  }>;
  leastViewedJobs: Array<{
    jobID: number;
    title: string;
    companyID: number;
    companyName: string;
    viewCount: number;
  }>;
  mostApplicationJobs: Array<{
    jobID: number;
    title: string;
    companyID: number;
    companyName: string;
    applicationCount: number;
  }>;
  leastApplicationJobs: Array<{
    jobID: number;
    title: string;
    companyID: number;
    companyName: string;
    applicationCount: number;
  }>;
  jobPostingTrend: Array<{
    date: string;
    count: number;
  }>;
  jobViewsTrend: Array<{
    date: string;
    count: number;
  }>;
}

interface ApplicationStatistics {
  totalApplications: number;
  applicationsLast7Days: number;
  applicationsLast30Days: number;
  applicationsByStatus: Array<{
    status: string;
    count: number;
  }>;
  applicationTrend: Array<{
    date: string;
    count: number;
  }>;
  conversionRate: number;
}

interface MeetingStatistics {
  totalMeetings: number;
  meetingsByStatus: Array<{
    status: string;
    count: number;
  }>;
  meetingsByType: Array<{
    meetingType: string;
    count: number;
  }>;
  avgSuccessRating: number;
  avgPlatformRating: number;
  busiestDays: Array<{
    dayOfWeek: string;
    count: number;
  }>;
  busiestHours: Array<{
    hour: number;
    count: number;
  }>;
  upcomingMeetings: Array<{
    meetingID: number;
    meetingTitle: string;
    meetingDate: string;
    startTime: string;
    endTime: string;
    requestorName: string;
    recipientName: string;
    status: string;
    meetingType: string;
  }>;
}

interface UserActivity {
  newUsers7Days: number;
  newUsers30Days: number;
  userRegistrationTrend: Array<{
    date: string;
    count: number;
  }>;
  profileCompletion: {
    student: number;
    counselor: number;
    company: number;
  };
}

interface SecurityStatistics {
  recentEvents: Array<{
    eventType: string;
    details: string;
    userID: number;
    timestamp: string;
  }>;
  loginAttempts: Array<{
    eventType: string;
    count: number;
  }>;
  accountStatusChanges: number;
}

interface CommunicationStatistics {
  totalMessages: number;
  messages7Days: number;
  messages30Days: number;
  activeConversations: Array<{
    user1ID: number;
    user2ID: number;
    messageCount: number;
    lastMessageTime: string;
    user1Name: string;
    user2Name: string;
  }>;
  unreadMessages: number;
  messageTrend: Array<{
    date: string;
    count: number;
  }>;
}

interface SystemHealth {
  schedulerStatus: {
    isRunning: boolean;
    scheduledJobs: Array<{
      name: string;
      nextInvocation: string | null;
    }>;
  };
  databaseStatus: string;
  serverTime: string;
}

interface ActivityFeed {
  type: string;
  timestamp: string;
  data: any;
}

interface DashboardData {
  counts: {
    upcomingEvents: number;
    pastEvents: number;
    newsCount: number;
    registrations: {
      pending: number;
      approved: number;
      declined: number;
    };
    users: {
      students: number;
      counselors: number;
      companies: number;
    };
  };
  jobStats?: JobStatistics;
  applicationStats?: ApplicationStatistics;
  meetingStats?: MeetingStatistics;
  userActivity?: UserActivity;
  securityStats?: SecurityStatistics;
  communicationStats?: CommunicationStatistics;
  systemHealth?: SystemHealth;
  activityFeed?: ActivityFeed[];
}

interface SubStat {
  label: string | React.ReactNode;
  value: string;
}

interface Stat {
  label: string;
  value?: string;
  subItems?: SubStat[];
}

interface DashboardCardProps {
  title: string;
  stats: Stat[];
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, stats }) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border transition-all duration-200 hover:shadow-md overflow-hidden">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-card-foreground mb-4 pb-2 border-b border-border">
          {title}
        </h3>
        <ul className="space-y-2">
          {stats.map((stat, index) => (
            <li key={index} className="group">
              {/* Main List Item */}
              <div className="flex justify-between items-center p-2.5 rounded-md transition-all duration-200 hover:bg-accent group-hover:translate-x-1">
                <span className="text-sm font-medium text-foreground">
                  {stat.label}
                </span>
                <span className="bg-accent/50 text-foreground text-sm px-3 py-1 rounded-full font-medium transition-all duration-200 group-hover:bg-accent/80">
                  {stat.value}
                </span>
              </div>

              {/* Sub Items */}
              {stat.subItems && (
                <ul className="ml-6 mt-1.5 space-y-1.5 border-l-2 border-border pl-4">
                  {stat.subItems.map((subItem, subIndex) => (
                    <li
                      key={subIndex}
                      className="flex justify-between items-center p-2 rounded-md transition-all duration-200 hover:bg-accent hover:translate-x-1"
                    >
                      <span className="text-sm text-muted-foreground">
                        {subItem.label}
                      </span>
                      <span className="bg-accent/50 text-foreground text-xs px-2.5 py-0.5 rounded-full font-medium">
                        {subItem.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export function AdminDashboard() {
  const { user, isVerifyingToken } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Add state to track sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Add state to track auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Function to toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => !prev);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      // Fetch counts
      const countsRes = await fetch("/api/counts");
      if (!countsRes.ok) {
        throw new Error("Failed to fetch counts");
      }
      const countsData = await countsRes.json();

      // Fetch user counts with authorization header
      const token = localStorage.getItem("token");
      const userCountsRes = await fetch("/api/admin/user-counts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!userCountsRes.ok) {
        throw new Error("Failed to fetch user counts");
      }
      const userCountsData = await userCountsRes.json();

      // Fetch job statistics
      const jobStatsRes = await fetch("/api/admin/job-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let jobStatsData = null;
      if (jobStatsRes.ok) {
        jobStatsData = await jobStatsRes.json();
      } else {
        console.error("Failed to fetch job statistics");
      }

      // Fetch application statistics
      const appStatsRes = await fetch("/api/admin/application-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let appStatsData = null;
      if (appStatsRes.ok) {
        appStatsData = await appStatsRes.json();
      } else {
        console.error("Failed to fetch application statistics");
      }

      // Fetch meeting statistics
      const meetingStatsRes = await fetch("/api/admin/meeting-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let meetingStatsData = null;
      if (meetingStatsRes.ok) {
        meetingStatsData = await meetingStatsRes.json();
      } else {
        console.error("Failed to fetch meeting statistics");
      }

      // Fetch user activity statistics
      const userActivityRes = await fetch("/api/admin/user-activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let userActivityData = null;
      if (userActivityRes.ok) {
        userActivityData = await userActivityRes.json();
      } else {
        console.error("Failed to fetch user activity statistics");
      }

      // Fetch security statistics
      const securityStatsRes = await fetch("/api/admin/security-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let securityStatsData = null;
      if (securityStatsRes.ok) {
        securityStatsData = await securityStatsRes.json();
      } else {
        console.error("Failed to fetch security statistics");
      }

      // Fetch communication statistics
      const commStatsRes = await fetch("/api/admin/communication-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let commStatsData = null;
      if (commStatsRes.ok) {
        commStatsData = await commStatsRes.json();
      } else {
        console.error("Failed to fetch communication statistics");
      }

      // Fetch system health
      const systemHealthRes = await fetch("/api/admin/system-health", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let systemHealthData = null;
      if (systemHealthRes.ok) {
        systemHealthData = await systemHealthRes.json();
      } else {
        console.error("Failed to fetch system health");
      }

      // Fetch activity feed
      const activityFeedRes = await fetch("/api/admin/activity-feed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let activityFeedData = null;
      if (activityFeedRes.ok) {
        activityFeedData = await activityFeedRes.json();
      } else {
        console.error("Failed to fetch activity feed");
      }



      setDashboardData({
        counts: {
          upcomingEvents: Number(countsData.upcomingEvents) || 0,
          pastEvents: Number(countsData.pastEvents) || 0,
          newsCount: Number(countsData.newsCount) || 0,
          registrations: {
            pending: Number(countsData.pendingRegistrations) || 0,
            approved: Number(countsData.approvedRegistrations) || 0,
            declined: Number(countsData.declinedRegistrations) || 0,
          },
          users: {
            students: Number(userCountsData.students) || 0,
            counselors: Number(userCountsData.counselors) || 0,
            companies: Number(userCountsData.companies) || 0,
          },
        },
        jobStats: jobStatsData,
        applicationStats: appStatsData,
        meetingStats: meetingStatsData,
        userActivity: userActivityData,
        securityStats: securityStatsData,
        communicationStats: commStatsData,
        systemHealth: systemHealthData,
        activityFeed: activityFeedData,
      });
      setError("");
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Track last update time to prevent too frequent updates
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const UPDATE_THROTTLE_MS = 5000; // 5 seconds minimum between updates
  const [lastToastTime, setLastToastTime] = useState<number>(0);
  const TOAST_THROTTLE_MS = 30000; // 30 seconds minimum between toast notifications

  // Handle admin dashboard update events
  const handleAdminDashboardUpdate = useCallback(
    (data: any) => {
      console.log("Received admin dashboard update:", data);
      // Only update if we're on the admin dashboard page
      if (location.pathname === "/admin") {
        const now = Date.now();

        // Check if enough time has passed since the last update
        if (now - lastUpdateTime > UPDATE_THROTTLE_MS) {
          // Fetch fresh data when we receive an update
          fetchDashboardData();
          setLastUpdateTime(now);

          // Only show toast notification if enough time has passed
          if (now - lastToastTime > TOAST_THROTTLE_MS) {
            toast.success("Dashboard data updated", {
              description: "New data is now available",
            });
            setLastToastTime(now);
          }
        }
      }
    },
    [location.pathname, fetchDashboardData, lastUpdateTime, lastToastTime]
  );

  // Effect for setting up auto-refresh
  useEffect(() => {
    if (autoRefresh && location.pathname === "/admin") {
      // Set up a 60-second refresh interval
      const interval = window.setInterval(() => {
        if (!refreshing) {
          const now = Date.now();
          // Only refresh if enough time has passed since the last update
          if (now - lastUpdateTime > UPDATE_THROTTLE_MS) {
            console.log('Auto-refreshing dashboard data...');
            fetchDashboardData();
            setLastUpdateTime(now);

            // Only show toast notification if enough time has passed
            if (now - lastToastTime > TOAST_THROTTLE_MS) {
              toast.success("Dashboard data refreshed", {
                description: "Data has been automatically refreshed",
              });
              setLastToastTime(now);
            }
          }
        }
      }, 60000); // 60 seconds

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          window.clearInterval(interval);
          setRefreshInterval(null);
        }
      };
    } else if (!autoRefresh && refreshInterval) {
      // Clear the interval if auto-refresh is turned off
      window.clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, location.pathname, refreshing, fetchDashboardData, refreshInterval, lastUpdateTime, lastToastTime]);

  useEffect(() => {
    if (!user) {
      if (!isVerifyingToken) {
        navigate("/auth/login");
      }
      return;
    }

    if (user.roleId !== 1) {
      navigate("/");
      return;
    }

    fetchDashboardData();

    // Set up socket event listener for admin dashboard updates
    if (socket && user.roleId === 1) {
      socket.on("admin_dashboard_update", handleAdminDashboardUpdate);
    }

    // Clean up event listener
    return () => {
      if (socket) {
        socket.off("admin_dashboard_update", handleAdminDashboardUpdate);
      }
    };
  }, [
    user,
    isVerifyingToken,
    navigate,
    fetchDashboardData,
    socket,
    handleAdminDashboardUpdate,
  ]);

  return (
    <SidebarContext.Provider value={{ collapsed: false }}>
      <div className="flex min-h-screen bg-background">
        {/* Admin Sidebar Drawer */}
        <AdminSidebarDrawer
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Floating button to open sidebar */}
        <AdminSidebarFloatingButton
          onClick={() => setIsSidebarOpen(true)}
          isVisible={!isSidebarOpen}
        />

        <div
          className="flex-1 transition-all duration-300 ease-in-out"
          style={{
            marginTop: "64px",
          }}
        >
          <main className="p-6">
            {location.pathname === "/admin" ? (
              <>
                <div className="p-6 max-w-[1216px] mx-auto">
                  <PageHeading
                    title="Admin Dashboard"
                    subtitle="Overview of system statistics and activities"
                    className="mb-8"
                    action={
                      <div className="flex items-center gap-2">
                        {refreshing ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Refreshing...</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const now = Date.now();
                              // Only refresh if enough time has passed since the last update
                              if (now - lastUpdateTime > UPDATE_THROTTLE_MS) {
                                fetchDashboardData();
                                setLastUpdateTime(now);
                              } else {
                                // Show a message that we're throttling
                                toast.info("Refresh throttled", {
                                  description: `Please wait ${Math.ceil((UPDATE_THROTTLE_MS - (now - lastUpdateTime)) / 1000)} seconds before refreshing again`,
                                });
                              }
                            }}
                            className="flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Refresh Data</span>
                          </Button>
                        )}
                        <Button
                          variant={autoRefresh ? "default" : "outline"}
                          size="sm"
                          onClick={toggleAutoRefresh}
                          className={`flex items-center gap-1.5 transition-all duration-200 hover:scale-105 ${autoRefresh ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                          <span>{autoRefresh ? "Auto-Refresh: ON" : "Auto-Refresh: OFF"}</span>
                        </Button>
                      </div>
                    }
                  />

                  {loading && !refreshing ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-[300px] w-full rounded-lg" />
                        <Skeleton className="h-[300px] w-full rounded-lg" />
                      </div>
                      <Skeleton className="h-[500px] w-full rounded-lg" />
                      <Skeleton className="h-[500px] w-full rounded-lg" />
                      <Skeleton className="h-[500px] w-full rounded-lg" />
                    </div>
                  ) : error ? (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 animate-in fade-in-50">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="font-medium">{error}</p>
                      </div>
                      <p className="mt-2 text-sm">
                        Please try refreshing the page or contact support if the
                        issue persists.
                      </p>
                    </div>
                  ) : dashboardData ? (
                    <div className="space-y-8 animate-in fade-in-50">
                      {/* Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DashboardCard
                          title="Users Overview"
                          stats={[
                            {
                              label: "Students",
                              value:
                                dashboardData.counts.users.students.toString(),
                            },
                            {
                              label: "Counselors",
                              value:
                                dashboardData.counts.users.counselors.toString(),
                            },
                            {
                              label: "Companies",
                              value:
                                dashboardData.counts.users.companies.toString(),
                            },
                          ]}
                        />
                        <DashboardCard
                          title="Activity Summary"
                          stats={[
                            {
                              label: "Events",
                              value: (
                                dashboardData.counts.upcomingEvents +
                                dashboardData.counts.pastEvents
                              ).toString(),
                              subItems: [
                                {
                                  label: "Upcoming Events",
                                  value:
                                    dashboardData.counts.upcomingEvents.toString(),
                                },
                                {
                                  label: "Past Events",
                                  value:
                                    dashboardData.counts.pastEvents.toString(),
                                },
                              ],
                            },
                            {
                              label: "News Posts",
                              value: dashboardData.counts.newsCount.toString(),
                            },
                          ]}
                        />
                      </div>

                      {/* Statistics Cards */}
                      <div className="space-y-6">
                        {/* User Activity Card */}
                        {dashboardData.userActivity && (
                          <UserActivityCard
                            userActivity={dashboardData.userActivity}
                          />
                        )}

                        {/* Job Statistics Card */}
                        {dashboardData.jobStats && (
                          <JobStatisticsCard
                            jobStats={dashboardData.jobStats}
                          />
                        )}

                        {/* Application Statistics Card */}
                        {dashboardData.applicationStats && (
                          <ApplicationStatisticsCard
                            applicationStats={dashboardData.applicationStats}
                          />
                        )}

                        {/* Meeting Statistics Card */}
                        {dashboardData.meetingStats && (
                          <MeetingStatisticsCard
                            meetingStats={dashboardData.meetingStats}
                          />
                        )}

                        {/* Communication Statistics Card */}
                        {dashboardData.communicationStats && (
                          <CommunicationStatisticsCard
                            communicationStats={
                              dashboardData.communicationStats
                            }
                          />
                        )}


                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

export default AdminDashboard;
