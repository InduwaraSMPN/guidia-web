"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

interface ApplicationStatisticsProps {
  applicationStats: {
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
}

// Status colors
const STATUS_COLORS = {
  pending: "#f59e0b", // Amber
  reviewed: "#3b82f6", // Blue
  shortlisted: "#10b981", // Emerald
  rejected: "#ef4444", // Red
  approved: "#22c55e", // Green
}

// Status labels for better display
const STATUS_LABELS = {
  pending: "Pending",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  approved: "Approved",
}

export function ApplicationStatisticsCard({ applicationStats }: ApplicationStatisticsProps) {
  // Format date for trend data
  const formatTrendData = (data: Array<{ date: string; count: number }>) => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }

  const formattedApplicationTrend = applicationStats.applicationTrend
    ? formatTrendData(applicationStats.applicationTrend)
    : []

  // Format status data for the pie chart
  const statusData = applicationStats.applicationsByStatus.map((item) => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    status: item.status,
  }))

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Application Statistics</CardTitle>
        <CardDescription>Overview of job applications and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{applicationStats.totalApplications}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{applicationStats.applicationsLast7Days}</div>
            <div className="text-sm text-muted-foreground">New Applications (7d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{applicationStats.applicationsLast30Days}</div>
            <div className="text-sm text-muted-foreground">New Applications (30d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{applicationStats.conversionRate}%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Applications by Status</h3>
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
            <h3 className="text-lg font-medium mb-4">Application Trend (Last 30 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedApplicationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Applications" stroke="#800020" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Application Status Breakdown</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Count</th>
                <th className="text-right py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {applicationStats.applicationsByStatus.map((status) => (
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
                    {((status.count / applicationStats.totalApplications) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
