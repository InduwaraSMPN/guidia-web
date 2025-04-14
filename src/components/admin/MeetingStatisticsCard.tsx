"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
}

// Status colors
const STATUS_COLORS = {
  requested: "#f59e0b", // Amber
  accepted: "#10b981", // Emerald
  declined: "#ef4444", // Red
  cancelled: "#6b7280", // Gray
  completed: "#3b82f6", // Blue
}

// Meeting type colors
const TYPE_COLORS = {
  student_company: "#800020", // Brand color
  student_counselor: "#0ea5e9", // Sky
  company_counselor: "#8b5cf6", // Violet
  student_student: "#ec4899", // Pink
  company_company: "#14b8a6", // Teal
  counselor_counselor: "#f97316", // Orange
}

// Meeting type labels
const TYPE_LABELS = {
  student_company: "Student-Company",
  student_counselor: "Student-Counselor",
  company_counselor: "Company-Counselor",
  student_student: "Student-Student",
  company_company: "Company-Company",
  counselor_counselor: "Counselor-Counselor",
}

// Status labels
const STATUS_LABELS = {
  requested: "Requested",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
}

export function MeetingStatisticsCard({ meetingStats }: MeetingStatisticsProps) {
  // Format hour data for better display
  const formattedHourData = meetingStats.busiestHours.map((item) => ({
    ...item,
    hour: `${item.hour}:00`,
  }))

  // Format status data for the pie chart
  const statusData = meetingStats.meetingsByStatus.map((item) => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    status: item.status,
  }))

  // Format type data for the pie chart
  const typeData = meetingStats.meetingsByType.map((item) => ({
    name: TYPE_LABELS[item.meetingType as keyof typeof TYPE_LABELS] || item.meetingType,
    value: item.count,
    meetingType: item.meetingType,
  }))

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Meeting Statistics</CardTitle>
        <CardDescription>Overview of meetings and their performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{meetingStats.totalMeetings}</div>
            <div className="text-sm text-muted-foreground">Total Meetings</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{typeof meetingStats.avgSuccessRating === 'number' ? meetingStats.avgSuccessRating.toFixed(1) : '0.0'}</div>
            <div className="text-sm text-muted-foreground">Avg. Success Rating</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{typeof meetingStats.avgPlatformRating === 'number' ? meetingStats.avgPlatformRating.toFixed(1) : '0.0'}</div>
            <div className="text-sm text-muted-foreground">Avg. Platform Rating</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {meetingStats.upcomingMeetings ? meetingStats.upcomingMeetings.length : 0}
            </div>
            <div className="text-sm text-muted-foreground">Upcoming Meetings</div>
          </div>
        </div>

        <Tabs defaultValue="distribution">
          <TabsList className="mb-4">
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Meetings by Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || "#8884d8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [value, props.payload.name]}
                        contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Meetings by Type</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              TYPE_COLORS[entry.meetingType as keyof typeof TYPE_COLORS] || "#8884d8"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [value, props.payload.name]}
                        contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-4">Status Breakdown</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Count</th>
                    <th className="text-right py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingStats.meetingsByStatus.map((status) => (
                    <tr key={status.status} className="border-b">
                      <td className="py-2 flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] || "#8884d8",
                          }}
                        ></span>
                        {STATUS_LABELS[status.status as keyof typeof STATUS_LABELS] || status.status}
                      </td>
                      <td className="text-right py-2">{status.count}</td>
                      <td className="text-right py-2">
                        {((status.count / meetingStats.totalMeetings) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Busiest Days</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={meetingStats.busiestDays}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dayOfWeek" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Meetings" fill="#800020" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Busiest Hours</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedHourData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Meetings" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <h3 className="text-lg font-medium mb-4">Upcoming Meetings</h3>
            {meetingStats.upcomingMeetings && meetingStats.upcomingMeetings.length > 0 ? (
              <div className="space-y-4">
                {meetingStats.upcomingMeetings.map((meeting) => (
                  <div key={meeting.meetingID} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{meeting.meetingTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.meetingDate).toLocaleDateString()} {meeting.startTime.substring(0, 5)} - {meeting.endTime.substring(0, 5)}
                        </p>
                      </div>
                      <div
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor:
                            TYPE_COLORS[meeting.meetingType as keyof typeof TYPE_COLORS] + "33", // Add transparency
                          color: TYPE_COLORS[meeting.meetingType as keyof typeof TYPE_COLORS],
                        }}
                      >
                        {TYPE_LABELS[meeting.meetingType as keyof typeof TYPE_LABELS] || meeting.meetingType}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Between:</span> {meeting.requestorName} and{" "}
                      {meeting.recipientName}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No upcoming meetings found</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
