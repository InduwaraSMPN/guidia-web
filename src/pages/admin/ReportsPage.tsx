"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, BarChart3, PieChart, TrendingUp, Download } from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { AnimatedChartContainer } from "@/components/ui/animated-chart-container";
import { ChartTooltip } from "@/components/ui/chart-tooltip";

// Sample data for demonstration
const sampleUserData = [
  { month: "Jan", students: 65, counselors: 28, companies: 15 },
  { month: "Feb", students: 59, counselors: 32, companies: 18 },
  { month: "Mar", students: 80, counselors: 41, companies: 20 },
  { month: "Apr", students: 81, counselors: 37, companies: 25 },
  { month: "May", students: 56, counselors: 30, companies: 22 },
  { month: "Jun", students: 55, counselors: 29, companies: 19 },
  { month: "Jul", students: 40, counselors: 25, companies: 17 },
  { month: "Aug", students: 65, counselors: 33, companies: 21 },
  { month: "Sep", students: 75, counselors: 38, companies: 24 },
  { month: "Oct", students: 85, counselors: 42, companies: 28 },
  { month: "Nov", students: 90, counselors: 45, companies: 30 },
  { month: "Dec", students: 100, counselors: 50, companies: 35 },
];

const sampleJobData = [
  { month: "Jan", postings: 25, applications: 120 },
  { month: "Feb", postings: 30, applications: 150 },
  { month: "Mar", postings: 35, applications: 180 },
  { month: "Apr", postings: 40, applications: 220 },
  { month: "May", postings: 45, applications: 250 },
  { month: "Jun", postings: 50, applications: 280 },
  { month: "Jul", postings: 45, applications: 260 },
  { month: "Aug", postings: 40, applications: 240 },
  { month: "Sep", postings: 50, applications: 300 },
  { month: "Oct", postings: 55, applications: 320 },
  { month: "Nov", postings: 60, applications: 350 },
  { month: "Dec", postings: 65, applications: 380 },
];

const sampleMeetingData = [
  { month: "Jan", scheduled: 40, completed: 35, cancelled: 5 },
  { month: "Feb", scheduled: 45, completed: 38, cancelled: 7 },
  { month: "Mar", scheduled: 50, completed: 42, cancelled: 8 },
  { month: "Apr", scheduled: 55, completed: 48, cancelled: 7 },
  { month: "May", scheduled: 60, completed: 52, cancelled: 8 },
  { month: "Jun", scheduled: 65, completed: 58, cancelled: 7 },
  { month: "Jul", scheduled: 60, completed: 54, cancelled: 6 },
  { month: "Aug", scheduled: 55, completed: 50, cancelled: 5 },
  { month: "Sep", scheduled: 65, completed: 58, cancelled: 7 },
  { month: "Oct", scheduled: 70, completed: 63, cancelled: 7 },
  { month: "Nov", scheduled: 75, completed: 68, cancelled: 7 },
  { month: "Dec", scheduled: 80, completed: 72, cancelled: 8 },
];

const sampleApplicationStatusData = [
  { status: "Pending", count: 45, color: "#f59e0b" },
  { status: "Reviewed", count: 30, color: "#3b82f6" },
  { status: "Interview", count: 15, color: "#8b5cf6" },
  { status: "Accepted", count: 25, color: "#10b981" },
  { status: "Rejected", count: 20, color: "#ef4444" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // In a real implementation, this would fetch fresh data
    setTimeout(() => {
      toast.success("Reports data refreshed");
      setIsRefreshing(false);
    }, 1000);
  };

  // In a real implementation, this would fetch data from the API
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-8 w-96 mb-4" />
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeading title="Reports" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        {/* Users Report Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brand" />
                    User Growth Report
                  </CardTitle>
                  <CardDescription>Monthly user registration trends by user type</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedChartContainer className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sampleUserData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fill: "var(--foreground)" }} />
                    <YAxis tick={{ fill: "var(--foreground)" }} />
                    <Tooltip
                      animationDuration={200}
                      animationEasing="ease-out"
                      cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                      content={({ active, payload, label }) => (
                        <ChartTooltip
                          active={active}
                          payload={payload}
                          label={label}
                          labelClassName="font-medium"
                        />
                      )}
                    />
                    <Legend />
                    <Bar
                      dataKey="students"
                      name="Students"
                      fill="#800020"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      barSize={20}
                    />
                    <Bar
                      dataKey="counselors"
                      name="Counselors"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      barSize={20}
                    />
                    <Bar
                      dataKey="companies"
                      name="Companies"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </AnimatedChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Report Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand" />
                    Job Postings & Applications
                  </CardTitle>
                  <CardDescription>Monthly job posting and application trends</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedChartContainer className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleJobData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fill: "var(--foreground)" }} />
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
                          labelClassName="font-medium"
                        />
                      )}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="postings"
                      name="Job Postings"
                      stroke="#800020"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      name="Applications"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </AnimatedChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-brand" />
                    Application Status Distribution
                  </CardTitle>
                  <CardDescription>Current distribution of application statuses</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedChartContainer className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={sampleApplicationStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    >
                      {sampleApplicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      animationDuration={200}
                      animationEasing="ease-out"
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-md shadow-md p-3">
                              <p className="font-medium text-foreground">{data.status}</p>
                              <p className="text-muted-foreground">
                                Count: <span className="font-medium text-foreground">{data.count}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </AnimatedChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meetings Report Tab */}
        <TabsContent value="meetings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brand" />
                    Meeting Statistics
                  </CardTitle>
                  <CardDescription>Monthly meeting trends by status</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatedChartContainer className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sampleMeetingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fill: "var(--foreground)" }} />
                    <YAxis tick={{ fill: "var(--foreground)" }} />
                    <Tooltip
                      animationDuration={200}
                      animationEasing="ease-out"
                      cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                      content={({ active, payload, label }) => (
                        <ChartTooltip
                          active={active}
                          payload={payload}
                          label={label}
                          labelClassName="font-medium"
                        />
                      )}
                    />
                    <Legend />
                    <Bar
                      dataKey="scheduled"
                      name="Scheduled"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      barSize={20}
                    />
                    <Bar
                      dataKey="completed"
                      name="Completed"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      barSize={20}
                    />
                    <Bar
                      dataKey="cancelled"
                      name="Cancelled"
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </AnimatedChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportsPage;
