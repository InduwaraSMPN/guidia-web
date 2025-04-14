"use client"

import type React from "react"

import { useNavigate, Outlet, useLocation } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import PageHeading from "../components/PageHeading"
import { toast } from "../components/ui/sonner"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { JobStatisticsCard } from "@/components/admin/JobStatisticsCard"
import { ApplicationStatisticsCard } from "@/components/admin/ApplicationStatisticsCard"
import { MeetingStatisticsCard } from "@/components/admin/MeetingStatisticsCard"
import { UserActivityCard } from "@/components/admin/UserActivityCard"
import { SecurityAuditCard } from "@/components/admin/SecurityAuditCard"
import { CommunicationStatisticsCard } from "@/components/admin/CommunicationStatisticsCard"
import { SystemHealthCard } from "@/components/admin/SystemHealthCard"
import { ActivityFeedCard } from "@/components/admin/ActivityFeedCard"

// Create a context to share the sidebar state
import { createContext } from "react"

// Define SidebarContext
export const SidebarContext = createContext({ collapsed: false })

interface JobStatistics {
  totalActiveJobs: number
  jobsLast7Days: number
  jobsLast30Days: number
  jobsExpiringSoon: number
  mostViewedJobs: Array<{
    jobID: number
    title: string
    companyID: number
    companyName: string
    viewCount: number
  }>
  leastViewedJobs: Array<{
    jobID: number
    title: string
    companyID: number
    companyName: string
    viewCount: number
  }>
  mostApplicationJobs: Array<{
    jobID: number
    title: string
    companyID: number
    companyName: string
    applicationCount: number
  }>
  leastApplicationJobs: Array<{
    jobID: number
    title: string
    companyID: number
    companyName: string
    applicationCount: number
  }>
  jobPostingTrend: Array<{
    date: string
    count: number
  }>
  jobViewsTrend: Array<{
    date: string
    count: number
  }>
}

interface ApplicationStatistics {
  totalApplications: number
  applicationsLast7Days: number
  applicationsLast30Days: number
  applicationsByStatus: Array<{
    status: string
    count: number
  }>
  applicationTrend: Array<{
    date: string
    count: number
  }>
  conversionRate: number
}

interface MeetingStatistics {
  totalMeetings: number
  meetingsByStatus: Array<{
    status: string
    count: number
  }>
  meetingsByType: Array<{
    meetingType: string
    count: number
  }>
  avgSuccessRating: number
  avgPlatformRating: number
  busiestDays: Array<{
    dayOfWeek: string
    count: number
  }>
  busiestHours: Array<{
    hour: number
    count: number
  }>
  upcomingMeetings: Array<{
    meetingID: number
    meetingTitle: string
    meetingDate: string
    startTime: string
    endTime: string
    requestorName: string
    recipientName: string
    status: string
    meetingType: string
  }>
}

interface UserActivity {
  newUsers7Days: number
  newUsers30Days: number
  userRegistrationTrend: Array<{
    date: string
    count: number
  }>
  profileCompletion: {
    student: number
    counselor: number
    company: number
  }
}

interface SecurityStatistics {
  recentEvents: Array<{
    eventType: string
    details: string
    userID: number
    timestamp: string
  }>
  loginAttempts: Array<{
    eventType: string
    count: number
  }>
  accountStatusChanges: number
}

interface CommunicationStatistics {
  totalMessages: number
  messages7Days: number
  messages30Days: number
  activeConversations: Array<{
    user1ID: number
    user2ID: number
    messageCount: number
    lastMessageTime: string
    user1Name: string
    user2Name: string
  }>
  unreadMessages: number
  messageTrend: Array<{
    date: string
    count: number
  }>
}

interface SystemHealth {
  schedulerStatus: {
    isRunning: boolean
    scheduledJobs: Array<{
      name: string
      nextInvocation: string | null
    }>
  }
  databaseStatus: string
  serverTime: string
}

interface ActivityFeed {
  type: string
  timestamp: string
  data: any
}

