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
  BarChart,
  Bar,
} from "recharts"

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

  const formattedMessageTrend = communicationStats.messageTrend
    ? formatTrendData(communicationStats.messageTrend)
    : []

  // Format active conversations data for the chart
  const activeConversationsData = communicationStats.activeConversations.map((conv) => ({
    name: `${conv.user1Name} & ${conv.user2Name}`,
    count: conv.messageCount,
  }))

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Communication Statistics</CardTitle>
        <CardDescription>Overview of messages and conversations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{communicationStats.totalMessages}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{communicationStats.messages7Days}</div>
            <div className="text-sm text-muted-foreground">Messages (7d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{communicationStats.messages30Days}</div>
            <div className="text-sm text-muted-foreground">Messages (30d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{communicationStats.unreadMessages}</div>
            <div className="text-sm text-muted-foreground">Unread Messages</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Message Trend (Last 30 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedMessageTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Messages" stroke="#800020" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Most Active Conversations</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeConversationsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Messages" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Active Conversations Details</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Users</th>
                <th className="text-right py-2">Messages</th>
                <th className="text-right py-2">Last Message</th>
              </tr>
            </thead>
            <tbody>
              {communicationStats.activeConversations.map((conv, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    {conv.user1Name} & {conv.user2Name}
                  </td>
                  <td className="text-right py-2">{conv.messageCount}</td>
                  <td className="text-right py-2">
                    {new Date(conv.lastMessageTime).toLocaleString()}
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
