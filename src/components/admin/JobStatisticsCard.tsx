"use client"

import React from "react"
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
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Job Statistics</CardTitle>
        <CardDescription>Overview of job postings and applications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{jobStats.totalActiveJobs}</div>
            <div className="text-sm text-muted-foreground">Active Jobs</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{jobStats.jobsLast7Days}</div>
            <div className="text-sm text-muted-foreground">New Jobs (7d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{jobStats.jobsLast30Days}</div>
            <div className="text-sm text-muted-foreground">New Jobs (30d)</div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{jobStats.jobsExpiringSoon}</div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </div>
        </div>

        <Tabs defaultValue="trends">
          <TabsList className="mb-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="mostViewed">Most Viewed</TabsTrigger>
            <TabsTrigger value="leastViewed">Least Viewed</TabsTrigger>
            <TabsTrigger value="mostApplications">Most Applications</TabsTrigger>
            <TabsTrigger value="leastApplications">Least Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="h-80">
              <h3 className="text-lg font-medium mb-2">Job Posting Trend (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedJobPostingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="New Job Postings" stroke="#800020" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-80">
              <h3 className="text-lg font-medium mb-2">Job Views Trend (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedJobViewsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Job Views" stroke="#0ea5e9" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="mostViewed">
            <h3 className="text-lg font-medium mb-4">Most Viewed Jobs</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.mostViewedJobs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border p-3 rounded-lg shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-sm text-muted-foreground">{data.companyName}</p>
                            <p className="text-sm mt-1">
                              <span className="font-medium">{data.viewCount}</span> views
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="viewCount" name="Views" fill="#800020" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Job Title</th>
                    <th className="text-left py-2">Company</th>
                    <th className="text-right py-2">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.mostViewedJobs.map((job) => (
                    <tr key={job.jobID} className="border-b">
                      <td className="py-2">{job.title}</td>
                      <td className="py-2">{job.companyName}</td>
                      <td className="text-right py-2">{job.viewCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="leastViewed">
            <h3 className="text-lg font-medium mb-4">Least Viewed Jobs</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.leastViewedJobs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border p-3 rounded-lg shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-sm text-muted-foreground">{data.companyName}</p>
                            <p className="text-sm mt-1">
                              <span className="font-medium">{data.viewCount}</span> views
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="viewCount" name="Views" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Job Title</th>
                    <th className="text-left py-2">Company</th>
                    <th className="text-right py-2">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.leastViewedJobs.map((job) => (
                    <tr key={job.jobID} className="border-b">
                      <td className="py-2">{job.title}</td>
                      <td className="py-2">{job.companyName}</td>
                      <td className="text-right py-2">{job.viewCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="mostApplications">
            <h3 className="text-lg font-medium mb-4">Jobs with Most Applications</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.mostApplicationJobs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border p-3 rounded-lg shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-sm text-muted-foreground">{data.companyName}</p>
                            <p className="text-sm mt-1">
                              <span className="font-medium">{data.applicationCount}</span> applications
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="applicationCount" name="Applications" fill="#800020" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Job Title</th>
                    <th className="text-left py-2">Company</th>
                    <th className="text-right py-2">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.mostApplicationJobs.map((job) => (
                    <tr key={job.jobID} className="border-b">
                      <td className="py-2">{job.title}</td>
                      <td className="py-2">{job.companyName}</td>
                      <td className="text-right py-2">{job.applicationCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="leastApplications">
            <h3 className="text-lg font-medium mb-4">Jobs with Least Applications</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStats.leastApplicationJobs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" tick={false} />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border p-3 rounded-lg shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-sm text-muted-foreground">{data.companyName}</p>
                            <p className="text-sm mt-1">
                              <span className="font-medium">{data.applicationCount}</span> applications
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar dataKey="applicationCount" name="Applications" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Job Title</th>
                    <th className="text-left py-2">Company</th>
                    <th className="text-right py-2">Applications</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.leastApplicationJobs.map((job) => (
                    <tr key={job.jobID} className="border-b">
                      <td className="py-2">{job.title}</td>
                      <td className="py-2">{job.companyName}</td>
                      <td className="text-right py-2">{job.applicationCount}</td>
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
