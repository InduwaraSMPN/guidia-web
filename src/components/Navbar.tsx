"use client"

import type React from "react"

import { MenuIcon, X, MessageSquare } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useThemeContext } from "../contexts/ThemeContext"
import { useDropdown } from "../contexts/DropdownContext"
import { NotificationsPopover } from "./NotificationsPopover"
import { ProfileDropdown } from "./ProfileDropdown"
import { MenuItem, HoveredLink } from "./navbar-menu"
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

    const listener = onValue(messagesRef, (snapshot) => {
      const conversations = snapshot.val()
      if (!conversations) {
        setUnreadCount(0); // Reset count if no conversations
        return;
      }


      let unreadTotal = 0
      Object.entries(conversations).forEach(([_, conv]: [string, any]) => {
        const participants = conv.participants || {}
        const isParticipant = participants[user.userID]
        if (!isParticipant) return

        // Check last message's read status for the user
        const lastMessageKey = conv.lastMessageKey;
        if (lastMessageKey && conv.messages && conv.messages[lastMessageKey]) {
            const lastMsg = conv.messages[lastMessageKey];
            // Count as unread if the current user is the receiver and hasn't read it
            if (lastMsg.receiver === user.userID && !lastMsg.read) {
                 // Additional check: ensure the message wasn't sent by the current user
                 if (lastMsg.sender !== user.userID) {
                    unreadTotal++;
                 }
            }
        }
        // Fallback: iterate messages if lastMessage logic isn't fully reliable yet
        else if (conv.messages) {
          const messages = conv.messages || {}
          let hasUnreadMessages = false

          Object.entries(messages).forEach(([_, msg]: [string, any]) => {
            if (msg.receiver === user.userID && !msg.read && msg.sender !== user.userID) {
              hasUnreadMessages = true
            }
          })

          if (hasUnreadMessages) {
            unreadTotal++
          }
        }
      })

      // console.log("Unread messages count:", unreadTotal)
      setUnreadCount(unreadTotal)
    })

    return () => off(messagesRef, 'value', listener)

  }, [user]) // Added user dependency

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
      className={`relative p-2 rounded-full transition-colors duration-300 ${
        isChatRoute
          ? "bg-brand/10 text-brand"
          : unreadCount > 0
            ? "text-brand hover:bg-brand/10"
            : "text-muted-foreground hover:bg-brand/10 hover:text-brand"
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
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })
  const { isDark } = useThemeContext()
  const { activeDropdown, setActiveDropdown } = useDropdown()

  const navRef = useRef<HTMLDivElement>(null)
  // --- IMPORTANT: Adjust size based on MAX possible nav items ---
  // Needs to accommodate News, Events, Jobs, Students, Counselors, Companies, Meetings, Guidia AI
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLDivElement | null>>(Array(8).fill(null)) // Increased size

  const location = useLocation()
  const { user, isVerifyingToken } = useAuth()

  // --- Define paths for active indicator - INCLUDING Events and Meetings ---
  // --- Order MUST match the visual order of elements in the JSX ---
  const navPaths = [
    "/news",
    "/events", // Identifier for Events section
    "/guidia-ai", // Guidia AI Chat
    "/jobs",
    "/students",
    "/counselors",
    "/companies",
    "/meetings", // Identifier for Meetings section
  ];

  // --- Calculate activeIndex based on the NEW logic ---
  const activeIndex = navPaths.findIndex(path => {
    // Handle special cases for sections first
    if (path === "/events") return location.pathname.startsWith('/events');
    if (path === "/meetings") return location.pathname.startsWith('/meetings');
    if (path === "/guidia-ai") return location.pathname === '/guidia-ai' || location.pathname === '/ai-chat';
    // Handle direct link matches
    return location.pathname === path;
  });


  // Close dropdown when clicking elsewhere on the page
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Check if the click is outside the dropdown trigger areas
      // This logic might need refinement if clicks inside the dropdown content
      // shouldn't close it immediately. For now, it closes on any outside click.
      if (activeDropdown !== null && activeDropdown.startsWith('navbar-')) {
         // A simple check: if the click target isn't inside the nav bar, close.
         // This prevents closing when clicking dropdown items themselves.
         if (navRef.current && !navRef.current.contains(event.target as Node)) {
            setActiveDropdown(null);
         }
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [activeDropdown, setActiveDropdown]); // Re-run when 'activeDropdown' state changes


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

  // Effect to update the indicator position
  useEffect(() => {
    const updateIndicator = () => {
      // Ensure activeIndex is valid and corresponding ref exists
      if (activeIndex === -1 || !navRef.current || !itemRefs.current[activeIndex]) {
        // console.log("Resetting indicator: activeIndex", activeIndex, "ref exists:", !!itemRefs.current[activeIndex]);
        setIndicatorStyle({ width: 0, left: 0 }) // Reset if no active item or ref not ready
        return
      }

      const activeItem = itemRefs.current[activeIndex]
      if (!activeItem) {
        // console.log("Resetting indicator: activeItem ref is null for index", activeIndex);
        setIndicatorStyle({ width: 0, left: 0 }); // Reset if ref is somehow null
        return;
      }


      const navRect = navRef.current.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()

      // Calculate style relative to the navRef container
      const newLeft = itemRect.left - navRect.left;
      const newWidth = itemRect.width;

      // console.log("Updating indicator:", { width: newWidth, left: newLeft }, "for index:", activeIndex, "path:", navPaths[activeIndex]);


      // Only update if values are valid (prevents potential NaN issues)
      if (!isNaN(newWidth) && !isNaN(newLeft) && newWidth > 0) {
        setIndicatorStyle({
          width: newWidth,
          left: newLeft,
        })
      } else {
         // If calculation results in invalid numbers, reset or keep previous
         console.warn("Indicator calculation resulted in invalid values:", { newWidth, newLeft });
         // Optional: Reset if calculation is bad
         // setIndicatorStyle({ width: 0, left: 0 });
      }

    }

    // Update indicator on initial load and resize
    // Use requestAnimationFrame to ensure measurements are taken after layout
    requestAnimationFrame(updateIndicator);
    window.addEventListener("resize", updateIndicator)

    // Add a small delay on location change to allow refs to potentially update
    const timer = setTimeout(() => {
        requestAnimationFrame(updateIndicator);
    }, 50); // Adjust delay as needed


    return () => {
        window.removeEventListener("resize", updateIndicator);
        clearTimeout(timer);
    }
    // Depend on activeIndex AND location.pathname to recalculate when route changes
    // Also depend on user, as the items available change
  }, [activeIndex, location.pathname, user]) // Rerun when active index, path, or user changes

  // Don't render anything while verifying token on auth pages
  if (isAuthPage && isVerifyingToken) return null

  // Define meeting dropdown items
  const meetingDropdownItems = [
    { path: `/meetings/meetings`, label: "Meetings" }, // Make paths dynamic if needed based on user
    { path: `/meetings/calendar`, label: "Meetings Calendar" },
    { path: `/meetings/settings`, label: "Meeting Settings" },
  ]

  // Common class string for top-level nav items (links and dropdown triggers)
  const navItemBaseClasses = "relative px-2 py-1 text-sm font-medium hover:text-brand transition-colors duration-200 flex items-center cursor-pointer font-montserrat"
  const activeNavItemClasses = "text-brand font-bold"
  const inactiveNavItemClasses = "text-foreground"

  // --- Determine active states specifically for conditional classes ---
  const isEventsActive = location.pathname.startsWith('/events');
  const isMeetingsActive = location.pathname.startsWith('/meetings');


  return (
    <nav
      className={`fixed w-full top-0 z-[40] transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-[1216px] mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo and possibly News/Events when no user */}
          <div className={`flex-shrink-0 ${!user ? 'flex-1' : 'w-[180px]'}`}>
            <div className="flex items-center">
              <Link to="/" className="transition-transform duration-300 hover:scale-105 inline-block">
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <img src="/images/logo-light.svg" alt="Guidia" className="h-8 w-auto max-w-[150px]" />
                  ) : (
                    <img src="/images/logo-dark.svg" alt="Guidia" className="h-8 w-auto max-w-[150px]" />
                  )}
                </div>
              </Link>

              {/* News and Events next to logo when no user - hidden on mobile */}
              {!user && !logoOnly && !isVerifyingToken && (
                <div className="ml-8 relative hidden md:block" ref={navRef}>
                  <div className="flex items-center space-x-4">
                    {/* News Link */}
                    <Link
                      key="/news"
                      to="/news"
                      ref={(el) => (itemRefs.current[0] = el)}
                      className={`${navItemBaseClasses} ${location.pathname === '/news' ? activeNavItemClasses : inactiveNavItemClasses}`}
                      onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                      onMouseEnter={() => setActiveDropdown(null)} // Close any open dropdown when hovering this item
                    >
                      News
                    </Link>

                    {/* Events Dropdown */}
                    <div
                      ref={(el) => (itemRefs.current[1] = el)}
                      className={`${navItemBaseClasses} ${isEventsActive ? activeNavItemClasses : inactiveNavItemClasses}`}
                      onClick={(e) => e.stopPropagation()}
                      data-dropdown-trigger="events"
                      onMouseEnter={() => {
                        // If another dropdown is open, close it
                        if (activeDropdown && !activeDropdown.includes('Events')) {
                          setActiveDropdown(null);
                        }
                      }}
                    >
                      <MenuItem
                        setActive={(item) => setActiveDropdown(item ? `navbar-${item}` : null)}
                        active={activeDropdown === "navbar-Events" ? "Events" : null}
                        item="Events"
                        isRouteActive={isEventsActive} // Pass the route active state
                        directLink="http://localhost:1030/events" // Add direct link to Events page
                      >
                        <EventsDropdown />
                      </MenuItem>
                    </div>

                    {/* Guidia AI Link removed for signed-out users */}
                  </div>

                  {/* Animated Underline Indicator for non-logged-in layout */}
                  {!user && activeIndex !== -1 && activeIndex < 2 && indicatorStyle.width > 0 && (
                    <motion.div
                      className="absolute bottom-[1px] h-[2px] bg-brand rounded-full"
                      layoutId="navbar-underline-no-user"
                      initial={false}
                      animate={{
                        width: indicatorStyle.width,
                        left: indicatorStyle.left,
                        opacity: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                      style={{ originX: 0 }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu - Centered - Only when user is logged in */}
          {!logoOnly && !isVerifyingToken && user && (
            <div className="hidden md:flex flex-1 justify-center items-center">
              {/* Animated Menu with Underline Indicator */}
              <div className="relative" ref={navRef}>
                {/* --- Ensure correct order and refs --- */}
                <div className="flex space-x-4"> {/* Reduced spacing slightly */}

                  {/* 1. News - Direct Link (Index 0) */}
                  <Link
                    key="/news"
                    to="/news"
                    ref={(el) => (itemRefs.current[0] = el)} // Index 0
                    className={`${navItemBaseClasses} ${location.pathname === '/news' ? activeNavItemClasses : inactiveNavItemClasses}`}
                    onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                    onMouseEnter={() => setActiveDropdown(null)} // Close any open dropdown when hovering this item
                  >
                    News
                  </Link>

                  {/* 2. Events Dropdown (Index 1) */}
                  <div
                    ref={(el) => (itemRefs.current[1] = el)} // Index 1
                    className={`${navItemBaseClasses} ${isEventsActive ? activeNavItemClasses : inactiveNavItemClasses}`} // Use calculated active state
                    // Prevent click inside from closing the menu immediately if needed
                    onClick={(e) => e.stopPropagation()}
                    data-dropdown-trigger="events"
                    onMouseEnter={() => {
                      // If another dropdown is open, close it
                      if (activeDropdown && !activeDropdown.includes('Events')) {
                        setActiveDropdown(null);
                      }
                    }}
                  >
                    <MenuItem
                      setActive={(item) => setActiveDropdown(item ? `navbar-${item}` : null)}
                      active={activeDropdown === "navbar-Events" ? "Events" : null}
                      item="Events"
                      isRouteActive={isEventsActive} // Pass the route active state
                      directLink="http://localhost:1030/events" // Add direct link to Events page
                    >
                      <EventsDropdown />
                    </MenuItem>
                  </div>

                  {/* 3. Guidia AI - Direct Link (Index 2) */}
                  <Link
                    key="/guidia-ai"
                    to="/guidia-ai"
                    ref={(el) => (itemRefs.current[2] = el)} // Index 2
                    className={`${navItemBaseClasses} ${location.pathname === '/guidia-ai' || location.pathname === '/ai-chat' ? activeNavItemClasses : inactiveNavItemClasses}`}
                    onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                    onMouseEnter={() => setActiveDropdown(null)} // Close any open dropdown when hovering this item
                  >
                    Guidia AI
                  </Link>

                  {/* 4. Jobs - Direct Link (Index 3) */}
                  {user && (
                    <Link
                      key="/jobs"
                      to="/jobs"
                      ref={(el) => (itemRefs.current[3] = el)} // Index 3
                      className={`${navItemBaseClasses} ${location.pathname === '/jobs' ? activeNavItemClasses : inactiveNavItemClasses}`}
                      onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                      onMouseEnter={() => setActiveDropdown(null)} // Close any open dropdown when hovering this item
                    >
                      Jobs
                    </Link>
                  )}

                  {/* 5. Students - Direct Link (Index 4) */}
                  {(user?.userType === "Student" || user?.userType === "Company" || user?.userType === "Counselor" || user?.userType === "Admin") && (
                    <Link
                      key="/students"
                      to="/students"
                      ref={(el) => (itemRefs.current[4] = el)} // Index 4
                      className={`${navItemBaseClasses} ${location.pathname === '/students' ? activeNavItemClasses : inactiveNavItemClasses}`}
                      onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                      onMouseEnter={() => setActiveDropdown(null)} // Close any open dropdown when hovering this item
                    >
                      Students
                    </Link>
                  )}

                  {/* 6. Counselors - Direct Link (Index 5) */}
                  {(user?.userType === "Student" || user?.userType === "Company" || user?.userType === "Counselor" || user?.userType === "Admin") && (
                    <Link
                      key="/counselors"
                      to="/counselors"
                      ref={(el) => (itemRefs.current[5] = el)} // Index 5
                      className={`${navItemBaseClasses} ${location.pathname === '/counselors' ? activeNavItemClasses : inactiveNavItemClasses}`}
                      onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                      onMouseEnter={() => setActiveDropdown(null)} // Close any open dropdown when hovering this item
                    >
                      Counselors
                    </Link>
                  )}

                  {/* 7. Companies - Direct Link (Index 6) */}
                  {(user?.userType === "Student" || user?.userType === "Company" || user?.userType === "Counselor" || user?.userType === "Admin") && (
                    <Link
                      key="/companies"
                      to="/companies"
                      ref={(el) => (itemRefs.current[6] = el)} // Index 6
                      className={`${navItemBaseClasses} ${location.pathname === '/companies' ? activeNavItemClasses : inactiveNavItemClasses}`}
                      onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                      onMouseEnter={() => setActiveDropdown(null)} // Close any open dropdown when hovering this item
                    >
                      Companies
                    </Link>
                  )}

                  {/* 8. Meetings Dropdown (Index 7) */}
                  {user && user.userType !== "Admin" && (
                    <div
                      ref={(el) => (itemRefs.current[7] = el)} // Index 7
                      className={`${navItemBaseClasses} ${isMeetingsActive ? activeNavItemClasses : inactiveNavItemClasses}`} // Use calculated active state
                       // Prevent click inside from closing the menu immediately if needed
                       onClick={(e) => e.stopPropagation()}
                       data-dropdown-trigger="meetings"
                       onMouseEnter={() => {
                         // If another dropdown is open, close it
                         if (activeDropdown && !activeDropdown.includes('Meetings')) {
                           setActiveDropdown(null);
                         }
                       }}
                    >
                      <MenuItem
                        setActive={(item) => setActiveDropdown(item ? `navbar-${item}` : null)}
                        active={activeDropdown === "navbar-Meetings" ? "Meetings" : null}
                        item="Meetings"
                        isRouteActive={isMeetingsActive} // Pass the route active state
                      >
                        <div className="flex flex-col space-y-4 text-sm p-4"> {/* Add padding to dropdown */}
                          {meetingDropdownItems.map((item) => (
                            <HoveredLink
                               key={item.path}
                               href={item.path}
                               isActive={location.pathname === item.path}
                            >
                              {item.label}
                            </HoveredLink>
                          ))}
                        </div>
                      </MenuItem>
                    </div>
                  )}
                </div>

                {/* Animated Underline Indicator - Should now work for all items */}
                {user && activeIndex !== -1 && indicatorStyle.width > 0 && (
                  <motion.div
                    className="absolute bottom-[1px] h-[2px] bg-brand rounded-full" // Adjusted position slightly
                    layoutId="navbar-underline-user" // Add layoutId for smoother transition
                    initial={false}
                    animate={{
                      width: indicatorStyle.width,
                      left: indicatorStyle.left,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                      // duration: 0.3 // Alternatively use duration
                    }}
                    style={{ originX: 0 }} // Ensure width animation originates from the left
                  />
                )}
              </div>
            </div>
          )}

          {/* Right Side - User Controls */}
          <div className="flex-shrink-0 flex justify-end items-center">
            {!logoOnly && !isAuthPage && !isVerifyingToken && (
              <div className="hidden md:flex items-center space-x-2">
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
                      className="px-4 py-2 text-sm text-foreground hover:text-brand font-medium transition-colors duration-200 font-montserrat"
                      onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth/register"
                      className="px-5 py-2 bg-brand text-white text-sm rounded-md hover:bg-brand-light font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center font-montserrat"
                      onClick={() => setActiveDropdown(null)} // Close any open dropdown when clicking this item
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          {!logoOnly && !isVerifyingToken && (
            <div className="md:hidden flex items-center">
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

      {/* Mobile menu - Apply similar active logic */}
      {!logoOnly && isMenuOpen && !isVerifyingToken && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-background border-t border-border overflow-hidden"
        >
           <div className="px-6 py-4 space-y-2">
            {/* News */}
            <Link
              to="/news"
              onClick={() => setIsMenuOpen(false)}
              className={`block text-sm hover:text-brand py-3 transition-colors font-montserrat ${
                location.pathname === "/news" ? "text-brand font-bold" : "text-foreground font-medium"
              }`}
            >
              News
            </Link>

            {/* Mobile Events Section - Highlight parent based on child route */}
            <div className="py-2">
              <Link
                to="/events"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-sm py-2 font-montserrat ${isEventsActive ? "text-brand font-bold" : "text-foreground font-medium"}`}
              >
                Events
              </Link>
              <div className="pl-4 space-y-2 border-l border-border">
                <Link
                  to="/events?tab=upcoming"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 text-sm transition-colors font-montserrat ${
                    location.pathname === "/events" && (!location.search || location.search.includes("tab=upcoming")) ? "text-brand font-bold" : "text-muted-foreground hover:text-brand font-medium" // Use muted for inactive sub-items
                  }`}
                >
                  Upcoming Events
                </Link>
                <Link
                  to="/events?tab=past"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 text-sm transition-colors font-montserrat ${
                    location.pathname === "/events" && location.search.includes("tab=past") ? "text-brand font-bold" : "text-muted-foreground hover:text-brand font-medium" // Use muted for inactive sub-items
                  }`}
                >
                  Past Events
                </Link>
                {/* Add other event sub-links here if needed */}
              </div>
            </div>

            {/* Guidia AI - Only available to logged-in users */}
            {user && (
              <Link
                to="/guidia-ai"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-sm hover:text-brand py-3 transition-colors font-montserrat ${
                  location.pathname === "/guidia-ai" || location.pathname === "/ai-chat" ? "text-brand font-bold" : "text-foreground font-medium"
                }`}
              >
                Guidia AI
              </Link>
            )}

            {/* Jobs */}
            {user && (
              <Link
                to="/jobs"
                onClick={() => setIsMenuOpen(false)}
                className={`block text-sm hover:text-brand py-3 transition-colors font-montserrat ${
                  location.pathname === "/jobs" ? "text-brand font-bold" : "text-foreground font-medium"
                }`}
              >
                Jobs
              </Link>
            )}

             {/* Students */}
            {(user?.userType === "Student" || user?.userType === "Company" || user?.userType === "Counselor" || user?.userType === "Admin") && (
              <Link
                key="/students"
                to="/students"
                 onClick={() => setIsMenuOpen(false)}
                className={`block text-sm hover:text-brand py-3 transition-colors font-montserrat ${
                  location.pathname === "/students" ? "text-brand font-bold" : "text-foreground font-medium"
                }`}
              >
                Students
              </Link>
            )}

            {/* Counselors */}
            {(user?.userType === "Student" || user?.userType === "Company" || user?.userType === "Counselor" || user?.userType === "Admin") && (
              <Link
                key="/counselors"
                to="/counselors"
                 onClick={() => setIsMenuOpen(false)}
                className={`block text-sm hover:text-brand py-3 transition-colors font-montserrat ${
                  location.pathname === "/counselors" ? "text-brand font-bold" : "text-foreground font-medium"
                }`}
              >
                Counselors
              </Link>
            )}

            {/* Companies */}
            {(user?.userType === "Student" || user?.userType === "Company" || user?.userType === "Counselor" || user?.userType === "Admin") && (
              <Link
                key="/companies"
                to="/companies"
                 onClick={() => setIsMenuOpen(false)}
                className={`block text-sm hover:text-brand py-3 transition-colors font-montserrat ${
                  location.pathname === "/companies" ? "text-brand font-bold" : "text-foreground font-medium"
                }`}
              >
                Companies
              </Link>
            )}

            {/* Mobile Meetings Section - Highlight parent based on child route */}
            {user && user.userType !== "Admin" && (
              <div className="py-2">
                 <div className={`text-sm py-2 font-montserrat ${isMeetingsActive ? "text-brand font-bold" : "text-foreground font-medium"}`}>Meetings</div>
                 <div className="pl-4 space-y-2 border-l border-border">
                  {meetingDropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-2 text-sm transition-colors font-montserrat ${
                        location.pathname === item.path ? "text-brand font-bold" : "text-muted-foreground hover:text-brand font-medium" // Use muted for inactive sub-items
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Auth buttons / Profile controls */}
            {!isAuthPage && (
              <div className="pt-4 mt-4 border-t border-border">
                {user ? (
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                        <NotificationsPopover />
                        <ChatPopover />
                     </div>
                     <ProfileDropdown />
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3 pt-2">
                    <Link
                      to="/auth/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-medium text-brand border border-brand/20 rounded-md hover:bg-brand hover:text-white transition-colors font-montserrat"
                    >
                      Login
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 text-center text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-light transition-colors font-montserrat"
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