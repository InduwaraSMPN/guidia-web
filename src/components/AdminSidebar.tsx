"use client"

import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar"
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
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

interface AdminSidebarProps {
  onToggle: (collapsed: boolean) => void
}

export function AdminSidebar({ onToggle }: AdminSidebarProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed
    setCollapsed(newCollapsedState)
    onToggle(newCollapsedState)
  }

  // Using theme variables instead of hardcoded colors
  const { isDark } = useThemeContext();

  // Color scheme variables - using sidebar-specific theme variables
  const colorScheme = {
    // Main colors - using brand color variables
    primary: "var(--brand)",
    primaryLight: "var(--brand-light)",
    primaryDark: "var(--brand-dark)",

    // Background colors - using sidebar-specific theme variables
    bgMain: "var(--sidebar-background)",
    bgActive: "var(--sidebar-accent)",
    bgHover: isDark ? "var(--secondary-light)" : "var(--secondary-light)",

    // Text colors - using sidebar-specific theme variables
    textPrimary: "var(--sidebar-foreground)",
    textActive: "var(--brand)",
    textMuted: "var(--muted-foreground)",

    // Border colors - using sidebar-specific theme variables
    border: "var(--sidebar-border)",
    activeBorder: "var(--brand)",
  }

  return (
    <div className="relative h-full">
      <Sidebar
        collapsed={collapsed}
        rootStyles={{
          height: "100vh",
          backgroundColor: `hsl(var(--sidebar-background))`,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 50,
          width: collapsed ? "80px" : "250px",
          maxWidth: collapsed ? "80px" : "250px",
          paddingTop: "4rem",
          overflowY: "auto",
          overflowX: collapsed ? "visible" : "hidden",
          border: "none",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
          ".ps-sidebar-container": {
            backgroundColor: `hsl(var(--sidebar-background))`,
            overflow: collapsed ? "visible" : "hidden",
            transform: "translateZ(0)",
          },
          ".ps-menu-button:hover": {
            backgroundColor: `hsl(var(--sidebar-accent)) !important`,
            color: `hsl(var(--brand)) !important`,
            transform: "translateX(4px)",
          },
          ".ps-submenu-content": {
            backgroundColor: `hsl(var(--sidebar-background)) !important`,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
          ".ps-submenu-content .ps-menu-button": {
            paddingLeft: "36px !important",
          },
          ".ps-menu-root": {
            overflow: "hidden !important",
          },
        }}
        breakPoint="md"
      >
        <Menu
          menuItemStyles={{
            button: ({ level, active }) => ({
              backgroundColor: active ? `hsl(var(--sidebar-accent))` : undefined,
              color: active ? `hsl(var(--brand))` : `hsl(var(--sidebar-foreground))`,
              fontWeight: active ? "600" : "500",
              transition: "all 0.2s ease-in-out",
              fontSize: "0.875rem",
              overflow: "hidden",
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: `hsl(var(--sidebar-accent))`,
                color: `hsl(var(--brand))`,
              },
              paddingLeft: level === 0 ? "24px" : "36px",
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
              position: "relative",
              "&::before": active
                ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: "3px",
                    backgroundColor: `hsl(var(--brand))`,
                    borderRadius: "0 2px 2px 0",
                    transition: "all 0.2s ease-in-out",
                  }
                : undefined,
            }),
            label: () => ({
              fontSize: "0.875rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }),
            subMenuContent: () => ({
              backgroundColor: `hsl(var(--sidebar-background))`,
              padding: "4px 0",
              overflow: "hidden",
              borderRadius: "0 0 6px 6px",
            }),
            SubMenuExpandIcon: {
              color: `hsl(var(--muted-foreground))`,
              width: "1rem",
              height: "1rem",
              transition: "transform 0.3s ease",
            },
            icon: {
              marginRight: collapsed ? "0" : "8px",
              width: "18px",
              height: "18px",
              transition: "all 0.3s ease",
              transform: collapsed ? "translateX(2px)" : "none",
            },
          }}
          transitionDuration={200}
        >
          {/* Toggler with improved styling */}
          <div className="px-4 py-3 mb-2">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary transition-all duration-200"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight size={18} className="text-muted-foreground transition-transform duration-200 hover:scale-110" />
              ) : (
                <ChevronLeft size={18} className="text-muted-foreground transition-transform duration-200 hover:scale-110" />
              )}
            </button>
          </div>

          <MenuItem component={<Link to="/admin" />} active={location.pathname === "/admin"} className="mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <LayoutDashboard size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">Dashboard</span>}
            </div>
          </MenuItem>

          <SubMenu
            label={
              <div className="flex items-center gap-2 overflow-hidden">
                <UserPlus size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Registrations</span>}
              </div>
            }
            defaultOpen={!collapsed && location.pathname.includes("/admin/registrations")}
            className="mb-2"
            onClick={
              collapsed
                ? (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                : undefined
            }
            rootStyles={{
              position: "relative",
              ".ps-submenu-expand-icon": {
                display: collapsed ? "none" : "block",
                transition: "transform 0.3s ease",
                "[data-open=true] &": {
                  transform: "rotate(90deg)",
                },
              },
              ".ps-submenu-content": {
                position: "absolute",
                left: collapsed ? "100%" : "0",
                top: collapsed ? "0" : "auto",
                minWidth: "200px",
                backgroundColor: `hsl(var(--sidebar-background))`,
                boxShadow: collapsed ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none",
                border: collapsed ? `1px solid hsl(var(--sidebar-border))` : "none",
                borderRadius: collapsed ? "0 6px 6px 0" : "0 0 6px 6px",
                zIndex: 100,
                animation: collapsed ? "fadeIn 0.2s ease-in-out" : "slideDown 0.2s ease-in-out",
              },
            }}
          >
            <MenuItem
              component={<Link to="registrations/pending" />}
              active={location.pathname.includes("/registrations/pending")}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Clock size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Pending</span>}
              </div>
            </MenuItem>
            <MenuItem
              component={<Link to="registrations/approved" />}
              active={location.pathname.includes("/registrations/approved")}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <CheckCircle size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Approved</span>}
              </div>
            </MenuItem>
            <MenuItem
              component={<Link to="registrations/declined" />}
              active={location.pathname.includes("/registrations/declined")}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <XCircle size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Declined</span>}
              </div>
            </MenuItem>
          </SubMenu>

          <SubMenu
            label={
              <div className="flex items-center gap-2 overflow-hidden">
                <Users size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Users</span>}
              </div>
            }
            defaultOpen={!collapsed && location.pathname.includes("/admin/users")}
            className="mb-2"
            onClick={
              collapsed
                ? (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                : undefined
            }
            rootStyles={{
              position: "relative",
              ".ps-submenu-expand-icon": {
                display: collapsed ? "none" : "block",
                transition: "transform 0.3s ease",
                "[data-open=true] &": {
                  transform: "rotate(90deg)",
                },
              },
              ".ps-submenu-content": {
                position: "absolute",
                left: collapsed ? "100%" : "0",
                top: collapsed ? "0" : "auto",
                minWidth: "200px",
                backgroundColor: `hsl(var(--sidebar-background))`,
                boxShadow: collapsed ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none",
                border: collapsed ? `1px solid hsl(var(--sidebar-border))` : "none",
                borderRadius: collapsed ? "0 6px 6px 0" : "0 0 6px 6px",
                zIndex: 100,
                animation: collapsed ? "fadeIn 0.2s ease-in-out" : "slideDown 0.2s ease-in-out",
              },
            }}
          >
            <MenuItem component={<Link to="users/admins" />} active={location.pathname.includes("/users/admins")}>
              <div className="flex items-center gap-2 overflow-hidden">
                <ShieldCheck size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Admins</span>}
              </div>
            </MenuItem>
            <MenuItem component={<Link to="users/students" />} active={location.pathname.includes("/users/students")}>
              <div className="flex items-center gap-2 overflow-hidden">
                <GraduationCap size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Students</span>}
              </div>
            </MenuItem>
            <MenuItem
              component={<Link to="users/counselors" />}
              active={location.pathname.includes("/users/counselors")}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Users size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Counselors</span>}
              </div>
            </MenuItem>
            <MenuItem component={<Link to="users/companies" />} active={location.pathname.includes("/users/companies")}>
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">Companies</span>}
              </div>
            </MenuItem>
          </SubMenu>

          <MenuItem component={<Link to="news" />} active={location.pathname.includes("/news")} className="mt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <Newspaper size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">News</span>}
            </div>
          </MenuItem>
          <MenuItem component={<Link to="events" />} active={location.pathname.includes("/events")} className="mt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <Calendar size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">Events</span>}
            </div>
          </MenuItem>
          <MenuItem component={<Link to="settings" />} active={location.pathname.includes("/settings")} className="mt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <Settings size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">Admin Settings</span>}
            </div>
          </MenuItem>
        </Menu>
      </Sidebar>

      {/* Animations are defined in index.css */}
    </div>
  )
}

export default AdminSidebar