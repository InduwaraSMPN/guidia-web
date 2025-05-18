"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, PieChartIcon, BarChart3, Star, Users, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react"
import { cn, formatMeetingType } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MeetingStatusTooltip, ScheduleTooltip } from "@/components/ui/chart-tooltip"
import { AnimatedChartContainer } from "@/components/ui/animated-chart-container"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useMemo } from "react"
import { CsvExporter } from "./CsvExporter"

interface MeetingStatisticsProps {
  meetingStats: {
    totalMeetings: number
    meetingsByStatus: Array<{
      status: string
      count: number
    }>
    meetingsByType: Array<{
      meetingType: string
      count: number
    }>
    avgSuccessRating: number | null | undefined
    avgPlatformRating: number | null | undefined
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
    counselorPerformance?: {
      counselors: Array<{
        counselorID: string
        counselorName: string
        userID: string
        totalMeetings: number
        totalMeetingsReceived: number
        acceptedMeetings: number
        declinedMeetings: number
        requestedMeetings: number
        cancelledMeetings: number
        completedMeetings: number
        acceptanceRate: number
        declineRate: number
        requestRate: number
        cancellationRate: number
        completionRate: number
      }>
      metrics: {
        acceptanceRate: {
          highest: {
            counselorID: string
            counselorName: string
            acceptanceRate: number
          } | null
          lowest: {
            counselorID: string
            counselorName: string
            acceptanceRate: number
          } | null
        }
        requestRate: {
          highest: {
            counselorID: string
            counselorName: string
            requestRate: number
          } | null
          lowest: {
            counselorID: string
            counselorName: string
            requestRate: number
          } | null
        }
        declineRate: {
          highest: {
            counselorID: string
            counselorName: string
            declineRate: number
          } | null
          lowest: {
            counselorID: string
            counselorName: string
            declineRate: number
          } | null
        }
        cancellationRate: {
          highest: {
            counselorID: string
            counselorName: string
            cancellationRate: number
          } | null
          lowest: {
            counselorID: string
            counselorName: string
            cancellationRate: number
          } | null
        }
        completionRate: {
          highest: {
            counselorID: string
            counselorName: string
            completionRate: number
          } | null
          lowest: {
            counselorID: string
            counselorName: string
            completionRate: number
          } | null
        }
      }
    }
  }
}

// Define colors for meeting statuses
const STATUS_COLORS = {
  scheduled: "#10b981",
  completed: "#3b82f6",
  cancelled: "#ef4444",
  pending: "#f59e0b",
}

// Define colors for meeting types
const TYPE_COLORS = {
  student_company: "#6366f1",
  student_counselor: "#0ea5e9",
  company_counselor: "#8b5cf6",
  student_student: "#ec4899",
  company_company: "#14b8a6",
  counselor_counselor: "#10b981",
  "": "#9ca3af", // Empty meeting type
  unspecified: "#9ca3af" // Unspecified meeting type (from backend)
}

