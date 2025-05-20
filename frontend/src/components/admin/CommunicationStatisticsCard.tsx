
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, TrendingUp, Clock, Users } from "lucide-react"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { AnimatedChartContainer } from "@/components/ui/animated-chart-container"

interface CommunicationStatisticsProps {
  communicationStats: {
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
}

export function CommunicationStatisticsCard({ communicationStats }: CommunicationStatisticsProps) {
  // Format date for trend data
  const formatTrendData = (data: Array<{ date: string; count: number }>) => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }

  const formattedTrendData = communicationStats.messageTrend ? formatTrendData(communicationStats.messageTrend) : []

  // Format timestamp for better display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    } else {
      return messageTime.toLocaleDateString()
    }
  }

  // Prepare weekly stats
  const getWeekStats = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const now = new Date()
    const dayOfWeek = now.getDay()

    // Create data for the last 7 days (current day and 6 previous days)
    return days.map((day, index) => {
      // Calculate the day index, handling circular reference around the week
      const dataIndex = (dayOfWeek - 6 + index + 7) % 7
      // Get the corresponding trend data if it exists
      const matchingData = formattedTrendData.slice(-7)[dataIndex]
      return {
        day,
        count: matchingData ? matchingData.count : 0,
      }
    })
  }

  const weekStats = getWeekStats()

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 hover:border-border">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand" />
          <CardTitle>Communication Statistics</CardTitle>
        </div>
        <CardDescription>Overview of messages and conversations across the platform</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Total Messages</span>
            </div>
            <div className="text-2xl font-bold">{communicationStats.totalMessages}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Last 7 Days</span>
            </div>
            <div className="text-2xl font-bold">{communicationStats.messages7Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Last 30 Days</span>
            </div>
            <div className="text-2xl font-bold">{communicationStats.messages30Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Unread Messages</span>
            </div>
            <div className="text-2xl font-bold">{communicationStats.unreadMessages}</div>
          </div>
        </div>

        <Tabs defaultValue="trend" className="w-full">
          <TabsList className="mb-6 w-full justify-start border-b pb-px">
            <TabsTrigger value="trend" className="data-[state=active]:bg-background">
              Message Trend
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-background">
              Weekly Activity
            </TabsTrigger>
            <TabsTrigger value="conversations" className="data-[state=active]:bg-background">
              Active Conversations
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="trend"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              <span>Message Trend (Last 30 Days)</span>
            </h3>
            <AnimatedChartContainer className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip
                    animationDuration={200}
                    animationEasing="ease-out"
                    cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "4 4" }}
                    content={({ active, payload, label }) => (
                      <ChartTooltip
                        active={active}
                        payload={payload}
                        label={label}
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value) => [value, "Messages"]}
                      />
                    )}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Messages"
                    stroke="#800020"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#800020", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      stroke: "#fff",
                      fill: "#800020",
                      boxShadow: "0 0 0 4px rgba(128, 0, 32, 0.2)"
                    }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </AnimatedChartContainer>
          </TabsContent>

          <TabsContent
            value="weekly"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand" />
              <span>Weekly Message Activity</span>
            </h3>
            <AnimatedChartContainer className="h-96" delay={0.2}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="day" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip
                    animationDuration={200}
                    animationEasing="ease-out"
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                    content={({ active, payload, label }) => (
                      <ChartTooltip
                        active={active}
                        payload={payload}
                        label={label}
                        labelFormatter={(label) => `Day: ${label}`}
                        formatter={(value) => [value, "Messages"]}
                      />
                    )}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Messages"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedChartContainer>
          </TabsContent>

          <TabsContent
            value="conversations"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand" />
              <span>Most Active Conversations</span>
            </h3>

            {communicationStats.activeConversations.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {communicationStats.activeConversations.map((conversation, index) => (
                    <div
                      key={`${conversation.user1ID}-${conversation.user2ID}`}
                      className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-lg flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{conversation.user1Name}</span>
                            <span className="text-muted-foreground">and</span>
                            <span>{conversation.user2Name}</span>
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{conversation.messageCount} messages</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Last message {formatRelativeTime(conversation.lastMessageTime)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-medium whitespace-nowrap">
                          ID: {conversation.user1ID}-{conversation.user2ID}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                <p>No active conversations found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
