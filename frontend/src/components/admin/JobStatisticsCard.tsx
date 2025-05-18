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
import { ChartTooltip, JobBarTooltip } from "@/components/ui/chart-tooltip"
import { AnimatedChartContainer } from "@/components/ui/animated-chart-container"
import { TablePagination } from "@/components/ui/table-pagination"
import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"

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
  // Pagination state
  const [currentPageMostViewed, setCurrentPageMostViewed] = useState(1);
  const [currentPageLeastViewed, setCurrentPageLeastViewed] = useState(1);
  const [currentPageMostApplications, setCurrentPageMostApplications] = useState(1);
  const [currentPageLeastApplications, setCurrentPageLeastApplications] = useState(1);
  const itemsPerPage = 5; // Number of items to show per page

  // Format date for trend data
  const formatTrendData = (data: Array<{ date: string; count: number }>) => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }

  const formattedJobPostingTrend = jobStats.jobPostingTrend ? formatTrendData(jobStats.jobPostingTrend) : []
  const formattedJobViewsTrend = jobStats.jobViewsTrend ? formatTrendData(jobStats.jobViewsTrend) : []

  // Create paginated data for each table
  const paginatedMostViewedJobs = useMemo(() => {
    const startIndex = (currentPageMostViewed - 1) * itemsPerPage;
    return jobStats.mostViewedJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [jobStats.mostViewedJobs, currentPageMostViewed, itemsPerPage]);

  const paginatedLeastViewedJobs = useMemo(() => {
    const startIndex = (currentPageLeastViewed - 1) * itemsPerPage;
    return jobStats.leastViewedJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [jobStats.leastViewedJobs, currentPageLeastViewed, itemsPerPage]);

  const paginatedMostApplicationJobs = useMemo(() => {
    const startIndex = (currentPageMostApplications - 1) * itemsPerPage;
    return jobStats.mostApplicationJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [jobStats.mostApplicationJobs, currentPageMostApplications, itemsPerPage]);

  const paginatedLeastApplicationJobs = useMemo(() => {
    const startIndex = (currentPageLeastApplications - 1) * itemsPerPage;
    return jobStats.leastApplicationJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [jobStats.leastApplicationJobs, currentPageLeastApplications, itemsPerPage]);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-border/60 hover:border-border">
      <CardHeader className="bg-card/50 pb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-brand" />
          <CardTitle>Job Statistics</CardTitle>
        </div>
        <CardDescription>Overview of job postings and applications</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">Active Jobs</span>
            </div>
            <div className="text-2xl font-bold">{jobStats.totalActiveJobs}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">New Jobs (7d)</span>
            </div>
            <div className="text-2xl font-bold">{jobStats.jobsLast7Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">New Jobs (30d)</span>
            </div>
            <div className="text-2xl font-bold">{jobStats.jobsLast30Days}</div>
          </div>
          <div className="bg-accent/30 p-4 rounded-lg border border-border/50 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:translate-y-[-2px] hover:shadow-md">
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
            <AnimatedChartContainer className="h-96 mb-8 pb-8">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" />
                <span>Job Posting Trend (Last 30 Days)</span>
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedJobPostingTrend}>
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
                        formatter={(value) => [value, "New Job Postings"]}
                      />
                    )}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New Job Postings"
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

            <AnimatedChartContainer className="h-96 mb-8 pb-8" delay={0.2}>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand" />
                <span>Job Views Trend (Last 30 Days)</span>
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedJobViewsTrend}>
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
                        formatter={(value) => [value, "Job Views"]}
                      />
                    )}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Job Views"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      stroke: "#fff",
                      fill: "#0ea5e9",
                      boxShadow: "0 0 0 4px rgba(14, 165, 233, 0.2)"
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
            value="mostViewed"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand" />
              <span>Most Viewed Jobs (10+)</span>
            </h3>
            <AnimatedChartContainer className="h-96 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.mostViewedJobs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis tick={{ fill: "var(--foreground)" }} domain={[10, 'auto']} />
                  <Tooltip
                    animationDuration={200}
                    animationEasing="ease-out"
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                    content={({ active, payload }) => (
                      <JobBarTooltip active={active} payload={payload} />
                    )}
                  />
                  <Legend />
                  <Bar
                    dataKey="viewCount"
                    name="Views"
                    fill="var(--brand)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedChartContainer>
            <div className="overflow-hidden rounded-lg border border-border/60 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Views</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedMostViewedJobs.map((job) => (
                      <motion.tr
                        key={job.jobID}
                        className="border-t border-border transition-all duration-200 hover:bg-muted/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="py-3 px-4 font-medium">{job.title}</td>
                        <td className="py-3 px-4 text-muted-foreground">{job.companyName}</td>
                        <td className="text-right py-3 px-4">
                          <Badge variant="secondary" className="font-mono">
                            {job.viewCount}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {jobStats.mostViewedJobs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                        No job view data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {jobStats.mostViewedJobs.length > itemsPerPage && (
                <TablePagination
                  currentPage={currentPageMostViewed}
                  totalItems={jobStats.mostViewedJobs.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPageMostViewed}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="leastViewed"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand" />
              <span>Least Viewed Jobs (0-9)</span>
            </h3>
            <AnimatedChartContainer className="h-96 mb-6" delay={0.1}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.leastViewedJobs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis tick={{ fill: "var(--foreground)" }} domain={[0, 9]} />
                  <Tooltip
                    animationDuration={200}
                    animationEasing="ease-out"
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                    content={({ active, payload }) => (
                      <JobBarTooltip active={active} payload={payload} />
                    )}
                  />
                  <Legend />
                  <Bar
                    dataKey="viewCount"
                    name="Views"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedChartContainer>
            <div className="overflow-hidden rounded-lg border border-border/60 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Views</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedLeastViewedJobs.map((job) => (
                      <motion.tr
                        key={job.jobID}
                        className="border-t border-border transition-all duration-200 hover:bg-muted/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="py-3 px-4 font-medium">{job.title}</td>
                        <td className="py-3 px-4 text-muted-foreground">{job.companyName}</td>
                        <td className="text-right py-3 px-4">
                          <Badge variant="secondary" className="font-mono">
                            {job.viewCount}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {jobStats.leastViewedJobs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                        No job view data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {jobStats.leastViewedJobs.length > itemsPerPage && (
                <TablePagination
                  currentPage={currentPageLeastViewed}
                  totalItems={jobStats.leastViewedJobs.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPageLeastViewed}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="mostApplications"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <span>Jobs with Most Applications (10+)</span>
            </h3>
            <AnimatedChartContainer className="h-96 mb-6" delay={0.2}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.mostApplicationJobs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis tick={{ fill: "var(--foreground)" }} domain={[10, 'auto']} />
                  <Tooltip
                    animationDuration={200}
                    animationEasing="ease-out"
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                    content={({ active, payload }) => (
                      <JobBarTooltip active={active} payload={payload} />
                    )}
                  />
                  <Legend />
                  <Bar
                    dataKey="applicationCount"
                    name="Applications"
                    fill="var(--brand)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedChartContainer>
            <div className="overflow-hidden rounded-lg border border-border/60 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedMostApplicationJobs.map((job) => (
                      <motion.tr
                        key={job.jobID}
                        className="border-t border-border transition-all duration-200 hover:bg-muted/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="py-3 px-4 font-medium">{job.title}</td>
                        <td className="py-3 px-4 text-muted-foreground">{job.companyName}</td>
                        <td className="text-right py-3 px-4">
                          <Badge variant="secondary" className="font-mono">
                            {job.applicationCount}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {jobStats.mostApplicationJobs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                        No job application data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {jobStats.mostApplicationJobs.length > itemsPerPage && (
                <TablePagination
                  currentPage={currentPageMostApplications}
                  totalItems={jobStats.mostApplicationJobs.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPageMostApplications}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="leastApplications"
            className="animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <span>Jobs with Least Applications (0-9)</span>
            </h3>
            <AnimatedChartContainer className="h-96 mb-6" delay={0.3}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.leastApplicationJobs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis tick={{ fill: "var(--foreground)" }} domain={[0, 9]} />
                  <Tooltip
                    animationDuration={200}
                    animationEasing="ease-out"
                    cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                    content={({ active, payload }) => (
                      <JobBarTooltip active={active} payload={payload} />
                    )}
                  />
                  <Legend />
                  <Bar
                    dataKey="applicationCount"
                    name="Applications"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-in-out"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedChartContainer>
            <div className="overflow-hidden rounded-lg border border-border/60 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginatedLeastApplicationJobs.map((job) => (
                      <motion.tr
                        key={job.jobID}
                        className="border-t border-border transition-all duration-200 hover:bg-muted/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td className="py-3 px-4 font-medium">{job.title}</td>
                        <td className="py-3 px-4 text-muted-foreground">{job.companyName}</td>
                        <td className="text-right py-3 px-4">
                          <Badge variant="secondary" className="font-mono">
                            {job.applicationCount}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {jobStats.leastApplicationJobs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                        No job application data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {jobStats.leastApplicationJobs.length > itemsPerPage && (
                <TablePagination
                  currentPage={currentPageLeastApplications}
                  totalItems={jobStats.leastApplicationJobs.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPageLeastApplications}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
