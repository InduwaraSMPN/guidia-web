

import { Menu, X, MessageSquare, User } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSocket } from "../contexts/SocketContext"
import { NotificationsPopover } from "./NotificationsPopover"
import { motion } from "framer-motion"
import axios from 'axios'
import { getDatabase, ref, onValue, off } from 'firebase/database'

interface NavbarProps {
  logoOnly?: boolean
}

const ChatPopover: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isChatRoute = location.pathname.includes('/chat') || location.pathname.includes('/messages');

  useEffect(() => {
    if (!user?.userID) return;

    const db = getDatabase();
    const messagesRef = ref(db, 'messages/conversations');
    
    const unreadListener = onValue(messagesRef, (snapshot) => {
      const conversations = snapshot.val();
      if (!conversations) return;

      let unreadTotal = 0;
      Object.entries(conversations).forEach(([convId, conv]: [string, any]) => {
        const participants = conv.participants || {};
        const isParticipant = participants[user.userID];
        if (!isParticipant) return;

        const messages = conv.messages || {};
        Object.entries(messages).forEach(([msgId, msg]: [string, any]) => {
          if (msg.receiver === user.userID && !msg.read) {
            unreadTotal++;
          }
        });
      });

      console.log('Unread messages count:', unreadTotal);
      setUnreadCount(unreadTotal);
    });

    return () => off(messagesRef);
  }, [user]);

  // Handle click to navigate to messages
  const handleChatClick = () => {
    if (user) {
      if (user.userType === 'Admin') {
        navigate(`/admin/${user.userID}/messages`);
      } else {
        navigate(`/${user.userType.toLowerCase()}/${user.userID}/messages`);
      }
    }
  };

  return (
    <button
      onClick={handleChatClick}
      className={`relative p-2 rounded-full text-neutral-600 transition-colors duration-300 ${
        isChatRoute
          ? "bg-rose-100 text-rose-800"
          : "hover:bg-rose-100 hover:text-rose-800"
      }`}
    >
      <MessageSquare className="h-6 w-6" />
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#800020] opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#800020] text-[10px] text-white font-bold items-center justify-center">
            {unreadCount}
          </span>
        </div>
      )}
    </button>
  );
};

export function Navbar({ logoOnly = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })
  const [isAuthPage, setIsAuthPage] = useState(false) // Add state for isAuthPage

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20 // Reduced threshold for quicker response
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isScrolled])

  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isVerifyingToken } = useAuth()
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])

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
    { path: "/events", label: "Events" },
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
    // Remove the Inbox item from here
    { path: "/about", label: "About Us" },
  ]

  const activeIndex = navItems.findIndex((item) => location.pathname === item.path)

  useEffect(() => {
    const updateIndicator = () => {
      if (activeIndex === -1 || !navRef.current || !itemRefs.current[activeIndex]) return

      const activeItem = itemRefs.current[activeIndex]
      if (!activeItem) return

      const navRect = navRef.current.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()

      setIndicatorStyle({
        width: itemRect.width,
        left: itemRect.left - navRect.left,
      })
    }

    updateIndicator()
    window.addEventListener("resize", updateIndicator)
    return () => window.removeEventListener("resize", updateIndicator)
  }, [activeIndex, location.pathname, navItems.length])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
      // Continue with navigation even if backend logout fails
      navigate("/auth/login")
    }
  }

  const getProfilePath = () => {
    if (!user) return ""
    switch (user.userType) {
      case "Student":
        return `/students/profile/${user.userID}`
      case "Company":
        return `/company/profile/${user.userID}`
      case "Counselor":
        return `/counselor/profile/${user.userID}`
      case "Admin":
        return `/admin`
      default:
        return ""
    }
  }

  // Add this near your other route-related code
  const isProfileRoute = location.pathname === getProfilePath();

  return (
    <nav
      className={`fixed w-full top-0 z-[40] transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-[1216px] mx-auto px-6 pt-2 pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <img src="/images/logo-dark.svg" alt="Guidia" className="h-8 w-32" />
              </div>
            </Link>

            {!logoOnly && !isVerifyingToken && (
              <div className="hidden md:block ml-12 relative" ref={navRef}>
                <div className="flex space-x-8">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      ref={(el) => (itemRefs.current[index] = el)}
                      className={`relative px-1 py-2 text-sm font-medium hover:text-rose-800 transition-colors duration-200 ${
                        location.pathname === item.path ? "text-rose-800" : "text-neutral-700"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                {activeIndex !== -1 && (
                  <motion.div
                    className="absolute bottom-0 h-[2px] bg-[#800020] rounded-full"
                    initial={false}
                    animate={{
                      width: `${indicatorStyle.width}px`,
                      left: `${indicatorStyle.left}px`,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {!logoOnly && !isAuthPage && !isVerifyingToken && (
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <NotificationsPopover />
                  <ChatPopover />
                  <Link
                    to={user.userType === "Admin" ? "/admin" : getProfilePath()}
                    className={`p-2 rounded-full text-neutral-600 transition-colors duration-300 ${
                      isProfileRoute
                        ? "bg-rose-100 text-rose-800"
                        : "hover:bg-rose-100 hover:text-rose-800"
                    }`}
                  >
                    <User className="h-6 w-6" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 bg-[#800020] text-white text-sm rounded-md hover:bg-rose-800 font-medium transition-all duration-200 shadow-sm hover:shadow"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 text-sm text-neutral-700 hover:text-rose-800 font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-5 py-2 bg-[#800020] text-white text-sm rounded-md hover:bg-rose-800 font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center"
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
                className="p-2 rounded-full text-neutral-700 hover:bg-neutral-100 transition-colors duration-200"
                title={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="md:hidden bg-white border-t border-neutral-100 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-sm font-medium hover:text-rose-800 py-3 transition-colors ${
                    location.pathname === item.path ? "text-rose-800" : "text-neutral-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {!isAuthPage && (
                <div className="pt-4 mt-4 border-t border-neutral-100">
                  {user ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <NotificationsPopover />
                        <ChatPopover />
                      </div>
                      <Link
                        to={user.userType === "Admin" ? "/admin" : getProfilePath()}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 py-3 text-sm font-medium text-neutral-700 hover:text-rose-800 transition-colors"
                      >
                        <User className="h-5 w-5" />
                        {user.userType === "Admin" ? "Dashboard" : "Profile"}
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleLogout()
                        }}
                        className="block w-full text-left py-3 text-sm font-medium text-rose-800 hover:text-rose-800 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-3 pt-2">
                      <Link
                        to="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2.5 text-center text-sm font-medium text-rose-800 border border-rose-200 rounded-md  hover:bg-rose-800 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/auth/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2.5 text-center text-sm font-medium text-white bg-[#800020] rounded-md hover:bg-rose-800 transition-colors"
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
