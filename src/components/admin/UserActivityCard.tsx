"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
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
import { Progress } from "@/components/ui/progress"

interface UserActivityProps {
  userActivity: {
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
}

// Colors for the pie chart
const COLORS = ["#800020", "#0ea5e9", "#10b981"]

export function UserActivityCard({ userActivity }: UserActivityProps) {
  // Format date for trend data
  const formatTrendData = (data: Array<{ date: string; count: number }>) => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }

  const formattedRegistrationTrend = userActivity.userRegistrationTrend
    ? formatTrendData(userActivity.userRegistrationTrend)
    : []

  // Data for profile completion pie chart
  const profileCompletionData = [
    { name: "Students", value: Number(userActivity.profileCompletion.student) },
    { name: "Counselors", value: Number(userActivity.profileCompletion.counselor) },
    { name: "Companies", value: Number(userActivity.profileCompletion.company) },
  ]

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>User Activity & Engagement</CardTitle>
        <CardDescription>Overview of user registrations and profile completions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{userActivity.newUsers7Days}</div>
            <div className="text-sm text-muted-foreground">New Users (7d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{userActivity.newUsers30Days}</div>
            <div className="text-sm text-muted-foreground">New Users (30d)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">User Registration Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedRegistrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="New Registrations" stroke="#800020" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Profile Completion Rates</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profileCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name} (${value}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {profileCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Completion Rate"]}
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Profile Completion Details</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Students</span>
                <span className="text-sm font-medium">{userActivity.profileCompletion.student}%</span>
              </div>
              <Progress value={Number(userActivity.profileCompletion.student)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Counselors</span>
                <span className="text-sm font-medium">{userActivity.profileCompletion.counselor}%</span>
              </div>
              <Progress value={Number(userActivity.profileCompletion.counselor)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Companies</span>
                <span className="text-sm font-medium">{userActivity.profileCompletion.company}%</span>
              </div>
              <Progress value={Number(userActivity.profileCompletion.company)} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
