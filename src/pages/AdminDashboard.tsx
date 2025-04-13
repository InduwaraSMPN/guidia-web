"use client"

import type React from "react"

import { useNavigate, Outlet, useLocation } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import PageHeading from "../components/PageHeading"
import { toast } from "../components/ui/sonner"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Create a context to share the sidebar state
import { createContext } from "react"

// Define SidebarContext
export const SidebarContext = createContext({ collapsed: false })

interface DashboardData {
  counts: {
    upcomingEvents: number
    pastEvents: number
    newsCount: number
    registrations: {
      pending: number
      approved: number
      declined: number
    }
    users: {
      students: number
      counselors: number
      companies: number
    }
  }
}

interface SubStat {
  label: string | React.ReactNode
  value: string
}

interface Stat {
  label: string
  value?: string
  subItems?: SubStat[]
}

interface DashboardCardProps {
  title: string
  stats: Stat[]
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, stats }) => {
  return (
    <div className="bg-white overflow-hidden border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-6">
        <h3 className="text-lg font-medium text-adaptive-dark mb-5 border-b pb-3">{title}</h3>
        <ul className="space-y-3">
          {stats.map((stat, index) => (
            <li key={index} className="group">
              {/* Main List Item */}
              <div className="flex justify-between items-center hover:bg-secondary p-3 rounded-lg transition-all duration-200 group-hover:translate-x-1">
                <span className="text-sm font-medium text-foreground">{stat.label}</span>
                <span className="bg-secondary-light text-adaptive-dark text-sm px-3 py-1 rounded-full font-medium transition-all duration-200 group-hover:bg-secondary-dark">
                  {stat.value}
                </span>
              </div>

              {/* Sub Items */}
              {stat.subItems && (
                <ul className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-4">
                  {stat.subItems.map((subItem, subIndex) => (
                    <li
                      key={subIndex}
                      className="flex justify-between items-center hover:bg-secondary p-2.5 rounded-lg transition-all duration-200 hover:translate-x-1"
                    >
                      <span className="text-sm text-muted-foreground">{subItem.label}</span>
                      <span className="bg-secondary-light text-foreground text-xs px-2.5 py-0.5 rounded-full font-medium">
                        {subItem.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const { user, isVerifyingToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Add state to track sidebar collapsed status
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Function to update sidebar state that will be passed to AdminSidebar
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  const fetchDashboardData = useCallback(async () => {
    try {
      setRefreshing(true)
      setLoading(true)

      // Fetch counts
      const countsRes = await fetch("/api/counts")
      if (!countsRes.ok) {
        throw new Error("Failed to fetch counts")
      }
      const countsData = await countsRes.json()

      // Fetch user counts with authorization header
      const token = localStorage.getItem("token")
      const userCountsRes = await fetch("/api/admin/user-counts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!userCountsRes.ok) {
        throw new Error("Failed to fetch user counts")
      }
      const userCountsData = await userCountsRes.json()

      setDashboardData({
        counts: {
          upcomingEvents: Number(countsData.upcomingEvents) || 0,
          pastEvents: Number(countsData.pastEvents) || 0,
          newsCount: Number(countsData.newsCount) || 0,
          registrations: {
            pending: Number(countsData.pendingRegistrations) || 0,
            approved: Number(countsData.approvedRegistrations) || 0,
            declined: Number(countsData.declinedRegistrations) || 0,
          },
          users: {
            students: Number(userCountsData.students) || 0,
            counselors: Number(userCountsData.counselors) || 0,
            companies: Number(userCountsData.companies) || 0,
          },
        },
      })
      setError("")
    } catch (error) {
      setError("Failed to load dashboard data")
      console.error(error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      if (!isVerifyingToken) {
        navigate("/auth/login")
      }
      return
    }

    if (user.roleId !== 1) {
      navigate("/")
      return
    }

    fetchDashboardData()
  }, [user, isVerifyingToken, navigate, fetchDashboardData])

  return (
    <SidebarContext.Provider value={{ collapsed: sidebarCollapsed }}>
      <div className="flex min-h-screen">
        <AdminSidebar onToggle={handleSidebarToggle} />
        <div
          className="flex-1 pt-24 p-8 px-4 sm:px-6 lg:px-8 transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? "80px" : "250px" }}
        >
          {location.pathname === "/admin" ? (
            <>
              <div className="p-6 max-w-[1216px] mx-auto">
                <PageHeading title="Admin Dashboard" subtitle="Overview of system statistics and activities" />

                <div className="mt-8 space-y-8">
                  {refreshing && (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 text-brand animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Refreshing data...</span>
                    </div>
                  )}
                  {loading && !refreshing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Users Overview Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-40 mb-5 pb-3" />
                          <ul className="space-y-3">
                            {[...Array(3)].map((_, index) => (
                              <li key={index}>
                                <div className="flex justify-between items-center p-3 rounded-lg">
                                  <Skeleton className="h-5 w-24" />
                                  <Skeleton className="h-6 w-12 rounded-full" />
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Activity Summary Skeleton */}
                      <div className="bg-white overflow-hidden border rounded-lg shadow-sm">
                        <div className="p-6">
                          <Skeleton className="h-6 w-48 mb-5 pb-3" />
                          <ul className="space-y-3">
                            <li>
                              <div className="flex justify-between items-center p-3 rounded-lg">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-6 w-12 rounded-full" />
                              </div>
                              <ul className="ml-6 mt-2 space-y-2 border-l-2 border-border pl-4">
                                {[...Array(2)].map((_, index) => (
                                  <li key={index} className="flex justify-between items-center p-2.5 rounded-lg">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-5 w-10 rounded-full" />
                                  </li>
                                ))}
                              </ul>
                            </li>
                            <li>
                              <div className="flex justify-between items-center p-3 rounded-lg">
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-6 w-12 rounded-full" />
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </p>
                    </div>
                  ) : dashboardData ? (
                    <div className="bg-white overflow-hidden sm:rounded-lg mx-auto p-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DashboardCard
                          title="Users Overview"
                          stats={[
                            { label: "Students", value: dashboardData.counts.users.students.toString() },
                            { label: "Counselors", value: dashboardData.counts.users.counselors.toString() },
                            { label: "Companies", value: dashboardData.counts.users.companies.toString() },
                          ]}
                        />
                        <DashboardCard
                          title="Activity Summary"
                          stats={[
                            {
                              label: "Events",
                              value: (dashboardData.counts.upcomingEvents + dashboardData.counts.pastEvents).toString(),
                              subItems: [
                                { label: "Upcoming Events", value: dashboardData.counts.upcomingEvents.toString() },
                                { label: "Past Events", value: dashboardData.counts.pastEvents.toString() },
                              ],
                            },
                            { label: "News Posts", value: dashboardData.counts.newsCount.toString() },
                          ]}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default AdminDashboard


