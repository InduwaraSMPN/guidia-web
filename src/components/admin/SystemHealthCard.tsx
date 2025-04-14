"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface SystemHealthProps {
  systemHealth: {
    schedulerStatus: {
      isRunning: boolean
      scheduledJobs: Array<{
        name: string
        nextInvocation: string | null
      }>
    }
    databaseStatus: string
    serverTime: string
  }
}

export function SystemHealthCard({ systemHealth }: SystemHealthProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Overview of system components and scheduled tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-lg flex items-center">
            <div className="mr-3">
              {systemHealth.schedulerStatus.isRunning ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium">Scheduler</div>
              <div className="text-sm text-muted-foreground">
                {systemHealth.schedulerStatus.isRunning ? "Running" : "Stopped"}
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg flex items-center">
            <div className="mr-3">
              {systemHealth.databaseStatus === "connected" ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium">Database</div>
              <div className="text-sm text-muted-foreground">
                {systemHealth.databaseStatus === "connected" ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg flex items-center">
            <div className="mr-3">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium">Server Time</div>
              <div className="text-sm text-muted-foreground">
                {new Date(systemHealth.serverTime).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Scheduled Tasks</h3>
          {systemHealth.schedulerStatus.scheduledJobs.length > 0 ? (
            <div className="space-y-4">
              {systemHealth.schedulerStatus.scheduledJobs.map((job, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{job.name}</div>
                    <Badge variant={job.nextInvocation ? "outline" : "secondary"}>
                      {job.nextInvocation ? "Scheduled" : "Not Scheduled"}
                    </Badge>
                  </div>
                  {job.nextInvocation && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Next run: {new Date(job.nextInvocation).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No scheduled tasks found</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
