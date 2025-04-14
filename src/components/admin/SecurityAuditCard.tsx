"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShieldCheck, ShieldAlert, ShieldX, UserCheck, LogIn, LogOut, ShieldOff, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"

interface SecurityStatisticsProps {
  securityStats: {
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
}

// Event type icons
const EVENT_ICONS = {
  login: <LogIn className="h-4 w-4" />,
  login_success: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  failed_login: <ShieldX className="h-4 w-4" />,
  login_failed: <ShieldX className="h-4 w-4" />,
  lockout: <ShieldOff className="h-4 w-4" />,
  password_reset: <ShieldAlert className="h-4 w-4" />,
  account_activated: <UserCheck className="h-4 w-4" />,
  account_deactivated: <ShieldOff className="h-4 w-4" />,
  account_status_change: <ShieldAlert className="h-4 w-4" />,
  role_change: <ShieldAlert className="h-4 w-4" />,
}

// Event type colors
const EVENT_COLORS = {
  login: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  login_success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  logout: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  failed_login: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  login_failed: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  lockout: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  password_reset: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  account_activated: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  account_deactivated: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  account_status_change: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  role_change: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
}

// Login attempt colors
const LOGIN_COLORS = {
  success: "#10b981",
  login_success: "#10b981",
  failed: "#ef4444",
  login_failed: "#ef4444",
  lockout: "#f97316",
  suspicious: "#f59e0b",
}

export function SecurityAuditCard({ securityStats }: SecurityStatisticsProps) {
  // Format timestamp for better display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - eventTime.getTime()) / 1000)

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
      return eventTime.toLocaleDateString()
    }
  }

  // Normalize event type for consistent matching
  const normalizeEventType = (eventType: string): string => {
    // Convert to lowercase and replace spaces with underscores
    let normalized = eventType.toLowerCase().replace(/ /g, "_")

    // Handle specific database event types
    if (normalized === "login_success") return "login_success"
    if (normalized === "login_failed") return "login_failed"
    if (normalized === "account_status_change") return "account_status_change"

    return normalized
  }

  // Get icon for event type
  const getEventIcon = (eventType: string) => {
    const normalizedType = normalizeEventType(eventType)
    return EVENT_ICONS[normalizedType as keyof typeof EVENT_ICONS] || <ShieldCheck className="h-4 w-4" />
  }

  // Get color for event type
  const getEventColor = (eventType: string) => {
    const normalizedType = normalizeEventType(eventType)
    return (
      EVENT_COLORS[normalizedType as keyof typeof EVENT_COLORS] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300"
    )
  }

  // Get color for login attempt
  const getLoginColor = (eventType: string) => {
    const normalizedType = normalizeEventType(eventType)
    return LOGIN_COLORS[normalizedType as keyof typeof LOGIN_COLORS] || "#9ca3af"
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand" />
          <CardTitle>Security Audit</CardTitle>
        </div>
        <CardDescription>Overview of security events and login activity</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand" />
              <span>Login Attempts</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={securityStats.loginAttempts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="var(--brand)"
                    dataKey="count"
                    nameKey="eventType"
                    animationDuration={1000}
                    label={({ eventType, percent }) => `${eventType}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {securityStats.loginAttempts.map((entry, index) => (
                      <Cell key={`login-${index}`} fill={getLoginColor(entry.eventType)} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    formatter={(value, _name) => [value, "Count"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.375rem",
                      boxShadow: "var(--shadow)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
                <div className="text-sm text-muted-foreground mb-1">Account Status Changes</div>
                <div className="text-2xl font-bold">{securityStats.accountStatusChanges}</div>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
                <div className="text-sm text-muted-foreground mb-1">Failed Logins</div>
                <div className="text-2xl font-bold">
                  {securityStats.loginAttempts.find((item) => item.eventType.toLowerCase().includes("fail"))?.count || 0}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-brand" />
              <span>Recent Security Events</span>
            </h3>
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-4">
                {securityStats.recentEvents.length > 0 ? (
                  securityStats.recentEvents.map((event, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <Badge
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 font-medium",
                            getEventColor(event.eventType),
                          )}
                          variant="outline"
                        >
                          {getEventIcon(event.eventType)}
                          {event.eventType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(event.timestamp)}</span>
                      </div>
                      <div className="mt-3 pl-1 text-sm">
                        <div className="font-medium mb-1">User ID: {event.userID}</div>
                        <div className="text-muted-foreground">{event.details}</div>
                        <div className="text-xs text-muted-foreground mt-2">{formatTimestamp(event.timestamp)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                    <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                    <p>No recent security events</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
