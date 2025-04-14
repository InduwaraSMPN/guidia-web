"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Briefcase, FileText, Calendar, LogIn } from "lucide-react"

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
  registration: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  job: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  application: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  meeting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  login: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
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
            <div className="font-medium">
              {activity.data.username || `User ID: ${activity.data.userID}`} logged in
            </div>
            <div className="text-sm text-muted-foreground">
              IP: {activity.data.details?.ip || "Unknown"}
            </div>
          </>
        )
      default:
        return <div className="font-medium">Unknown activity</div>
    }
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent activities across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 pr-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <Badge
                      className={
                        ACTIVITY_COLORS[activity.type as keyof typeof ACTIVITY_COLORS] ||
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }
                      variant="outline"
                    >
                      <span className="mr-1">
                        {ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS]}
                      </span>
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2">{renderActivityContent(activity)}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No recent activities found</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
