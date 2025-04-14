"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Briefcase, TrendingUp, Eye, FileText } from "lucide-react"

interface JobStatisticsProps {
  jobStats: {
    totalActiveJobs: number
    jobsLast7Days: number
    jobsLast30Days: number
    jobsExpiringSoon: number
    mostViewedJobs: Array<{
      jobID: number
      title: string
      companyID: number
      companyName: string
      viewCount: number
    }>
    leastViewedJobs: Array<{
      jobID: number
      title: string
      companyID: number
      companyName: string
      viewCount: number
    }>
    mostApplicationJobs: Array<{
      jobID: number
      title: string
      companyID: number
      companyName: string
      applicationCount: number
    }>
    leastApplicationJobs: Array<{
      jobID: number
      title: string
      companyID: number
      companyName: string
      applicationCount: number
    }>
    jobPostingTrend: Array<{
      date: string
      count: number
    }>
    jobViewsTrend: Array<{
      date: string
      count: number
    }>
  }
}

export function JobStatisticsCard({ jobStats }: JobStatisticsProps) {
  // Format date for trend data
  const formatTrendData = (data: Array<{ date: string; count: number }>) => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }

  const formattedJobPostingTrend = jobStats.jobPostingTrend ? formatTrendData(jobStats.jobPostingTrend) : []
  const formattedJobViewsTrend = jobStats.jobViewsTrend ? formatTrendData(jobStats.jobViewsTrend) : []

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-brand" />
          <CardTitle>Job Statistics</CardTitle>
        </div>
        <CardDescription>Overview of job postings and applications</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">Active Jobs</span>
            </div>
            <div className="text-2xl font-bold">{jobStats.totalActiveJobs}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">New Jobs (7d)</span>
            </div>
            <div className="text-2xl font-bold">{jobStats.jobsLast7Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">New Jobs (30d)</span>
            </div>
            <div className="text-2xl font-bold">{jobStats.jobsLast30Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Expiring Soon</span>
            </div>
            <div className="text-2xl font-bold">{jobStats.jobsExpiringSoon}</div>
          </div>
        </div>

        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="mb-6 w-full justify-start border-b pb-px">
            <TabsTrigger value="trends" className="data-[state=active]:bg-background">
              Trends
            </TabsTrigger>
            <TabsTrigger value="mostViewed" className="data-[state=active]:bg-background">
              Most Viewed
            </TabsTrigger>
            <TabsTrigger value="leastViewed" className="data-[state=active]:bg-background">
              Least Viewed
            </TabsTrigger>
            <TabsTrigger value="mostApplications" className="data-[state=active]:bg-background">
              Most Applications
            </TabsTrigger>
            <TabsTrigger value="leastApplications" className="data-[state=active]:bg-background">
              Least Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="trends"
            className="space-y-6 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <div className="h-80">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                <span>Job Posting Trend (Last 30 Days)</span>
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedJobPostingTrend}>
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
                    name="New Job Postings"
                    stroke="var(--brand)"
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-80">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand" />
                <span>Job Views Trend (Last 30 Days)</span>
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedJobViewsTrend}>
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
                    name="Job Views"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent
            value="mostViewed"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand" />
              <span>Most Viewed Jobs</span>
            </h3>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.mostViewedJobs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border p-3 rounded-lg shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-sm text-muted-foreground">{data.companyName}</p>
                            <p className="text-sm mt-1 flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span className="font-medium">{data.viewCount}</span> views
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="viewCount"
                    name="Views"
                    fill="var(--brand)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.mostViewedJobs.map((job, index) => (
                    <tr key={job.jobID} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{job.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{job.companyName}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary" className="font-mono">
                          {job.viewCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent
            value="leastViewed"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand" />
              <span>Least Viewed Jobs</span>
            </h3>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.leastViewedJobs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border p-3 rounded-lg shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-sm text-muted-foreground">{data.companyName}</p>
                            <p className="text-sm mt-1 flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span className="font-medium">{data.viewCount}</span> views
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="viewCount" name="Views" fill="#0ea5e9" radius={[4, 4, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.leastViewedJobs.map((job) => (
                    <tr key={job.jobID} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{job.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{job.companyName}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary" className="font-mono">
                          {job.viewCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent
            value="mostApplications"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <span>Jobs with Most Applications</span>
            </h3>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.mostApplicationJobs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border p-3 rounded-lg shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-sm text-muted-foreground">{data.companyName}</p>
                            <p className="text-sm mt-1 flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              <span className="font-medium">{data.applicationCount}</span> applications
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="applicationCount"
                    name="Applications"
                    fill="var(--brand)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.mostApplicationJobs.map((job) => (
                    <tr key={job.jobID} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{job.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{job.companyName}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary" className="font-mono">
                          {job.applicationCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent
            value="leastApplications"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <span>Jobs with Least Applications</span>
            </h3>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.leastApplicationJobs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border p-3 rounded-lg shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-sm text-muted-foreground">{data.companyName}</p>
                            <p className="text-sm mt-1 flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              <span className="font-medium">{data.applicationCount}</span> applications
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="applicationCount"
                    name="Applications"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.leastApplicationJobs.map((job) => (
                    <tr key={job.jobID} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{job.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{job.companyName}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary" className="font-mono">
                          {job.applicationCount}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