export function MeetingStatisticsCard({ meetingStats }: MeetingStatisticsProps) {
  const [counselorSearch, setCounselorSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Define CSV columns for counselor performance data
  const counselorCsvColumns = useMemo(() => [
    { id: 'counselorName', header: 'Counselor Name' },
    { id: 'totalMeetings', header: 'Total Meetings' },
    { id: 'acceptanceRate', header: 'Acceptance Rate (%)' },
    { id: 'completionRate', header: 'Completion Rate (%)' },
    { id: 'declineRate', header: 'Decline Rate (%)' },
    { id: 'cancellationRate', header: 'Cancellation Rate (%)' },
  ], []);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [counselorSearch]);

  // Get filtered and paginated counselors
  const filteredCounselors = useMemo(() => {
    if (!meetingStats.counselorPerformance) return [];

    return meetingStats.counselorPerformance.counselors
      .filter(c => {
        if (!counselorSearch.trim()) {
          // Show all counselors, including those with 0 meetings
          return true;
        }
        const query = counselorSearch.trim().toLowerCase();
        // Safely convert values to strings before calling toLowerCase()
        const counselorName = String(c.counselorName || '').toLowerCase();
        const userID = String(c.userID || '').toLowerCase();
        const counselorID = String(c.counselorID || '').toLowerCase();

        return counselorName.includes(query) ||
               userID.includes(query) ||
               counselorID.includes(query);
      })
      .sort((a, b) => b.totalMeetings - a.totalMeetings);
  }, [counselorSearch, meetingStats.counselorPerformance]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCounselors.length / itemsPerPage);
  const paginatedCounselors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCounselors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCounselors, currentPage, itemsPerPage]);
  // Get color for meeting status
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS] || "#9ca3af"
  }

  // Get color for meeting type
  const getTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase()
    return TYPE_COLORS[normalizedType as keyof typeof TYPE_COLORS] || "#9ca3af"
  }

  // Format busiest hours data for better display
  const formatHourData = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour} ${ampm}`
  }

  const formattedBusiestHours = meetingStats.busiestHours.map((item) => ({
    ...item,
    formattedHour: formatHourData(item.hour),
  }))

  // Format rating as stars
  const formatRating = (rating: number | null | undefined) => {
    // Ensure rating is a number and has a valid value
    const numericRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0

    const fullStars = Math.floor(numericRating)
    const hasHalfStar = numericRating % 1 >= 0.5
    const maxStars = 5

    return (
      <div className="flex items-center gap-1.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-4 w-4 text-yellow-400" />
            <Star
              className="absolute top-0 left-0 h-4 w-4 fill-yellow-400 text-yellow-400 overflow-hidden"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </div>
        )}
        {Array.from({ length: maxStars - fullStars - (hasHalfStar ? 1 : 0) }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground/30" />
        ))}
        <span className="ml-1 text-sm font-medium">{numericRating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 hover:border-border">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand" />
            <CardTitle>Meeting Statistics</CardTitle>
          </div>
        </div>
        <CardDescription>Overview of meetings, their distribution and ratings</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Total Meetings</span>
            </div>
            <div className="text-2xl font-bold">{meetingStats.totalMeetings}</div>
          </div>

          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-sm">Success Rating</span>
            </div>
            <div className="text-xl font-bold">{formatRating(meetingStats.avgSuccessRating)}</div>
          </div>

          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-sm">Platform Rating</span>
            </div>
            <div className="text-xl font-bold">{formatRating(meetingStats.avgPlatformRating)}</div>
          </div>

          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Busiest Day</span>
            </div>
            <div className="text-2xl font-bold">{meetingStats.busiestDays[0]?.dayOfWeek || "N/A"}</div>
          </div>
        </div>

        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="mb-6 w-full justify-start border-b pb-px">
            <TabsTrigger value="distribution" className="data-[state=active]:bg-background">
              Distribution
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-background">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-background">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="counselors" className="data-[state=active]:bg-background">
              Counselor Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="distribution"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-brand" />
                  <span>Meetings by Status</span>
                </h3>
                <AnimatedChartContainer className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={meetingStats.meetingsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="var(--brand)"
                        dataKey="count"
                        nameKey="status"
                        animationDuration={1000}
                        label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {meetingStats.meetingsByStatus.map((entry, index) => (
                          <Cell key={`status-${index}`} fill={getStatusColor(entry.status)} />
                        ))}
                      </Pie>
                      <Legend formatter={(value) => formatMeetingType(value)} />
                      <Tooltip
                        animationDuration={200}
                        animationEasing="ease-out"
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            // Add total to payload for percentage calculation
                            payload[0].payload.total = meetingStats.totalMeetings;
                          }
                          return <MeetingStatusTooltip active={active} payload={payload} />
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </AnimatedChartContainer>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-brand" />
                  <span>Meetings by Type</span>
                </h3>
                <AnimatedChartContainer className="h-96" delay={0.2}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={meetingStats.meetingsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="var(--brand)"
                        dataKey="count"
                        nameKey="meetingType"
                        animationDuration={1000}
                        label={({ meetingType, percent }) => `${formatMeetingType(meetingType)}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {meetingStats.meetingsByType.map((entry, index) => (
                          <Cell key={`type-${index}`} fill={getTypeColor(entry.meetingType)} />
                        ))}
                      </Pie>
                      <Legend formatter={(value) => formatMeetingType(value)} />
                      <Tooltip
                        animationDuration={200}
                        animationEasing="ease-out"
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            // Add total to payload for percentage calculation
                            payload[0].payload.total = meetingStats.totalMeetings;
                          }
                          return <MeetingStatusTooltip active={active} payload={payload} />
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </AnimatedChartContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="schedule"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  <span>Busiest Days of the Week</span>
                </h3>
                <AnimatedChartContainer className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={meetingStats.busiestDays}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="dayOfWeek" tick={{ fill: "var(--foreground)" }} />
                      <YAxis tick={{ fill: "var(--foreground)" }} />
                      <Tooltip
                        animationDuration={200}
                        animationEasing="ease-out"
                        cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                        content={({ active, payload }) => (
                          <ScheduleTooltip active={active} payload={payload} />
                        )}
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Meetings"
                        fill="var(--brand)"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </AnimatedChartContainer>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand" />
                  <span>Busiest Hours of the Day</span>
                </h3>
                <AnimatedChartContainer className="h-96" delay={0.2}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedBusiestHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="formattedHour" tick={{ fill: "var(--foreground)" }} />
                      <YAxis tick={{ fill: "var(--foreground)" }} />
                      <Tooltip
                        animationDuration={200}
                        animationEasing="ease-out"
                        cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                        content={({ active, payload }) => (
                          <ScheduleTooltip active={active} payload={payload} />
                        )}
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Meetings"
                        fill="#0ea5e9"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </AnimatedChartContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="upcoming"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand" />
              <span>Upcoming Meetings</span>
            </h3>

            {meetingStats.upcomingMeetings.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {meetingStats.upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.meetingID}
                      className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-lg">{meeting.meetingTitle}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(meeting.meetingDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {meeting.startTime} - {meeting.endTime}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Between </span>
                            <span className="font-medium">{meeting.requestorName}</span>
                            <span className="text-muted-foreground"> and </span>
                            <span className="font-medium">{meeting.recipientName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={cn(
                              "font-medium",
                              meeting.status.toLowerCase() === "scheduled" &&
                                "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
                              meeting.status.toLowerCase() === "pending" &&
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
                            )}
                          >
                            {meeting.status}
                          </Badge>
                          <Badge variant="outline" className="font-medium">
                            {formatMeetingType(meeting.meetingType)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                <p>No upcoming meetings found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="counselors"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand" />
              <span>Counselor Performance Metrics</span>
            </h3>

            {meetingStats.counselorPerformance ? (
              <div className="space-y-8">
                {/* Performance Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Acceptance Rate */}
                  <div className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-md">
                    <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-800 dark:text-green-300">Acceptance Rate</span>
                    </h4>
                    <div className="space-y-3">
                      {meetingStats.counselorPerformance.metrics.acceptanceRate.highest && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Highest:</span>
                            <span className="font-medium">{meetingStats.counselorPerformance.metrics.acceptanceRate.highest.counselorName}</span>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800">
                            {meetingStats.counselorPerformance.metrics.acceptanceRate.highest.acceptanceRate.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                      {meetingStats.counselorPerformance.metrics.acceptanceRate.lowest && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Lowest:</span>
                            <span className="font-medium">{meetingStats.counselorPerformance.metrics.acceptanceRate.lowest.counselorName}</span>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800">
                            {meetingStats.counselorPerformance.metrics.acceptanceRate.lowest.acceptanceRate.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-md">
                    <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-800 dark:text-blue-300">Completion Rate</span>
                    </h4>
                    <div className="space-y-3">
                      {meetingStats.counselorPerformance.metrics.completionRate.highest && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Highest:</span>
                            <span className="font-medium">{meetingStats.counselorPerformance.metrics.completionRate.highest.counselorName}</span>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {meetingStats.counselorPerformance.metrics.completionRate.highest.completionRate.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                      {meetingStats.counselorPerformance.metrics.completionRate.lowest && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Lowest:</span>
                            <span className="font-medium">{meetingStats.counselorPerformance.metrics.completionRate.lowest.counselorName}</span>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {meetingStats.counselorPerformance.metrics.completionRate.lowest.completionRate.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Decline Rate */}
                  <div className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-md">
                    <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-800 dark:text-red-300">Decline Rate</span>
                    </h4>
                    <div className="space-y-3">
                      {meetingStats.counselorPerformance.metrics.declineRate.highest && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Highest:</span>
                            <span className="font-medium">{meetingStats.counselorPerformance.metrics.declineRate.highest.counselorName}</span>
                          </div>
                          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800">
                            {meetingStats.counselorPerformance.metrics.declineRate.highest.declineRate.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                      {meetingStats.counselorPerformance.metrics.declineRate.lowest && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Lowest:</span>
                            <span className="font-medium">{meetingStats.counselorPerformance.metrics.declineRate.lowest.counselorName}</span>
                          </div>
                          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800">
                            {meetingStats.counselorPerformance.metrics.declineRate.lowest.declineRate.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cancellation Rate */}
                  <div className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-md">
                    <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-800 dark:text-amber-300">Cancellation Rate</span>
                    </h4>
                    <div className="space-y-3">
                      {meetingStats.counselorPerformance.metrics.cancellationRate.highest && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">Highest:</span>
                            <span className="font-medium">{meetingStats.counselorPerformance.metrics.cancellationRate.highest.counselorName}</span>
                          </div>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                            {meetingStats.counselorPerformance.metrics.cancellationRate.highest.cancellationRate.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                      {meetingStats.counselorPerformance.metrics.cancellationRate.lowest && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">Lowest:</span>
                            <span className="font-medium">{meetingStats.counselorPerformance.metrics.cancellationRate.lowest.counselorName}</span>
                          </div>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                            {meetingStats.counselorPerformance.metrics.cancellationRate.lowest.cancellationRate.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Counselor Performance Table */}
                <div>
                  <h4 className="text-md font-medium mb-3">Detailed Counselor Performance</h4>
                  <div className="rounded-lg border border-border shadow-sm overflow-hidden bg-white">
                    <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-white">
                      <div className="relative w-64">
                        <input
                          type="text"
                          placeholder="Search counselors..."
                          value={counselorSearch}
                          onChange={(e) => setCounselorSearch(e.target.value)}
                          className="w-full pl-10 pr-8 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        {counselorSearch && (
                          <button
                            onClick={() => setCounselorSearch("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <CsvExporter
                        data={filteredCounselors}
                        columns={counselorCsvColumns}
                        tableName="counselor-performance"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-secondary focus:ring-2 focus:ring-[#800020]/20 focus:outline-none"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </motion.button>
                      </CsvExporter>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs text-foreground uppercase bg-secondary sticky top-0">
                          <tr>
                            <th scope="col" className="px-8 py-4 font-normal">Counselor</th>
                            <th scope="col" className="px-8 py-4 text-right font-normal">Total Meetings</th>
                            <th scope="col" className="px-8 py-4 text-right font-normal">Acceptance Rate</th>
                            <th scope="col" className="px-8 py-4 text-right font-normal">Completion Rate</th>
                            <th scope="col" className="px-8 py-4 text-right font-normal">Decline Rate</th>
                            <th scope="col" className="px-8 py-4 text-right font-normal">Cancellation Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <AnimatePresence>
                            {paginatedCounselors.map((counselor) => (
                              <motion.tr
                                layout
                                key={counselor.counselorID}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="hover:bg-secondary transition-colors duration-200 bg-white"
                              >
                                <td className="px-8 py-4 font-normal text-foreground">{counselor.counselorName}</td>
                                <td className="px-8 py-4 text-right font-normal">{counselor.totalMeetings}</td>
                                <td className="px-8 py-4 text-right">
                                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800">
                                    {counselor.acceptanceRate.toFixed(1)}%
                                  </Badge>
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                    {counselor.completionRate.toFixed(1)}%
                                  </Badge>
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800">
                                    {counselor.declineRate.toFixed(1)}%
                                  </Badge>
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                                    {counselor.cancellationRate.toFixed(1)}%
                                  </Badge>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                          {filteredCounselors.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-8 py-10 text-center text-muted-foreground">
                                {counselorSearch ?
                                  `No counselors matching "${counselorSearch}" found` :
                                  "No counselor performance data available"
                                }
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {/* Pagination Controls */}
                      {filteredCounselors.length > itemsPerPage && (
                        <div className="flex items-center justify-between px-8 py-4 border-t border-border bg-white">
                          <div className="text-sm text-muted-foreground">
                            Showing {Math.min(filteredCounselors.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredCounselors.length, currentPage * itemsPerPage)} of {filteredCounselors.length} counselors
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                            >
                              Previous
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                              // Show first page, last page, current page, and pages around current
                              let pageToShow = i + 1;
                              if (totalPages > 5) {
                                if (currentPage <= 3) {
                                  // Near start: show first 5 pages
                                  pageToShow = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  // Near end: show last 5 pages
                                  pageToShow = totalPages - 4 + i;
                                } else {
                                  // Middle: show current page and 2 pages on each side
                                  pageToShow = currentPage - 2 + i;
                                }
                              }

                              return (
                                <button
                                  key={pageToShow}
                                  onClick={() => setCurrentPage(pageToShow)}
                                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    currentPage === pageToShow
                                      ? 'bg-brand text-white'
                                      : 'border border-border hover:bg-secondary'
                                  }`}
                                >
                                  {pageToShow}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                <p>No counselor performance data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
