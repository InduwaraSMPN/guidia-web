"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp, BarChart3, PieChartIcon } from "lucide-react"

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

// Define colors for application statuses
const STATUS_COLORS = {
  pending: "#f59e0b",
  accepted: "#10b981",
  rejected: "#ef4444",
  interviewing: "#6366f1",
  withdrawn: "#9ca3af",
}

export function ApplicationStatisticsCard({ applicationStats }: ApplicationStatisticsProps) {
  // Format date for trend data
  const formatTrendData = (data: Array<{ date: string; count: number }>) => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }

  const formattedTrendData = applicationStats.applicationTrend ? formatTrendData(applicationStats.applicationTrend) : []

  // Get color for application status
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS] || "#9ca3af"
  }

  // Format conversion rate as percentage
  const formattedConversionRate = `${(applicationStats.conversionRate * 100).toFixed(1)}%`

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand" />
          <CardTitle>Application Statistics</CardTitle>
        </div>
        <CardDescription>Overview of job applications and their statuses</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Total Applications</span>
            </div>
            <div className="text-2xl font-bold">{applicationStats.totalApplications}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Last 7 Days</span>
            </div>
            <div className="text-2xl font-bold">{applicationStats.applicationsLast7Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Last 30 Days</span>
            </div>
            <div className="text-2xl font-bold">{applicationStats.applicationsLast30Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Conversion Rate</span>
            </div>
            <div className="text-2xl font-bold">{formattedConversionRate}</div>
          </div>
        </div>

        <Tabs defaultValue="trend" className="w-full">
          <TabsList className="mb-6 w-full justify-start border-b pb-px">
            <TabsTrigger value="trend" className="data-[state=active]:bg-background">
              Application Trend
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-background">
              Status Breakdown
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="trend"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" />
              <span>Application Trend (Last 30 Days)</span>
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
                    name="Applications"
                    stroke="var(--brand)"
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent
            value="status"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-brand" />
                  <span>Applications by Status</span>
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStats.applicationsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="var(--brand)"
                        dataKey="count"
                        nameKey="status"
                        animationDuration={1000}
                        label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {applicationStats.applicationsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        formatter={(value, name) => [value, "Count"]}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "0.375rem",
                          boxShadow: "var(--shadow)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  <span>Status Distribution</span>
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={applicationStats.applicationsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="status" tick={{ fill: "var(--foreground)" }} />
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
                      <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]} animationDuration={1000}>
                        {applicationStats.applicationsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Application Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Count</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationStats.applicationsByStatus.map((status, index) => (
                      <tr key={index} className="border-t border-border transition-colors hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getStatusColor(status.status) }}
                            ></div>
                            <span className="font-medium">{status.status}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge variant="secondary" className="font-mono">
                            {status.count}
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge variant="outline" className="font-mono">
                            {((status.count / applicationStats.totalApplications) * 100).toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
