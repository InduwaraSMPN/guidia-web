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
import { Calendar, Clock, PieChartIcon, BarChart3, Star } from "lucide-react"
import { cn, formatMeetingType } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartTooltip, MeetingStatusTooltip, ScheduleTooltip } from "@/components/ui/chart-tooltip"
import { AnimatedChartContainer } from "@/components/ui/animated-chart-container"

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
  interview: "#6366f1",
  consultation: "#0ea5e9",
  counseling: "#8b5cf6",
  informational: "#ec4899",
  networking: "#14b8a6",
}

export function MeetingStatisticsCard({ meetingStats }: MeetingStatisticsProps) {
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
                  {meetingStats.upcomingMeetings.map((meeting, index) => (
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
        </Tabs>
      </CardContent>
    </Card>
  )
}