interface DashboardData {
  counts: {
    upcomingEvents: number
    pastEvents: number
    newsCount: number
    registrations: {
      pending: number
      approved: number
      declined: number
    }
    users: {
      students: number
      counselors: number
      companies: number
    }
  }
  jobStats?: JobStatistics
  applicationStats?: ApplicationStatistics
  meetingStats?: MeetingStatistics
  userActivity?: UserActivity
  securityStats?: SecurityStatistics
  communicationStats?: CommunicationStatistics
  systemHealth?: SystemHealth
  activityFeed?: ActivityFeed[]
}

interface SubStat {
  label: string | React.ReactNode
  value: string
}

interface Stat {
  label: string
  value?: string
  subItems?: SubStat[]
}

interface DashboardCardProps {
  title: string
  stats: Stat[]
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, stats }) => {
  return (
    <div className="bg-white overflow-hidden border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6">
        <h3 className="text-lg font-medium text-adaptive-dark mb-5 border-b pb-3">{title}</h3>
        <ul className="space-y-3">
          {stats.map((stat, index) => (
            <li key={index} className="group">
              {/* Main List Item */}
              <div className="flex justify-between items-center hover:bg-secondary p-3 rounded-lg transition-all duration-200 group-hover:translate-x-1">
                <span className="text-sm font-medium text-foreground">{stat.label}</span>
                <span className="bg-secondary-light text-adaptive-dark text-sm px-3 py-1 rounded-full font-medium transition-all duration-200 group-hover:bg-secondary-dark">
                  {stat.value}
                </span>
              </div>

              {/* Sub Items */}
              {stat.subItems && (
                <ul className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-4">
                  {stat.subItems.map((subItem, subIndex) => (
                    <li
                      key={subIndex}
                      className="flex justify-between items-center hover:bg-secondary p-2.5 rounded-lg transition-all duration-200 hover:translate-x-1"
                    >
                      <span className="text-sm text-muted-foreground">{subItem.label}</span>
                      <span className="bg-secondary-light text-foreground text-xs px-2.5 py-0.5 rounded-full font-medium">
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
  )
}

export function AdminDashboard() {
  const { user, isVerifyingToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Add state to track sidebar collapsed status
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Function to update sidebar state that will be passed to AdminSidebar
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true)
      setLoading(true)

      // Fetch counts
      const countsRes = await fetch("/api/counts")
      if (!countsRes.ok) {
        throw new Error("Failed to fetch counts")
      }
      const countsData = await countsRes.json()

      // Fetch user counts with authorization header
      const token = localStorage.getItem("token")
      const userCountsRes = await fetch("/api/admin/user-counts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!userCountsRes.ok) {
        throw new Error("Failed to fetch user counts")
      }
      const userCountsData = await userCountsRes.json()

      // Fetch job statistics
      const jobStatsRes = await fetch("/api/admin/job-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      let jobStatsData = null
      if (jobStatsRes.ok) {
        jobStatsData = await jobStatsRes.json()
      } else {
        console.error("Failed to fetch job statistics")
      }

      // Fetch application statistics
      const appStatsRes = await fetch("/api/admin/application-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      let appStatsData = null
      if (appStatsRes.ok) {
        appStatsData = await appStatsRes.json()
      } else {
        console.error("Failed to fetch application statistics")
      }

      // Fetch meeting statistics
      const meetingStatsRes = await fetch("/api/admin/meeting-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      let meetingStatsData = null
      if (meetingStatsRes.ok) {
        meetingStatsData = await meetingStatsRes.json()
      } else {
        console.error("Failed to fetch meeting statistics")
      }

      // Fetch user activity statistics
      const userActivityRes = await fetch("/api/admin/user-activity", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      let userActivityData = null
      if (userActivityRes.ok) {
        userActivityData = await userActivityRes.json()
      } else {
        console.error("Failed to fetch user activity statistics")
      }

      // Fetch security statistics
      const securityStatsRes = await fetch("/api/admin/security-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      let securityStatsData = null
      if (securityStatsRes.ok) {
        securityStatsData = await securityStatsRes.json()
      } else {
        console.error("Failed to fetch security statistics")
      }

      // Fetch communication statistics
      const commStatsRes = await fetch("/api/admin/communication-statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      let commStatsData = null
      if (commStatsRes.ok) {
        commStatsData = await commStatsRes.json()
      } else {
        console.error("Failed to fetch communication statistics")
      }

      // Fetch system health
      const systemHealthRes = await fetch("/api/admin/system-health", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      let systemHealthData = null
      if (systemHealthRes.ok) {
        systemHealthData = await systemHealthRes.json()
      } else {
        console.error("Failed to fetch system health")
      }

      // Fetch activity feed
      const activityFeedRes = await fetch("/api/admin/activity-feed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      let activityFeedData = null
      if (activityFeedRes.ok) {
        activityFeedData = await activityFeedRes.json()
      } else {
        console.error("Failed to fetch activity feed")
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
      })
      setError("")
    } catch (error) {
      setError("Failed to load dashboard data")
      console.error(error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      if (!isVerifyingToken) {
        navigate("/auth/login")
      }
      return
    }

    if (user.roleId !== 1) {
      navigate("/")
      return
    }

    fetchDashboardData()
  }, [user, isVerifyingToken, navigate, fetchDashboardData])

  return (
    <SidebarContext.Provider value={{ collapsed: sidebarCollapsed }}>
      <div className="flex min-h-screen">
        <AdminSidebar onToggle={handleSidebarToggle} />
        <div
          className="flex-1 pt-24 p-8 px-4 sm:px-6 lg:px-8 transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? "80px" : "250px" }}
        >
          {location.pathname === "/admin" ? (
            <>
              <div className="p-6 max-w-[1216px] mx-auto">
                <PageHeading title="Admin Dashboard" subtitle="Overview of system statistics and activities" />

                <div className="mt-8 space-y-8">
                  {refreshing && (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 text-brand animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Refreshing data...</span>
                    </div>
                  )}
                  {loading && !refreshing ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Users Overview Skeleton */}
                        <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                          <div className="p-6">
                            <Skeleton className="h-6 w-40 mb-5 pb-3" />
                            <ul className="space-y-3">
                              {[...Array(3)].map((_, index) => (
                                <li key={index}>
                                  <div className="flex justify-between items-center p-3 rounded-lg">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-6 w-12 rounded-full" />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Activity Summary Skeleton */}
                        <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                          <div className="p-6">
                            <Skeleton className="h-6 w-48 mb-5 pb-3" />
                            <ul className="space-y-3">
                              <li>
                                <div className="flex justify-between items-center p-3 rounded-lg">
                                  <Skeleton className="h-5 w-20" />
                                  <Skeleton className="h-6 w-12 rounded-full" />
                                </div>
                                <ul className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-4">
                                  {[...Array(2)].map((_, index) => (
                                    <li key={index} className="flex justify-between items-center p-2.5 rounded-lg">
                                      <Skeleton className="h-4 w-32" />
                                      <Skeleton className="h-5 w-10 rounded-full" />
                                    </li>
                                  ))}
                                </ul>
                              </li>
                              <li>
                                <div className="flex justify-between items-center p-3 rounded-lg">
                                  <Skeleton className="h-5 w-28" />
                                  <Skeleton className="h-6 w-12 rounded-full" />
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Job Statistics Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-48 mb-5 pb-3" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[...Array(4)].map((_, index) => (
                              <div key={index} className="bg-secondary/30 p-4 rounded-lg">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            ))}
                          </div>
                          <Skeleton className="h-80 w-full mb-6" />
                        </div>
                      </div>

                      {/* Application Statistics Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-56 mb-5 pb-3" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[...Array(4)].map((_, index) => (
                              <div key={index} className="bg-secondary/30 p-4 rounded-lg">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-80 w-full" />
                          </div>
                        </div>
                      </div>

                      {/* Meeting Statistics Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-52 mb-5 pb-3" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[...Array(4)].map((_, index) => (
                              <div key={index} className="bg-secondary/30 p-4 rounded-lg">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-80 w-full" />
                          </div>
                        </div>
                      </div>

                      {/* User Activity Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-60 mb-5 pb-3" />
                          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                            {[...Array(2)].map((_, index) => (
                              <div key={index} className="bg-secondary/30 p-4 rounded-lg">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-80 w-full" />
                          </div>
                        </div>
                      </div>

                      {/* Security Audit Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-44 mb-5 pb-3" />
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="bg-secondary/30 p-4 rounded-lg">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-80 w-full" />
                          </div>
                        </div>
                      </div>

                      {/* Communication Statistics Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-64 mb-5 pb-3" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[...Array(4)].map((_, index) => (
                              <div key={index} className="bg-secondary/30 p-4 rounded-lg">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-80 w-full" />
                          </div>
                        </div>
                      </div>

                      {/* System Health Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-48 mb-5 pb-3" />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="bg-secondary/30 p-4 rounded-lg flex items-center">
                                <Skeleton className="h-6 w-6 mr-3 rounded-full" />
                                <div>
                                  <Skeleton className="h-4 w-20 mb-1" />
                                  <Skeleton className="h-3 w-16" />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-4">
                            {[...Array(3)].map((_, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <Skeleton className="h-5 w-32" />
                                  <Skeleton className="h-5 w-24 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-48 mt-2" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Activity Feed Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-40 mb-5 pb-3" />
                          <div className="space-y-4">
                            {[...Array(5)].map((_, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <Skeleton className="h-5 w-24 rounded-full" />
                                  <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-5 w-full mt-2" />
                                <Skeleton className="h-4 w-3/4 mt-1" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </p>
                    </div>
                  ) : dashboardData ? (
                    <div className="bg-white overflow-hidden sm:rounded-lg mx-auto p-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DashboardCard
                          title="Users Overview"
                          stats={[
                            { label: "Students", value: dashboardData.counts.users.students.toString() },
                            { label: "Counselors", value: dashboardData.counts.users.counselors.toString() },
                            { label: "Companies", value: dashboardData.counts.users.companies.toString() },
                          ]}
                        />
                        <DashboardCard
                          title="Activity Summary"
                          stats={[
                            {
                              label: "Events",
                              value: (dashboardData.counts.upcomingEvents + dashboardData.counts.pastEvents).toString(),
                              subItems: [
                                { label: "Upcoming Events", value: dashboardData.counts.upcomingEvents.toString() },
                                { label: "Past Events", value: dashboardData.counts.pastEvents.toString() },
                              ],
                            },
                            { label: "News Posts", value: dashboardData.counts.newsCount.toString() },
                          ]}
                        />
                      </div>

                      {/* Job Statistics Card */}
                      {dashboardData.jobStats && (
                        <div className="mt-8">
                          <JobStatisticsCard jobStats={dashboardData.jobStats} />
                        </div>
                      )}

                      {/* Application Statistics Card */}
                      {dashboardData.applicationStats && (
                        <div className="mt-8">
                          <ApplicationStatisticsCard applicationStats={dashboardData.applicationStats} />
                        </div>
                      )}

                      {/* Meeting Statistics Card */}
                      {dashboardData.meetingStats && (
                        <div className="mt-8">
                          <MeetingStatisticsCard meetingStats={dashboardData.meetingStats} />
                        </div>
                      )}

                      {/* User Activity Card */}
                      {dashboardData.userActivity && (
                        <div className="mt-8">
                          <UserActivityCard userActivity={dashboardData.userActivity} />
                        </div>
                      )}

                      {/* Security Audit Card */}
                      {dashboardData.securityStats && (
                        <div className="mt-8">
                          <SecurityAuditCard securityStats={dashboardData.securityStats} />
                        </div>
                      )}

                      {/* Communication Statistics Card */}
                      {dashboardData.communicationStats && (
                        <div className="mt-8">
                          <CommunicationStatisticsCard communicationStats={dashboardData.communicationStats} />
                        </div>
                      )}

                      {/* System Health Card */}
                      {dashboardData.systemHealth && (
                        <div className="mt-8">
                          <SystemHealthCard systemHealth={dashboardData.systemHealth} />
                        </div>
                      )}

                      {/* Activity Feed Card */}
                      {dashboardData.activityFeed && (
                        <div className="mt-8">
                          <ActivityFeedCard activities={dashboardData.activityFeed} />
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default AdminDashboard


