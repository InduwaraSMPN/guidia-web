
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
  LabelList,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, BarChart3, UserCheck } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { AnimatedChartContainer } from "@/components/ui/animated-chart-container"
import { AnimatedProgress } from "@/components/ui/animated-progress"
import { motion } from "framer-motion"

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

  // Prepare data for profile completion - ensure values are numbers and cap at 100%
  const capPercentage = (value: number | string): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) ? Math.min(num, 100) : 0; // Cap at 100%
  };

  const profileCompletionData = [
    { name: "Students", value: capPercentage(userActivity.profileCompletion.student) },
    { name: "Counselors", value: capPercentage(userActivity.profileCompletion.counselor) },
    { name: "Companies", value: capPercentage(userActivity.profileCompletion.company) },
  ]

  // Define colors for profile completion
  const PROFILE_COLORS = ["#4f46e5", "#800020", "#0ea5e9"]

  // Get color for profile completion bar
  const getProgressColor = (value: number | string) => {
    const percentage = capPercentage(value);
    if (percentage < 40) return "bg-red-400 dark:bg-red-500"
    if (percentage < 70) return "bg-yellow-400 dark:bg-yellow-500"
    return "bg-green-400 dark:bg-green-500"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
    >
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 hover:border-border">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand" />
          <CardTitle>User Activity</CardTitle>
        </div>
        <CardDescription>Overview of user registrations and profile completion</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">New Users (7d)</span>
            </div>
            <div className="text-2xl font-bold">{userActivity.newUsers7Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">New Users (30d)</span>
            </div>
            <div className="text-2xl font-bold">{userActivity.newUsers30Days}</div>
          </div>
          <div className="col-span-2 md:col-span-1 bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm">Avg. Profile Completion</span>
            </div>
            <div className="text-2xl font-bold">
              {(() => {
                // Get valid values, convert strings to numbers, and cap at 100%
                const values = [
                  userActivity.profileCompletion.student,
                  userActivity.profileCompletion.counselor,
                  userActivity.profileCompletion.company
                ]
                  .map(val => capPercentage(val)) // Convert and cap at 100%
                  .filter(val => !isNaN(val)); // Filter out invalid values

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
            <AnimatedChartContainer className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip
                    animationDuration={200}
                    animationEasing="ease-out"
                    cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "4 4" }}
                    content={({ active, payload, label }) => (
                      <ChartTooltip
                        active={active}
                        payload={payload}
                        label={label}
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value) => [value, "New Users"]}
                      />
                    )}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New Users"
                    stroke="#800020"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#800020", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      stroke: "#fff",
                      fill: "#800020",
                      boxShadow: "0 0 0 4px rgba(128, 0, 32, 0.2)"
                    }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </AnimatedChartContainer>
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
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnimatedProgress
                    label="Students"
                    value={capPercentage(userActivity.profileCompletion.student)}
                    colorClass={getProgressColor(userActivity.profileCompletion.student)}
                    delay={0.1}
                  />

                  <AnimatedProgress
                    label="Counselors"
                    value={capPercentage(userActivity.profileCompletion.counselor)}
                    colorClass={getProgressColor(userActivity.profileCompletion.counselor)}
                    delay={0.3}
                  />

                  <AnimatedProgress
                    label="Companies"
                    value={capPercentage(userActivity.profileCompletion.company)}
                    colorClass={getProgressColor(userActivity.profileCompletion.company)}
                    delay={0.5}
                  />
                </motion.div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  <span>Completion Comparison</span>
                </h3>
                <AnimatedChartContainer className="h-96" delay={0.2}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profileCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "var(--foreground)" }} />
                      <Tooltip
                        animationDuration={200}
                        animationEasing="ease-out"
                        cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;

                          const data = payload[0].payload;
                          const value = data.value;
                          const name = data.name;
                          const color = PROFILE_COLORS[profileCompletionData.findIndex(item => item.name === name) % PROFILE_COLORS.length];

                          return (
                            <div className="bg-card border border-border p-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                <p className="font-semibold">{name}</p>
                              </div>
                              <div className="bg-muted/40 p-3 rounded-md">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Completion:</span>
                                  <span className="font-medium text-lg">{value}%</span>
                                </div>
                                <div className="mt-2 w-full bg-background/50 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${value}%`,
                                      backgroundColor: color,
                                      transition: 'width 0.3s ease-out'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Profile Completion"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                        barSize={40}
                        isAnimationActive={true}
                      >
                        {profileCompletionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PROFILE_COLORS[index % PROFILE_COLORS.length]}
                            stroke={PROFILE_COLORS[index % PROFILE_COLORS.length]}
                            strokeWidth={1}
                          />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="top"
                          formatter={(value: number) => `${value}%`}
                          style={{
                            fill: 'var(--foreground)',
                            fontSize: 12,
                            fontWeight: 500,
                            opacity: 0.9
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </AnimatedChartContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </motion.div>
  )
}