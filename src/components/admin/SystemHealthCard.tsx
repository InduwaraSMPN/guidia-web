"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Server, Database, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 hover:border-border">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-brand" />
          <CardTitle>System Health</CardTitle>
        </div>
        <CardDescription>Overview of system components and scheduled tasks</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            className={cn(
              "p-4 rounded-lg border transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md",
              systemHealth.schedulerStatus.isRunning
                ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  systemHealth.schedulerStatus.isRunning
                    ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
                )}
              >
                {systemHealth.schedulerStatus.isRunning ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="font-medium">Scheduler</div>
                <div
                  className={cn(
                    "text-sm",
                    systemHealth.schedulerStatus.isRunning
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {systemHealth.schedulerStatus.isRunning ? "Running" : "Stopped"}
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "p-4 rounded-lg border transition-all duration-200 hover:translate-y-[-2px]",
              systemHealth.databaseStatus === "connected"
                ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  systemHealth.databaseStatus === "connected"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
                )}
              >
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">Database</div>
                <div
                  className={cn(
                    "text-sm",
                    systemHealth.databaseStatus === "connected"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {systemHealth.databaseStatus === "connected" ? "Connected" : "Disconnected"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-foreground">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">Server Time</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(systemHealth.serverTime).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand" />
            <span>Scheduled Tasks</span>
          </h3>
          {systemHealth.schedulerStatus.scheduledJobs.length > 0 ? (
            <div className="space-y-3">
              {systemHealth.schedulerStatus.scheduledJobs.map((job, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 transition-all duration-200 hover:border-border/80 hover:bg-accent/10 hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{job.name}</div>
                    <Badge
                      variant={job.nextInvocation ? "default" : "secondary"}
                      className="transition-all duration-200"
                    >
                      {job.nextInvocation ? "Scheduled" : "Not Scheduled"}
                    </Badge>
                  </div>
                  {job.nextInvocation && (
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Next run: {new Date(job.nextInvocation).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
              <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
              <p>No scheduled tasks found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
