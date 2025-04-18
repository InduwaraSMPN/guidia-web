"use client"

import type React from "react"

import { MenuIcon, X, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useThemeContext } from "../contexts/ThemeContext"
import { NotificationsPopover } from "./NotificationsPopover"
import { ProfileDropdown } from "./ProfileDropdown"
import { Menu, MenuItem, HoveredLink } from "./navbar-menu"
import { EventsDropdown } from "./EventsDropdown"
import { motion } from "framer-motion"
import { getDatabase, ref, onValue, off } from "firebase/database"

interface NavbarProps {
  logoOnly?: boolean
}

const ChatPopover: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const isChatRoute = location.pathname.includes("/chat") || location.pathname.includes("/messages")

  useEffect(() => {
    if (!user?.userID) return

    const db = getDatabase()
    const messagesRef = ref(db, "messages/conversations")

    onValue(messagesRef, (snapshot) => {
      const conversations = snapshot.val()
      if (!conversations) return

      let unreadTotal = 0
      Object.entries(conversations).forEach(([_, conv]: [string, any]) => {
        const participants = conv.participants || {}
        const isParticipant = participants[user.userID]
        if (!isParticipant) return

        const messages = conv.messages || {}
        Object.entries(messages).forEach(([_, msg]: [string, any]) => {
          if (msg.receiver === user.userID && !msg.read) {
            unreadTotal++
          }
        })
      })

      console.log("Unread messages count:", unreadTotal)
      setUnreadCount(unreadTotal)
    })

    return () => off(messagesRef)
  }, [user])

  // Handle click to navigate to messages
  const handleChatClick = () => {
    if (user) {
      if (user.userType === "Admin") {
        navigate(`/admin/${user.userID}/messages`)
      } else {
        navigate(`/${user.userType.toLowerCase()}/${user.userID}/messages`)
      }
    }
  }

  return (
    <button
      onClick={handleChatClick}
      className={`relative p-2 rounded-full text-muted-foreground transition-colors duration-300 ${
        isChatRoute ? "bg-brand/10 text-brand" : "hover:bg-brand/10 hover:text-brand"
      }`}
    >
      <MessageSquare className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-brand rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  )
}

export function Navbar({ logoOnly = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthPage, setIsAuthPage] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const { isDark } = useThemeContext()

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isScrolled])

  const location = useLocation()
  const { user, isVerifyingToken } = useAuth()

  // Check if we're on an auth page
  useEffect(() => {
    setIsAuthPage(
      [
        "/auth/login",
        "/auth/register",
        "/auth/email-verification",
        "/auth/register-continue",
        "/auth/forgot-password",
        "/auth/reset-password",
      ].some((path) => location.pathname.startsWith(path)),
    )
  }, [location.pathname])

  // Don't render anything while verifying token on auth pages
  if (isAuthPage && isVerifyingToken) return null

  // Define navigation items based on user type
  const navItems = [
    { path: "/news", label: "News" },
    // Events is now handled separately as a dropdown
    ...(user ? [{ path: "/jobs", label: "Jobs" }] : []),
    ...(user?.userType === "Student" ||
    user?.userType === "Company" ||
    user?.userType === "Counselor" ||
    user?.userType === "Admin"
      ? [
          { path: "/students", label: "Students" },
          { path: "/counselors", label: "Counselors" },
          { path: "/companies", label: "Companies" },
        ]
      : []),
  ]

  // Events are now handled by the EventsDropdown component

  // Define meeting dropdown items
  const meetingDropdownItems = [
    { path: "/meeting-availability", label: "Set Availability" },
    { path: "/meetings", label: "My Meetings" },
    { path: "/calendar", label: "Calendar" },
  ]

  return (
    <nav
      className={`fixed w-full top-0 z-[40] transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-[1216px] mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <img src="/images/logo-light.svg" alt="Guidia" className="h-8 w-32" />
                ) : (
                  <img src="/images/logo-dark.svg" alt="Guidia" className="h-8 w-32" />
                )}
              </div>
            </Link>

            {!logoOnly && !isVerifyingToken && (
              <div className="hidden md:block ml-12">
                {/* Animated Menu */}
                <Menu setActive={setActive}>
                  {navItems.map((item) => (
                    <MenuItem key={item.path} setActive={setActive} active={active} item={item.label}>
                      <div className="flex flex-col space-y-4 text-sm">
                        <HoveredLink href={item.path}>{item.label}</HoveredLink>
                      </div>
                    </MenuItem>
                  ))}

                  {/* Events Dropdown with Grid Layout */}
                  <MenuItem
                    setActive={setActive}
                    active={active}
                    item="Events"
                  >
                    <EventsDropdown />
                  </MenuItem>

                  {/* Meetings Dropdown */}
                  {user && user.userType !== "Admin" && (
                    <MenuItem setActive={setActive} active={active} item="Meetings">
                      <div className="flex flex-col space-y-4 text-sm">
                        {meetingDropdownItems.map((item) => (
                          <HoveredLink key={item.path} href={item.path}>
                            {item.label}
                          </HoveredLink>
                        ))}
                      </div>
                    </MenuItem>
                  )}
                </Menu>
              </div>
            )}
          </div>

          {!logoOnly && !isAuthPage && !isVerifyingToken && (
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <NotificationsPopover />
                  <ChatPopover />
                  <ProfileDropdown />
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 text-sm text-foreground hover:text-brand font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-5 py-2 bg-brand text-white text-sm rounded-md hover:bg-brand-light font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}

          {!logoOnly && !isVerifyingToken && (
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full text-foreground hover:bg-secondary transition-colors duration-200"
                title={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {!logoOnly && isMenuOpen && !isVerifyingToken && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-background border-t border-border overflow-hidden"
        >
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block text-sm font-medium hover:text-brand py-3 transition-colors ${
                  location.pathname === item.path ? "text-brand" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Events Section */}
            <div className="py-2">
              <div className="text-sm font-medium py-2">Events</div>
              <div className="pl-4 space-y-2 border-l border-border">
                <Link
                  to="/events?tab=upcoming"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 text-sm transition-colors ${
                    location.pathname === "/events" && location.search.includes("tab=upcoming") ? "text-brand font-medium" : "text-foreground hover:text-brand"
                  }`}
                >
                  Upcoming Events
                </Link>
                <Link
                  to="/events?tab=past"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 text-sm transition-colors ${
                    location.pathname === "/events" && location.search.includes("tab=past") ? "text-brand font-medium" : "text-foreground hover:text-brand"
                  }`}
                >
                  Past Events
                </Link>
              </div>
            </div>

            {/* Mobile Meetings Section */}
            {user && user.userType !== "Admin" && (
              <div className="py-2">
                <div className="text-sm font-medium py-2">Meetings</div>
                <div className="pl-4 space-y-2 border-l border-border">
                  {meetingDropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-2 text-sm transition-colors ${
                        location.pathname === item.path ? "text-brand font-medium" : "text-foreground hover:text-brand"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!isAuthPage && (
              <div className="pt-4 mt-4 border-t border-border">
                {user ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <NotificationsPopover />
                      <ChatPopover />
                      <ProfileDropdown />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 pt-2">
                    <Link
                      to="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-medium text-brand border border-brand/20 rounded-md hover:bg-brand hover:text-white transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-light transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  )
}