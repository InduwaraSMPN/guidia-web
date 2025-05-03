"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Settings,
  X,
  PanelLeft,
  Search,
  Activity,
  ShieldAlert,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AdminSidebarDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AdminSidebarDrawer({ isOpen, setIsOpen }: AdminSidebarDrawerProps) {
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Navigation items structure for search filtering
  const navItems = [
    { path: "/admin", label: "Dashboard", section: "main" },
    { path: "/admin/registrations", label: "Registrations", section: "main" },
    { path: "/admin/registrations/pending", label: "Pending Registrations", section: "registrations" },
    { path: "/admin/registrations/approved", label: "Approved Registrations", section: "registrations" },
    { path: "/admin/registrations/declined", label: "Declined Registrations", section: "registrations" },
    { path: "/admin/users", label: "Users", section: "main" },
    { path: "/admin/users/admins", label: "Admin Users", section: "users" },
    { path: "/admin/users/students", label: "Student Users", section: "users" },
    { path: "/admin/users/counselors", label: "Counselor Users", section: "users" },
    { path: "/admin/users/companies", label: "Company Users", section: "users" },
    { path: "/admin/news", label: "News", section: "main" },
    { path: "/admin/events", label: "Events", section: "main" },
    { path: "/admin/security-audit", label: "Security Audit", section: "main" },
    { path: "/admin/activity-feed", label: "Activity Feed", section: "main" },
    { path: "/admin/system-health", label: "System Health", section: "main" },
    { path: "/admin/settings", label: "Admin Settings", section: "main" },
  ];

  // Filter navigation items based on search query
  const filteredNavItems = searchQuery.trim() === ""
    ? navItems
    : navItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.path.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Get unique sections from filtered items
  const filteredSections = [...new Set(filteredNavItems.map(item => item.section))];

  // Set initial open submenu based on current path
  useEffect(() => {
    if (location.pathname.includes("/admin/registrations")) {
      setOpenSubMenu("registrations");
    } else if (location.pathname.includes("/admin/users")) {
      setOpenSubMenu("users");
    }
  }, [location.pathname]);

  const toggleSubMenu = (menu: string) => {
    setOpenSubMenu(openSubMenu === menu ? null : menu);
  };

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="left">
      <Drawer.Portal>
        {/* Overlay with backdrop blur */}
        <Drawer.Overlay className="fixed inset-0 z-[45] bg-black/30 backdrop-blur-sm transition-all duration-300" />
        <Drawer.Content
          style={
            {
              width: "350px",
              height: "calc(100vh - 40px)",
              top: "20px",
              bottom: "20px",
              left: "20px",
              "--vaul-drawer-initial-transform": "translateX(-100%)",
            } as React.CSSProperties
          }
          className="bg-card flex flex-col fixed z-[46] shadow-xl border border-border rounded-lg overflow-hidden transition-transform duration-300"
        >
          <Drawer.Title className="sr-only">Admin Navigation</Drawer.Title>
          <Drawer.Description className="sr-only">
            Admin navigation panel for accessing different sections of the admin dashboard
          </Drawer.Description>

          <div className="flex flex-col h-full">
            {/* Enhanced header with clear visual hierarchy */}
            <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-rose-800/10 p-2 rounded-full">
                  <PanelLeft className="h-5 w-5 text-rose-800" />
                </div>
                <h2 className="font-semibold text-foreground text-xl">
                  Admin Panel
                </h2>
              </div>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, rotate: 90 }}
                aria-label="Close admin panel"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Search Bar */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search admin sections..."
                  className="w-full pl-9 bg-muted/50 border-muted"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
              <nav className="space-y-2">
                {/* Show message when no results found */}
                {filteredNavItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                    <p className="text-muted-foreground">No matching sections found</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs text-rose-800 hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {/* Dashboard - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin' && item.section === 'main')) && (
                  <Link
                    to="/admin"
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
                      isActive("/admin") && location.pathname === "/admin"
                        ? "bg-rose-800/10 text-rose-800 font-semibold"
                        : "text-foreground hover:bg-muted hover:text-rose-800"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={18} className="flex-shrink-0 mr-3" />
                    <span className="truncate">Dashboard</span>
                  </Link>
                )}

                {/* Registrations - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredSections.includes('registrations') ||
                 filteredNavItems.some(item => item.path === '/admin/registrations' && item.section === 'main')) && (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSubMenu("registrations")}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group",
                        isActive("/registrations")
                          ? "bg-rose-800/10 text-rose-800 font-semibold"
                          : "text-foreground hover:bg-muted hover:text-rose-800",
                        "relative"
                      )}
                    >
                      <div className="flex items-center">
                        <UserPlus size={18} className="flex-shrink-0 mr-3" />
                        <span className="truncate">Registrations</span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          openSubMenu === "registrations" && "rotate-90"
                        )}
                      />
                    </button>

                    {/* Submenu items */}
                    <AnimatePresence>
                      {openSubMenu === "registrations" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-10 space-y-1"
                        >
                          {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/registrations/pending')) && (
                            <Link
                              to="/admin/registrations/pending"
                              className={cn(
                                "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
                                isActive("/registrations/pending")
                                  ? "text-rose-800 font-medium"
                                  : "text-muted-foreground hover:text-rose-800 hover:bg-muted"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <Clock size={16} className="flex-shrink-0 mr-2" />
                              <span className="truncate">Pending</span>
                            </Link>
                          )}

                          {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/registrations/approved')) && (
                            <Link
                              to="/admin/registrations/approved"
                              className={cn(
                                "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
                                isActive("/registrations/approved")
                                  ? "text-rose-800 font-medium"
                                  : "text-muted-foreground hover:text-rose-800 hover:bg-muted"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <CheckCircle size={16} className="flex-shrink-0 mr-2" />
                              <span className="truncate">Approved</span>
                            </Link>
                          )}

                          {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/registrations/declined')) && (
                            <Link
                              to="/admin/registrations/declined"
                              className={cn(
                                "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
                                isActive("/registrations/declined")
                                  ? "text-rose-800 font-medium"
                                  : "text-muted-foreground hover:text-rose-800 hover:bg-muted"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <XCircle size={16} className="flex-shrink-0 mr-2" />
                              <span className="truncate">Declined</span>
                            </Link>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Users - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredSections.includes('users') ||
                 filteredNavItems.some(item => item.path === '/admin/users' && item.section === 'main')) && (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleSubMenu("users")}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group",
                        isActive("/users")
                          ? "bg-rose-800/10 text-rose-800 font-semibold"
                          : "text-foreground hover:bg-muted hover:text-rose-800",
                        "relative"
                      )}
                    >
                      <div className="flex items-center">
                        <Users size={18} className="flex-shrink-0 mr-3" />
                        <span className="truncate">Users</span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          openSubMenu === "users" && "rotate-90"
                        )}
                      />
                    </button>

                    {/* Submenu items */}
                    <AnimatePresence>
                      {openSubMenu === "users" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-10 space-y-1"
                        >
                          {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/users/admins')) && (
                            <Link
                              to="/admin/users/admins"
                              className={cn(
                                "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
                                isActive("/users/admins")
                                  ? "text-rose-800 font-medium"
                                  : "text-muted-foreground hover:text-rose-800 hover:bg-muted"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <ShieldCheck size={16} className="flex-shrink-0 mr-2" />
                              <span className="truncate">Admins</span>
                            </Link>
                          )}

                          {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/users/students')) && (
                            <Link
                              to="/admin/users/students"
                              className={cn(
                                "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
                                isActive("/users/students")
                                  ? "text-rose-800 font-medium"
                                  : "text-muted-foreground hover:text-rose-800 hover:bg-muted"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <GraduationCap size={16} className="flex-shrink-0 mr-2" />
                              <span className="truncate">Students</span>
                            </Link>
                          )}

                          {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/users/counselors')) && (
                            <Link
                              to="/admin/users/counselors"
                              className={cn(
                                "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
                                isActive("/users/counselors")
                                  ? "text-rose-800 font-medium"
                                  : "text-muted-foreground hover:text-rose-800 hover:bg-muted"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <Users size={16} className="flex-shrink-0 mr-2" />
                              <span className="truncate">Counselors</span>
                            </Link>
                          )}

                          {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/users/companies')) && (
                            <Link
                              to="/admin/users/companies"
                              className={cn(
                                "flex items-center px-4 py-2 text-sm rounded-md transition-all duration-200",
                                isActive("/users/companies")
                                  ? "text-rose-800 font-medium"
                                  : "text-muted-foreground hover:text-rose-800 hover:bg-muted"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <Building2 size={16} className="flex-shrink-0 mr-2" />
                              <span className="truncate">Companies</span>
                            </Link>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* News - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/news')) && (
                  <Link
                    to="/admin/news"
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
                      isActive("/news")
                        ? "bg-rose-800/10 text-rose-800 font-semibold"
                        : "text-foreground hover:bg-muted hover:text-rose-800"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Newspaper size={18} className="flex-shrink-0 mr-3" />
                    <span className="truncate">News</span>
                  </Link>
                )}

                {/* Events - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/events')) && (
                  <Link
                    to="/admin/events"
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
                      isActive("/events")
                        ? "bg-rose-800/10 text-rose-800 font-semibold"
                        : "text-foreground hover:bg-muted hover:text-rose-800"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Calendar size={18} className="flex-shrink-0 mr-3" />
                    <span className="truncate">Events</span>
                  </Link>
                )}

                {/* Security Audit - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/security-audit')) && (
                  <Link
                    to="/admin/security-audit"
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
                      isActive("/security-audit")
                        ? "bg-rose-800/10 text-rose-800 font-semibold"
                        : "text-foreground hover:bg-muted hover:text-rose-800"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldAlert size={18} className="flex-shrink-0 mr-3" />
                    <span className="truncate">Security Audit</span>
                  </Link>
                )}

                {/* Activity Feed - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/activity-feed')) && (
                  <Link
                    to="/admin/activity-feed"
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
                      isActive("/activity-feed")
                        ? "bg-rose-800/10 text-rose-800 font-semibold"
                        : "text-foreground hover:bg-muted hover:text-rose-800"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Activity size={18} className="flex-shrink-0 mr-3" />
                    <span className="truncate">Activity Feed</span>
                  </Link>
                )}

                {/* System Health - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/system-health')) && (
                  <Link
                    to="/admin/system-health"
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
                      isActive("/system-health")
                        ? "bg-rose-800/10 text-rose-800 font-semibold"
                        : "text-foreground hover:bg-muted hover:text-rose-800"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Server size={18} className="flex-shrink-0 mr-3" />
                    <span className="truncate">System Health</span>
                  </Link>
                )}

                {/* Settings - only show if in filtered results or no search */}
                {(searchQuery === '' || filteredNavItems.some(item => item.path === '/admin/settings')) && (
                  <Link
                    to="/admin/settings"
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 group relative",
                      isActive("/settings")
                        ? "bg-rose-800/10 text-rose-800 font-semibold"
                        : "text-foreground hover:bg-muted hover:text-rose-800"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings size={18} className="flex-shrink-0 mr-3" />
                    <span className="truncate">Admin Settings</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default AdminSidebarDrawer;
