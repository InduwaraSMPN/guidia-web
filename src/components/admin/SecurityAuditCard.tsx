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
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SecurityAuditProps {
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

// Event type colors
const EVENT_TYPE_COLORS = {
  LOGIN_SUCCESS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  LOGIN_FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  PASSWORD_RESET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  ACCOUNT_STATUS_CHANGE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ACCOUNT_CREATED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  ACCOUNT_DELETED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function SecurityAuditCard({ securityStats }: SecurityAuditProps) {
  // Format login attempts data for the chart
  const loginAttemptsData = securityStats.loginAttempts.map((item) => ({
    name: item.eventType === "LOGIN_SUCCESS" ? "Successful" : "Failed",
    count: item.count,
    fill: item.eventType === "LOGIN_SUCCESS" ? "#22c55e" : "#ef4444",
  }))

  // Parse JSON details if they are in string format
  const parseDetails = (details: string) => {
    try {
      return typeof details === "string" ? JSON.parse(details) : details
    } catch (e) {
      return details
    }
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Security Audit</CardTitle>
        <CardDescription>Overview of security events and login attempts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {securityStats.loginAttempts.find((item) => item.eventType === "LOGIN_SUCCESS")?.count || 0}
            </div>
            <div className="text-sm text-muted-foreground">Successful Logins (7d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">
              {securityStats.loginAttempts.find((item) => item.eventType === "LOGIN_FAILED")?.count || 0}
            </div>
            <div className="text-sm text-muted-foreground">Failed Logins (7d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{securityStats.accountStatusChanges}</div>
            <div className="text-sm text-muted-foreground">Account Status Changes (7d)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Login Attempts (Last 7 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loginAttemptsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Attempts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Recent Security Events</h3>
            <ScrollArea className="h-80 w-full">
              <div className="space-y-4 pr-4">
                {securityStats.recentEvents.map((event, index) => {
                  const details = parseDetails(event.details)
                  return (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <Badge
                          className={
                            EVENT_TYPE_COLORS[event.eventType as keyof typeof EVENT_TYPE_COLORS] ||
                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }
                          variant="outline"
                        >
                          {event.eventType.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">User ID:</span> {event.userID || "N/A"}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Details:</span>{" "}
                        {details && typeof details === "object"
                          ? Object.entries(details)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")
                          : details || "No details available"}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
