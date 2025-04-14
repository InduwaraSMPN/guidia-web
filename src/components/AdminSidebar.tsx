"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useThemeContext } from "../contexts/ThemeContext"
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Newspaper,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  GraduationCap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  onToggle: (collapsed: boolean) => void
}

export function AdminSidebar({ onToggle }: AdminSidebarProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)
  const { isDark } = useThemeContext()

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Collapse sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [isMobile])

  // Set initial open submenu based on current path
  useEffect(() => {
    if (location.pathname.includes("/admin/registrations")) {
      setOpenSubMenu("registrations")
    } else if (location.pathname.includes("/admin/users")) {
      setOpenSubMenu("users")
    }
  }, [location.pathname])

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed
    setCollapsed(newCollapsedState)
    onToggle(newCollapsedState)
  }

  const toggleSubMenu = (menu: string) => {
    if (collapsed) return
    setOpenSubMenu(openSubMenu === menu ? null : menu)
  }

  const isActive = (path: string) => {
    return location.pathname.includes(path)
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 h-screen bg-sidebar transition-all duration-300 ease-in-out border-r border-sidebar-border shadow-sm",
        collapsed ? "w-[80px]" : "w-[250px]",
      )}
    >
      <div className="flex flex-col h-full pt-16 pb-4 overflow-y-auto">
        {/* Toggler */}
        <div className="px-4 mb-6">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-sidebar-accent transition-all duration-200"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight
                size={18}
                className="text-sidebar-foreground/70 transition-transform duration-200 hover:scale-110"
              />
            ) : (
              <ChevronLeft
                size={18}
                className="text-sidebar-foreground/70 transition-transform duration-200 hover:scale-110"
              />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1">
          {/* Dashboard */}
          <Link
            to="/admin"
            className={cn(
              "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
              isActive("/admin") && location.pathname === "/admin"
                ? "bg-sidebar-accent text-brand font-semibold before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:w-[3px] before:bg-brand before:rounded-r-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand hover:translate-x-1",
            )}
          >
            <LayoutDashboard size={18} className="flex-shrink-0 mr-2" />
            <span className={cn("truncate", collapsed && "hidden")}>Dashboard</span>
          </Link>

          {/* Registrations */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSubMenu("registrations")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group",
                isActive("/registrations")
                  ? "bg-sidebar-accent text-brand font-semibold before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:w-[3px] before:bg-brand before:rounded-r-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand hover:translate-x-1",
                "relative",
              )}
            >
              <div className="flex items-center">
                <UserPlus size={18} className="flex-shrink-0 mr-2" />
                <span className={cn("truncate", collapsed && "hidden")}>Registrations</span>
              </div>
              {!collapsed && (
                <ChevronRight
                  size={16}
                  className={cn("transition-transform duration-200", openSubMenu === "registrations" && "rotate-90")}
                />
              )}
            </button>

            {/* Submenu items */}
            <div
              className={cn(
                "space-y-1 pl-10",
                (collapsed || openSubMenu !== "registrations") && "hidden",
                openSubMenu === "registrations" && "animate-slideDown",
              )}
            >
              <Link
                to="/admin/registrations/pending"
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200",
                  isActive("/registrations/pending")
                    ? "text-brand font-medium"
                    : "text-sidebar-foreground/80 hover:text-brand hover:translate-x-1",
                )}
              >
                <Clock size={16} className="flex-shrink-0 mr-2" />
                <span className="truncate">Pending</span>
              </Link>
              <Link
                to="/admin/registrations/approved"
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200",
                  isActive("/registrations/approved")
                    ? "text-brand font-medium"
                    : "text-sidebar-foreground/80 hover:text-brand hover:translate-x-1",
                )}
              >
                <CheckCircle size={16} className="flex-shrink-0 mr-2" />
                <span className="truncate">Approved</span>
              </Link>
              <Link
                to="/admin/registrations/declined"
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200",
                  isActive("/registrations/declined")
                    ? "text-brand font-medium"
                    : "text-sidebar-foreground/80 hover:text-brand hover:translate-x-1",
                )}
              >
                <XCircle size={16} className="flex-shrink-0 mr-2" />
                <span className="truncate">Declined</span>
              </Link>
            </div>

            {/* Dropdown for collapsed state */}
            {collapsed && (
              <div
                className={cn(
                  "absolute left-full top-0 ml-2 bg-sidebar border border-sidebar-border rounded-md shadow-md w-48 py-1 z-50",
                  isActive("/registrations") ? "block" : "hidden group-hover:block",
                )}
              >
                <Link
                  to="/admin/registrations/pending"
                  className="flex items-center px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand"
                >
                  <Clock size={16} className="flex-shrink-0 mr-2" />
                  <span>Pending</span>
                </Link>
                <Link
                  to="/admin/registrations/approved"
                  className="flex items-center px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand"
                >
                  <CheckCircle size={16} className="flex-shrink-0 mr-2" />
                  <span>Approved</span>
                </Link>
                <Link
                  to="/admin/registrations/declined"
                  className="flex items-center px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand"
                >
                  <XCircle size={16} className="flex-shrink-0 mr-2" />
                  <span>Declined</span>
                </Link>
              </div>
            )}
          </div>

          {/* Users */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSubMenu("users")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group",
                isActive("/users")
                  ? "bg-sidebar-accent text-brand font-semibold before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:w-[3px] before:bg-brand before:rounded-r-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand hover:translate-x-1",
                "relative",
              )}
            >
              <div className="flex items-center">
                <Users size={18} className="flex-shrink-0 mr-2" />
                <span className={cn("truncate", collapsed && "hidden")}>Users</span>
              </div>
              {!collapsed && (
                <ChevronRight
                  size={16}
                  className={cn("transition-transform duration-200", openSubMenu === "users" && "rotate-90")}
                />
              )}
            </button>

            {/* Submenu items */}
            <div
              className={cn(
                "space-y-1 pl-10",
                (collapsed || openSubMenu !== "users") && "hidden",
                openSubMenu === "users" && "animate-slideDown",
              )}
            >
              <Link
                to="/admin/users/admins"
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200",
                  isActive("/users/admins")
                    ? "text-brand font-medium"
                    : "text-sidebar-foreground/80 hover:text-brand hover:translate-x-1",
                )}
              >
                <ShieldCheck size={16} className="flex-shrink-0 mr-2" />
                <span className="truncate">Admins</span>
              </Link>
              <Link
                to="/admin/users/students"
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200",
                  isActive("/users/students")
                    ? "text-brand font-medium"
                    : "text-sidebar-foreground/80 hover:text-brand hover:translate-x-1",
                )}
              >
                <GraduationCap size={16} className="flex-shrink-0 mr-2" />
                <span className="truncate">Students</span>
              </Link>
              <Link
                to="/admin/users/counselors"
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200",
                  isActive("/users/counselors")
                    ? "text-brand font-medium"
                    : "text-sidebar-foreground/80 hover:text-brand hover:translate-x-1",
                )}
              >
                <Users size={16} className="flex-shrink-0 mr-2" />
                <span className="truncate">Counselors</span>
              </Link>
              <Link
                to="/admin/users/companies"
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200",
                  isActive("/users/companies")
                    ? "text-brand font-medium"
                    : "text-sidebar-foreground/80 hover:text-brand hover:translate-x-1",
                )}
              >
                <Building2 size={16} className="flex-shrink-0 mr-2" />
                <span className="truncate">Companies</span>
              </Link>
            </div>

            {/* Dropdown for collapsed state */}
            {collapsed && (
              <div
                className={cn(
                  "absolute left-full top-0 ml-2 bg-sidebar border border-sidebar-border rounded-md shadow-md w-48 py-1 z-50",
                  isActive("/users") ? "block" : "hidden group-hover:block",
                )}
              >
                <Link
                  to="/admin/users/admins"
                  className="flex items-center px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand"
                >
                  <ShieldCheck size={16} className="flex-shrink-0 mr-2" />
                  <span>Admins</span>
                </Link>
                <Link
                  to="/admin/users/students"
                  className="flex items-center px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand"
                >
                  <GraduationCap size={16} className="flex-shrink-0 mr-2" />
                  <span>Students</span>
                </Link>
                <Link
                  to="/admin/users/counselors"
                  className="flex items-center px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand"
                >
                  <Users size={16} className="flex-shrink-0 mr-2" />
                  <span>Counselors</span>
                </Link>
                <Link
                  to="/admin/users/companies"
                  className="flex items-center px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand"
                >
                  <Building2 size={16} className="flex-shrink-0 mr-2" />
                  <span>Companies</span>
                </Link>
              </div>
            )}
          </div>

          {/* News */}
          <Link
            to="/admin/news"
            className={cn(
              "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
              isActive("/news")
                ? "bg-sidebar-accent text-brand font-semibold before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:w-[3px] before:bg-brand before:rounded-r-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand hover:translate-x-1",
            )}
          >
            <Newspaper size={18} className="flex-shrink-0 mr-2" />
            <span className={cn("truncate", collapsed && "hidden")}>News</span>
          </Link>

          {/* Events */}
          <Link
            to="/admin/events"
            className={cn(
              "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
              isActive("/events")
                ? "bg-sidebar-accent text-brand font-semibold before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:w-[3px] before:bg-brand before:rounded-r-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand hover:translate-x-1",
            )}
          >
            <Calendar size={18} className="flex-shrink-0 mr-2" />
            <span className={cn("truncate", collapsed && "hidden")}>Events</span>
          </Link>

          {/* Settings */}
          <Link
            to="/admin/settings"
            className={cn(
              "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
              isActive("/settings")
                ? "bg-sidebar-accent text-brand font-semibold before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:w-[3px] before:bg-brand before:rounded-r-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand hover:translate-x-1",
            )}
          >
            <Settings size={18} className="flex-shrink-0 mr-2" />
            <span className={cn("truncate", collapsed && "hidden")}>Admin Settings</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}

export default AdminSidebar


