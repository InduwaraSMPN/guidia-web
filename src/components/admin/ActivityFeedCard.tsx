"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Briefcase, FileText, Calendar, LogIn, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ActivityFeedProps {
  activities: Array<{
    type: string
    timestamp: string
    data: any
  }>
}

// Activity type icons
const ACTIVITY_ICONS = {
  registration: <UserPlus className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  application: <FileText className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  login: <LogIn className="h-4 w-4" />,
}

// Activity type colors
const ACTIVITY_COLORS = {
  registration: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  job: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  application: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  meeting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  login: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
}

export function ActivityFeedCard({ activities }: ActivityFeedProps) {
  // Function to render activity content based on type
  const renderActivityContent = (activity: { type: string; data: any }) => {
    switch (activity.type) {
      case "registration":
        return (
          <>
            <div className="font-medium">{activity.data.username || activity.data.email} registered</div>
            <div className="text-sm text-muted-foreground">
              Status: {activity.data.status.charAt(0).toUpperCase() + activity.data.status.slice(1)}
            </div>
          </>
        )
      case "job":
        return (
          <>
            <div className="font-medium">New job posted: {activity.data.title}</div>
            <div className="text-sm text-muted-foreground">
              By {activity.data.companyName} • {activity.data.location}
            </div>
          </>
        )
      case "application":
        return (
          <>
            <div className="font-medium">
              {activity.data.studentName} applied to {activity.data.jobTitle}
            </div>
            <div className="text-sm text-muted-foreground">
              Status: {activity.data.status.charAt(0).toUpperCase() + activity.data.status.slice(1)}
            </div>
          </>
        )
      case "meeting":
        return (
          <>
            <div className="font-medium">{activity.data.meetingTitle}</div>
            <div className="text-sm text-muted-foreground">
              Between {activity.data.requestorName} and {activity.data.recipientName}
            </div>
          </>
        )
      case "login":
        return (
          <>
            <div className="font-medium">{activity.data.username || `User ID: ${activity.data.userID}`} logged in</div>
            <div className="text-sm text-muted-foreground">IP: {activity.data.details?.ip || "Unknown"}</div>
          </>
        )
      default:
        return <div className="font-medium">Unknown activity</div>
    }
  }

  // Function to format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000)

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
      return activityTime.toLocaleDateString()
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 hover:border-border">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand" />
          <CardTitle>Activity Feed</CardTitle>
        </div>
        <CardDescription>Recent activities across the platform</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <Badge
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 font-medium",
                        ACTIVITY_COLORS[activity.type as keyof typeof ACTIVITY_COLORS] ||
                          "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
                      )}
                      variant="outline"
                    >
                      {ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS]}
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</span>
                  </div>
                  <div className="mt-3 pl-1">{renderActivityContent(activity)}</div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border"
              >
                <Activity className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                <p>No recent activities found</p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
