"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Cell,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, BarChart3, UserCheck } from "lucide-react"
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

export function UserActivityCard({ userActivity }: UserActivityProps) {
  // Format date for trend data
  const formatTrendData = (data: Array<{ date: string; count: number }>) => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }

  const formattedTrendData = userActivity.userRegistrationTrend
    ? formatTrendData(userActivity.userRegistrationTrend)
    : []

  // Prepare data for profile completion - ensure values are numbers
  const profileCompletionData = [
    { name: "Students", value: parseFloat(userActivity.profileCompletion.student) || 0 },
    { name: "Counselors", value: parseFloat(userActivity.profileCompletion.counselor) || 0 },
    { name: "Companies", value: parseFloat(userActivity.profileCompletion.company) || 0 },
  ]

  // Define colors for profile completion
  const PROFILE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981"]

  // Get color for profile completion bar
  const getProgressColor = (value: number) => {
    if (value < 40) return "bg-red-400 dark:bg-red-500"
    if (value < 70) return "bg-yellow-400 dark:bg-yellow-500"
    return "bg-green-400 dark:bg-green-500"
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand" />
          <CardTitle>User Activity</CardTitle>
        </div>
        <CardDescription>Overview of user registrations and profile completion</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">New Users (7d)</span>
            </div>
            <div className="text-2xl font-bold">{userActivity.newUsers7Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">New Users (30d)</span>
            </div>
            <div className="text-2xl font-bold">{userActivity.newUsers30Days}</div>
          </div>
          <div className="col-span-2 md:col-span-1 bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm">Avg. Profile Completion</span>
            </div>
            <div className="text-2xl font-bold">
              {(() => {
                // Get valid values and convert strings to numbers
                const values = [
                  userActivity.profileCompletion.student,
                  userActivity.profileCompletion.counselor,
                  userActivity.profileCompletion.company
                ]
                  .map(val => typeof val === 'string' ? parseFloat(val) : val) // Convert strings to numbers
                  .filter(val => val !== undefined && val !== null && !isNaN(val)); // Filter out invalid values

                // Calculate average only if we have valid values
                if (values.length === 0) return "0.0%";

                const sum = values.reduce((acc, val) => acc + val, 0);
                return `${(sum / values.length).toFixed(1)}%`;
              })()}
            </div>
          </div>
        </div>

        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="mb-6 w-full justify-start border-b pb-px">
            <TabsTrigger value="registrations" className="data-[state=active]:bg-background">
              User Registrations
            </TabsTrigger>
            <TabsTrigger value="profiles" className="data-[state=active]:bg-background">
              Profile Completion
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="registrations"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              <span>User Registration Trend (Last 30 Days)</span>
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.375rem",
                      boxShadow: "var(--shadow)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New Users"
                    stroke="#800020"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#800020" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#800020" }}
                    animationDuration={1000}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent
            value="profiles"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-brand" />
                  <span>Profile Completion by User Type</span>
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Students</div>
                      <Badge variant="outline">{parseFloat(userActivity.profileCompletion.student) || 0}%</Badge>
                    </div>
                    <Progress
                      value={parseFloat(userActivity.profileCompletion.student) || 0}
                      className={getProgressColor(parseFloat(userActivity.profileCompletion.student) || 0)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Counselors</div>
                      <Badge variant="outline">{parseFloat(userActivity.profileCompletion.counselor) || 0}%</Badge>
                    </div>
                    <Progress
                      value={parseFloat(userActivity.profileCompletion.counselor) || 0}
                      className={getProgressColor(parseFloat(userActivity.profileCompletion.counselor) || 0)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Companies</div>
                      <Badge variant="outline">{parseFloat(userActivity.profileCompletion.company) || 0}%</Badge>
                    </div>
                    <Progress
                      value={parseFloat(userActivity.profileCompletion.company) || 0}
                      className={getProgressColor(parseFloat(userActivity.profileCompletion.company) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  <span>Completion Comparison</span>
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profileCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "var(--foreground)" }} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Completion"]}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "0.375rem",
                          boxShadow: "var(--shadow)",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Profile Completion" radius={[4, 4, 0, 0]} animationDuration={1000}>
                        {profileCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PROFILE_COLORS[index % PROFILE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}