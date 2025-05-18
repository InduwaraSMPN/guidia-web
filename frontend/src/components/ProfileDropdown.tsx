import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, LogOut, Settings, Edit, Clock, Bell } from "lucide-react";
import { format } from "date-fns";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import { useDropdown } from "../contexts/DropdownContext";
import {
  AzureImage,
  StudentImage,
  CounselorImage,
  CompanyImage,
} from "@/lib/imageUtils";

// Animation transition configuration - matches the meetings dropdown
const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

interface ProfileData {
  studentProfileImagePath?: string;
  counselorProfileImagePath?: string;
  companyLogoPath?: string;
  studentName?: string;
  counselorName?: string;
  companyName?: string;
}

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeDropdown, setActiveDropdown, isHoveringDropdown, setIsHoveringDropdown } = useDropdown();
  const isOpen = activeDropdown === "profile-dropdown";
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string>(""); // New state for admin username
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update the date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch user profile data
  useEffect(() => {
    if (!user) return;

    // Skip profile fetch if user doesn't have a profile yet
    // For student users, always try to fetch the profile regardless of hasProfile flag
    if (user.userType !== 'Student' && user.hasProfile === false) {
      setIsLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        let apiUrl = "";

        switch (user.userType) {
          case "Student":
            apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/students/${
              user.userID
            }`;
            break;
          case "Counselor":
            apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/counselors/${
              user.userID
            }`;
            break;
          case "Company":
            apiUrl = `${
              import.meta.env.VITE_API_BASE_URL
            }/api/companies/profile/${user.userID}`;
            break;
          case "Admin":
            // For Admin, fetch the username from the users endpoint
            try {
              const adminResponse = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              // Process admin response separately
              if (adminResponse.ok) {
                const adminData = await adminResponse.json();
                console.log(`${user.userType} profile data:`, adminData);
                setProfileData(adminData);
                setAdminUsername(adminData.username || "");
              } else {
                console.error(
                  `Failed to fetch admin data: ${adminResponse.status}`
                );
              }
            } catch (adminError) {
              console.error("Error fetching admin data:", adminError);
            }
            setIsLoading(false);
            return;
          default:
            // Other user types without profile data
            setIsLoading(false);
            return;
        }

        // Check if we're on a welcome page and skip the profile fetch
        if (window.location.pathname.includes("/welcome/")) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // If we get a 404, it means the profile doesn't exist yet
          if (response.status === 404) {
            console.log(
              `Profile not found for ${user.userType} user ${user.userID}`
            );
            setIsLoading(false);
            return;
          }
          throw new Error(`Failed to fetch profile data: ${response.status}`);
        }

        const data = await response.json();

        setProfileData(data);

        // Store IDs in localStorage based on user type
        if (user.userType === "Company" && data.companyID) {
          localStorage.setItem("companyID", data.companyID.toString());
          console.log("Stored companyID in localStorage:", data.companyID);
        } else if (user.userType === "Student" && data.studentID) {
          localStorage.setItem("studentID", data.studentID.toString());
          console.log("Stored studentID in localStorage:", data.studentID);
        } else if (user.userType === "Counselor" && data.counselorID) {
          localStorage.setItem("counselorID", data.counselorID.toString());
          console.log("Stored counselorID in localStorage:", data.counselorID);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        // Don't show error in UI for profile fetch failures
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Add a global click handler to close the dropdown when clicking elsewhere
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Check if the click is outside the dropdown and button
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    // Add the event listener
    document.addEventListener('mousedown', handleGlobalClick);

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [isOpen, setActiveDropdown]);

  // Close dropdown when route changes
  useEffect(() => {
    setActiveDropdown(null);
    setIsHoveringDropdown(false);

    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, [location.pathname, setActiveDropdown]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // These handlers are defined later in the component

  // Create a hover path between the button and dropdown
  const createHoverPath = () => {
    if (isOpen || isHoveringDropdown) {
      return (
        <div
          className="absolute right-0 w-24 h-8 top-full z-40"
          data-dropdown-content="profile"
          onMouseEnter={() => {
            setIsHoveringDropdown(true);
            setActiveDropdown("profile-dropdown"); // Ensure dropdown stays open

            // Clear any pending timeout
            if (leaveTimeoutRef.current) {
              clearTimeout(leaveTimeoutRef.current);
              leaveTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            setIsHoveringDropdown(false);
            // Add a small delay before closing
            leaveTimeoutRef.current = setTimeout(() => {
              // Force close the dropdown if we're not hovering over it
              if (!isHoveringDropdown) {
                setActiveDropdown(null);
              }
            }, 300);
          }}
          style={{ marginTop: '-2px' }} // Ensure no gap between button and hover path
        />
      );
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Continue with navigation even if backend logout fails
      navigate("/auth/login");
    }
  };

  const getProfilePath = () => {
    if (!user) return "";
    switch (user.userType) {
      case "Student":
        return `/students/profile/${user.userID}`;
      case "Company":
        return `/company/profile/${user.userID}`;
      case "Counselor":
        return `/counselor/profile/${user.userID}`;
      case "Admin":
        return `/admin`;
      default:
        return "";
    }
  };

  const getEditProfilePath = () => {
    if (!user) return "";
    switch (user.userType) {
      case "Student":
        return `/students/profile/edit/${user.userID}`;
      case "Company":
        return `/company/profile/edit/${user.userID}`;
      case "Counselor":
        return `/counselor/profile/edit/${user.userID}`;
      case "Admin":
        return `/admin`; // Admins might not have an edit profile page
      default:
        return "";
    }
  };

  const getSettingsPath = () => {
    if (!user) return "";
    switch (user.userType) {
      case "Student":
        return `/students/profile/settings/${user.userID}`;
      case "Company":
        return `/company/profile/settings/${user.userID}`;
      case "Counselor":
        return `/counselor/profile/settings/${user.userID}`;
      case "Admin":
        return `/admin/settings`; // Assuming admin settings path
      default:
        return "";
    }
  };

  // Helper function to get the user's name
  const getUserName = () => {
    if (!user) return "User";

    // For Admin users, use the fetched username
    if (user.userType === "Admin") {
      return adminUsername || user.email.split("@")[0] || "Admin";
    }

    // If we're on a welcome page, just use the email username
    if (window.location.pathname.includes("/welcome/")) {
      return user.email.split("@")[0] || user.userType;
    }

    if (profileData) {
      return (
        profileData.studentName ||
        profileData.counselorName ||
        profileData.companyName ||
        user.email.split("@")[0] ||
        "User"
      );
    }

    return user.email.split("@")[0] || "User";
  };

  // Helper function to get the profile image
  const getProfileImage = (type: "button" | "dropdown" = "button") => {
    const size = type === "button" ? "h-full w-full" : "h-10 w-10";

    if (isLoading) {
      return (
        <div
          className={`${size} bg-secondary-dark rounded-full animate-pulse`}
        ></div>
      );
    }

    // If we're on a welcome page, just use the default avatar
    if (window.location.pathname.includes("/welcome/")) {
      return <User className={type === "button" ? "h-6 w-6" : "h-10 w-10"} />;
    }

    if (profileData) {
      // For admin users, just show the default avatar or user icon
      if (user?.userType === "Admin") {
        return <User className={type === "button" ? "h-6 w-6" : "h-10 w-10"} />;
      }

      // Use specialized image components based on user type
      switch (user?.userType) {
        case "Student":
          return (
            <StudentImage
              profileData={profileData}
              alt={getUserName()}
              className={`${size} object-cover`}
              fallbackSrc="/student-avatar.png"
            />
          );
        case "Counselor":
          return (
            <CounselorImage
              profileData={profileData}
              alt={getUserName()}
              className={`${size} object-cover`}
              fallbackSrc="/counselor-avatar.png"
            />
          );
        case "Company":
          return (
            <CompanyImage
              profileData={profileData}
              alt={getUserName()}
              className={`${size} object-cover`}
              fallbackSrc="/company-logo.png"
            />
          );
        default:
          // Fallback to generic AzureImage with student as default
          const userType: "student" | "counselor" | "company" = "student";
          return (
            <AzureImage
              profileData={profileData}
              userType={userType}
              alt={getUserName()}
              className={`${size} object-cover`}
              rounded={true}
              fallbackSrc="/default-avatar.png"
            />
          );
      }
    }

    // Fallback to user icon
    return <User className={type === "button" ? "h-6 w-6" : "h-10 w-10"} />;
  };

  // Handle button mouse enter
  const handleButtonMouseEnter = () => {
    setActiveDropdown("profile-dropdown"); // Open on hover
    setIsHoveringDropdown(true);

    // Clear any pending timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  // Handle button mouse leave
  const handleButtonMouseLeave = () => {
    // Add a small delay before closing to allow moving to the dropdown
    leaveTimeoutRef.current = setTimeout(() => {
      // Only close if we're not hovering over the dropdown
      if (!isHoveringDropdown) {
        setActiveDropdown(null);
      }
    }, 300);
  };

  // Handle dropdown mouse enter
  const handleDropdownMouseEnter = () => {
    setIsHoveringDropdown(true);

    // Clear any pending timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  // Handle dropdown mouse leave
  const handleDropdownMouseLeave = () => {
    setIsHoveringDropdown(false);

    // Add a small delay before closing
    leaveTimeoutRef.current = setTimeout(() => {
      // Force close the dropdown
      setActiveDropdown(null);
    }, 300);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <motion.button
        ref={buttonRef}
        data-dropdown-trigger="profile"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation(); // Prevent event from bubbling up
          setActiveDropdown(isOpen ? null : "profile-dropdown");
        }}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        className="p-2 rounded-full text-muted-foreground hover:bg-brand/10 hover:text-brand transition-colors duration-300"
        aria-label="Profile menu"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full">
          {getProfileImage()}
        </div>
      </motion.button>

      {/* Invisible hover path between button and dropdown */}
      {createHoverPath()}

      {/* Profile Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
          className="absolute right-0 mt-2 w-64 max-w-[90vw] z-50"
          data-dropdown-content="profile"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
          onBlur={() => setActiveDropdown(null)} // Close on blur
          onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent clicks inside dropdown from closing it
        >
          <motion.div
            transition={transition}
            layoutId="profile-dropdown" // layoutId ensures smooth animation
            className="bg-card dark:bg-black backdrop-blur-sm rounded-lg overflow-hidden border border-border dark:border-white/[0.2] shadow-xl"
          >
            {/* Header with user info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {getProfileImage("dropdown")}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate profile-dropdown-name font-montserrat">
                    {user?.userType === "Admin"
                      ? (adminUsername || user?.email.split("@")[0])
                      : getUserName()}
                  </h3>
                  <p className="text-xs text-muted-foreground dark:text-neutral-400 truncate font-montserrat">
                    {user?.userType === "Admin"
                      ? "Admin"
                      : user?.userType || "User"}
                  </p>
                </div>
              </div>
            </div>

          {/* Menu items */}
          <div>
            <Link
              to={getProfilePath()}
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                setActiveDropdown(null);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors group font-montserrat"
              data-dropdown-content="profile-item"
            >
              <User className="h-4 w-4 text-muted-foreground dark:text-neutral-400 group-hover:text-brand transition-colors" />
              <span className="group-hover:text-brand transition-colors font-montserrat">
                {user?.userType === "Admin" ? "Dashboard" : "Profile"}
              </span>
            </Link>

            {user?.userType !== "Admin" && (
              <Link
                to={getEditProfilePath()}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  setActiveDropdown(null);
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors group font-montserrat"
                data-dropdown-content="profile-item"
              >
                <Edit className="h-4 w-4 text-muted-foreground dark:text-neutral-400 group-hover:text-brand transition-colors" />
                <span className="group-hover:text-brand transition-colors font-montserrat">
                  Edit Profile
                </span>
              </Link>
            )}

            {user?.userType === "Admin" && (
              <Link
                to="/admin/settings"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  setActiveDropdown(null);
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors group font-montserrat"
                data-dropdown-content="profile-item"
              >
                <Settings className="h-4 w-4 text-muted-foreground dark:text-neutral-400 group-hover:text-brand transition-colors" />
                <span className="group-hover:text-brand transition-colors font-montserrat">
                  Admin Settings
                </span>
              </Link>
            )}

            {user?.userType !== "Admin" && (
              <Link
                to={getSettingsPath()}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  setActiveDropdown(null);
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors group font-montserrat"
                data-dropdown-content="profile-item"
              >
                <Settings className="h-4 w-4 text-muted-foreground dark:text-neutral-400 group-hover:text-brand transition-colors" />
                <span className="group-hover:text-brand transition-colors font-montserrat">
                  Settings
                </span>
              </Link>
            )}

            {/* Notification Preferences - available for all user types */}
            <Link
              to="/coming-soon"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                setActiveDropdown(null);
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors group font-montserrat"
              data-dropdown-content="profile-item"
            >
              <Bell className="h-4 w-4 text-muted-foreground dark:text-neutral-400 group-hover:text-brand transition-colors" />
              <span className="group-hover:text-brand transition-colors font-montserrat">
                Notification Settings
              </span>
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                setActiveDropdown(null);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors group font-montserrat"
              data-dropdown-content="profile-item"
            >
              <LogOut className="h-4 w-4 text-muted-foreground dark:text-neutral-400 group-hover:text-brand transition-colors" />
              <span className="group-hover:text-brand transition-colors font-montserrat">
                Logout
              </span>
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="px-4 py-2 border-t border-border" data-dropdown-content="profile-item">
            <ThemeToggle />
          </div>

          {/* Date and Time */}
          <div className="p-3 border-t border-border bg-secondary rounded-b-lg" data-dropdown-content="profile-item">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <div>
                <div className="text-xs font-medium font-montserrat">
                  {format(currentDateTime, "d MMMM yyyy")}
                </div>
                <div className="text-xs font-montserrat">
                  {format(currentDateTime, "h:mm a")}
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
