import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { User, LogOut, Settings, Edit, Clock } from "lucide-react"
import { format } from "date-fns"
import ThemeToggle from "./ThemeToggle"

interface ProfileData {
  studentProfileImagePath?: string;
  counselorProfileImagePath?: string;
  companyLogoPath?: string;
  studentName?: string;
  counselorName?: string;
  companyName?: string;
}

export function ProfileDropdown() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [adminUsername, setAdminUsername] = useState<string>("")  // New state for admin username

  // Update the date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Fetch user profile data
  useEffect(() => {
    if (!user) return

    const fetchProfileData = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        let apiUrl = ""

        switch (user.userType) {
          case "Student":
            apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/students/${user.userID}`
            break
          case "Counselor":
            apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/counselors/${user.userID}`
            break
          case "Company":
            apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/companies/profile/${user.userID}`
            break
          case "Admin":
            // For Admin, fetch the username from the users endpoint
            try {
              const adminResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              })

              if (adminResponse.ok) {
                const adminData = await adminResponse.json()
                setAdminUsername(adminData.username || "")
              } else {
                console.error(`Failed to fetch admin data: ${adminResponse.status}`)
              }
            } catch (adminError) {
              console.error("Error fetching admin data:", adminError)
            }
            setIsLoading(false)
            return
          default:
            // Other user types without profile data
            setIsLoading(false)
            return
        }

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch profile data: ${response.status}`)
        }

        const data = await response.json()
        setProfileData(data)
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

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

  const getEditProfilePath = () => {
    if (!user) return ""
    switch (user.userType) {
      case "Student":
        return `/students/profile/edit/${user.userID}`
      case "Company":
        return `/company/profile/edit/${user.userID}`
      case "Counselor":
        return `/counselor/profile/edit/${user.userID}`
      case "Admin":
        return `/admin` // Admins might not have an edit profile page
      default:
        return ""
    }
  }

  const getSettingsPath = () => {
    if (!user) return ""
    switch (user.userType) {
      case "Student":
        return `/students/profile/settings/${user.userID}`
      case "Company":
        return `/company/profile/settings/${user.userID}`
      case "Counselor":
        return `/counselor/profile/settings/${user.userID}`
      case "Admin":
        return `/admin/settings` // Assuming admin settings path
      default:
        return ""
    }
  }

  // Helper function to get the user's name
  const getUserName = () => {
    if (!user) return "User"

    // For Admin users, use the fetched username
    if (user.userType === "Admin") {
      return adminUsername || user.email.split('@')[0] || "Admin"
    }

    if (profileData) {
      return profileData.studentName ||
             profileData.counselorName ||
             profileData.companyName ||
             user.email.split('@')[0] ||
             "User"
    }

    return user.email.split('@')[0] || "User"
  }

  // Helper function to get the profile image
  const getProfileImage = (type: "button" | "dropdown" = "button") => {
    const size = type === "button" ? "h-full w-full" : "h-10 w-10"

    if (isLoading) {
      return <div className={`${size} bg-secondary-dark rounded-full animate-pulse`}></div>
    }

    if (profileData) {
      const imagePath =
        profileData.studentProfileImagePath ||
        profileData.counselorProfileImagePath ||
        profileData.companyLogoPath

      if (imagePath) {
        return (
          <img
            src={imagePath}
            alt={getUserName()}
            className={`${size} object-cover`}
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.png"
            }}
          />
        )
      }
    }

    // Fallback to user icon
    return <User className={type === "button" ? "h-6 w-6" : "h-10 w-10"} />
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-muted-foreground hover:bg-brand/10 hover:text-brand transition-colors duration-300"
        aria-label="Profile menu"
      >
        <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full">
          {getProfileImage()}
        </div>
      </button>

      {/* Profile Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-lg border border-border z-50">
          {/* Header with user info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {getProfileImage("dropdown")}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {user?.userType === "Admin" ? adminUsername || user?.email.split('@')[0] : getUserName()}
                </h3>
                <p className="text-xs text-muted-foreground dark:text-neutral-400">{user?.userType === "Admin" ? "Admin" : user?.userType || "User"}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              to={getProfilePath()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
              {user?.userType === "Admin" ? "Dashboard" : "Profile"}
            </Link>

            {user?.userType !== "Admin" && (
              <Link
                to={getEditProfilePath()}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Edit className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
                Edit Profile
              </Link>
            )}

            {user?.userType === "Admin" && (
              <Link
                to="/admin/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
                Admin Settings
              </Link>
            )}

            {user?.userType !== "Admin" && (
              <Link
                to={getSettingsPath()}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary-light transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
                Settings
              </Link>
            )}

            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
              Logout
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="px-4 py-2 border-t border-border">
            <ThemeToggle />
          </div>

          {/* Date and Time */}
          <div className="p-3 border-t border-border bg-secondary rounded-b-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <div>
                <div className="text-xs font-medium">
                  {format(currentDateTime, 'd MMMM yyyy')}
                </div>
                <div className="text-xs">
                  {format(currentDateTime, 'h:mm a')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

