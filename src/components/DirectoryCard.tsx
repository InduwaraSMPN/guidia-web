

import type React from "react"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from '../contexts/AuthContext';
import { MeetingRequestButton } from "@/components/meetings/MeetingRequestButton";
import { AzureImage, StudentImage, CounselorImage, CompanyImage } from "@/lib/imageUtils";

export interface DirectoryCardProps {
  type: "company" | "counselor" | "student"
  id: string
  name: string
  image?: string
  subtitle?: string
  title?: string
  email?: string
  contactNumber?: string
  userID?: string  // Add userID for companies to properly check if current user
}

export function DirectoryCard({ id, type, name, image, subtitle, email, contactNumber, userID }: DirectoryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if current user is viewing their own profile
  // For companies, we need to compare the company's companyID with the user's company profile
  let isCurrentUser = false;

  // Special case for admin users - they should always be able to chat and request meetings
  const isAdmin = user?.roleId === 1;

  // Debug user information
  console.log('DirectoryCard Debug:', {
    cardType: type,
    cardId: id,
    cardUserID: userID,
    currentUser: user ? {
      userID: user.userID,
      userType: user.userType,
      roleId: user.roleId
    } : 'Not logged in',
    isAdmin
  });

  if (user && !isAdmin) {
    // Only check for isCurrentUser if the user type matches the card type
    // For example, a Student user viewing a Company card should never have isCurrentUser=true
    if (type === "company" && user.userType === "Company") {
      // For companies, we need to check if the current user's ID matches this company's userID
      if (userID) {
        // If we have the userID from props, use it for comparison (preferred method)
        isCurrentUser = String(user.userID) === String(userID);
        console.log(`Comparing user IDs: current user ID ${user.userID} vs company userID ${userID}, match: ${isCurrentUser}`);
      } else {
        // Fallback to the old method using companyID from localStorage
        const userCompanyID = localStorage.getItem('companyID');
        if (userCompanyID) {
          isCurrentUser = String(userCompanyID) === String(id);
          console.log(`Fallback comparison using company IDs: user's company ID ${userCompanyID} vs directory company ID ${id}, match: ${isCurrentUser}`);
        } else {
          isCurrentUser = false;
          console.log('No company identification found, assuming not current user');
        }
      }
    } else if (type === "student" && user.userType === "Student") {
      // For students, compare userIDs
      isCurrentUser = String(user.userID) === String(id);
      console.log(`Student comparison: current user ID ${user.userID} vs student ID ${id}, match: ${isCurrentUser}`);
    } else if (type === "counselor" && user.userType === "Counselor") {
      // For counselors, compare userIDs
      isCurrentUser = String(user.userID) === String(id);
      console.log(`Counselor comparison: current user ID ${user.userID} vs counselor ID ${id}, match: ${isCurrentUser}`);
    } else {
      // Different user type than card type - never a match
      isCurrentUser = false;
      console.log(`User type (${user.userType}) doesn't match card type (${type}), setting isCurrentUser=false`);
    }
  }

  // Final debug output for button state
  console.log(`DirectoryCard for ${name} (${id}): isCurrentUser=${isCurrentUser}, isAdmin=${isAdmin}, buttons should be ${(!isAdmin && isCurrentUser) ? 'DISABLED' : 'ENABLED'}`);

  // Special case for LOLC Holdings PLC - force enable buttons for debugging
  if (name === "LOLC Holdings PLC" && type === "company") {
    console.log("Special case for LOLC Holdings PLC - forcing buttons to be enabled");
    isCurrentUser = false;
  }


  const handleChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Allow admin users to chat regardless of isCurrentUser check
    if ((isAdmin || !isCurrentUser) && user?.userType && user?.userID) {
      // Special handling for admin users - use 'admin' as the path
      const userTypePath = user.userType === 'Admin' ? 'admin' : user.userType.toLowerCase();

      // For companies, we need to get the userID instead of companyID for chat
      if (type === "company") {
        try {
          // If we already have the userID from props, use it directly
          if (userID) {
            navigate(`/${userTypePath}/${user.userID}/messages/${userID}?type=${type}`);
            console.log(`Navigating to chat with company ${id} using provided userID ${userID}`);
          } else {
            // Fallback to fetching the userID if not provided in props
            const token = localStorage.getItem("token");
            // First, fetch all companies to find the one with matching companyID
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/companies`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              throw new Error("Failed to fetch companies");
            }

            const companies = await response.json();
            const company = companies.find((c: any) => String(c.companyID) === String(id));

            if (!company) {
              throw new Error("Company not found");
            }

            // Use the company's userID for chat instead of companyID
            navigate(`/${userTypePath}/${user.userID}/messages/${company.userID}?type=${type}`);
            console.log(`Navigating to chat with company ${id} using fetched userID ${company.userID}`);
          }
        } catch (error) {
          console.error("Error navigating to chat:", error);
        }
      } else {
        // For other user types, use the ID directly
        navigate(`/${userTypePath}/${user.userID}/messages/${id}?type=${type}`);
        console.log(`Navigating to chat with ${id} using new URL format: /${userTypePath}/${user.userID}/messages/${id}?type=${type}`);
      }
    }
  }

  const handleViewProfile = () => {
    if (type === "company") {
      // For companies, we need to use the company's userID to view the profile
      // We'll fetch all companies and find the one with matching companyID
      navigate(`/company/${id}/details`)
    } else if (type === "counselor") {
      navigate(`/counselors/${id}/details`)
    } else if (type === "student") {
      navigate(`/students/${id}/details`)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      className="bg-card rounded-lg p-4 flex flex-col transition-all duration-300 border border-border"
    >
      <div className="flex items-center gap-3">
        {image ? (
          <div className="overflow-hidden flex-shrink-0 rounded-lg">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {type === "student" ? (
                <StudentImage
                  src={image}
                  alt={name}
                  className="w-14 h-14 object-cover"
                  fallbackSrc="/student-avatar.png"
                />
              ) : type === "counselor" ? (
                <CounselorImage
                  src={image}
                  alt={name}
                  className="w-14 h-14 object-cover"
                  fallbackSrc="/counselor-avatar.png"
                />
              ) : type === "company" ? (
                <CompanyImage
                  src={image}
                  alt={name}
                  className="w-14 h-14 object-cover"
                  fallbackSrc="/company-logo.png"
                />
              ) : (
                <AzureImage
                  src={image}
                  alt={name}
                  className="w-14 h-14 object-cover"
                  userType={type}
                />
              )}
            </motion.div>
          </div>
        ) : (
          <div
            className="rounded-lg bg-secondary-light flex items-center justify-center flex-shrink-0 w-14 h-14"
          >
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-card-foreground truncate">{name}</h3>
          {subtitle && <p className="text-sm text-brand truncate mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-sm">
        {email && (
          <motion.a
            whileHover={{ scale: 1.05 }}
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:underline"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Mail className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{email}</span>
          </motion.a>
        )}
        {contactNumber && (
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span className="truncate">{contactNumber}</span>
          </motion.div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8 transition-all duration-300 border-border text-foreground hover:bg-secondary hover:text-brand dark:hover:text-foreground"
          onClick={handleViewProfile}
        >
          Profile
        </Button>
        <Button
          size="sm"
          disabled={!isAdmin && isCurrentUser}
          className={`flex-1 text-xs h-8 transition-all duration-300 ${
            !isAdmin && isCurrentUser
              ? 'bg-brand hover:bg-brand-dark cursor-not-allowed opacity-50'
              : 'bg-brand hover:bg-brand-dark'
          }`}
          onClick={handleChat}
          title={!isAdmin && isCurrentUser ? "You cannot chat with yourself" : ""}
        >
          Chat
        </Button>
      </div>

      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!isAdmin && isCurrentUser}
          className={`w-full text-xs h-8 transition-all duration-300 ${!isAdmin && isCurrentUser ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (isAdmin || !isCurrentUser) {
              // Open the meeting request dialog
              document.getElementById(`meeting-request-${id}`)?.click();
            }
          }}
          title={!isAdmin && isCurrentUser ? "You cannot request a meeting with yourself" : ""}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Request Meeting
        </Button>
        {/* Hidden trigger for the meeting request dialog */}
        <span className="hidden">
          <MeetingRequestButton
            recipientID={parseInt(id)}
            recipientName={name}
            recipientType={type === "student" ? "Student" : type === "counselor" ? "Counselor" : "Company"}
            variant="outline"
            size="sm"
            className="w-full text-xs h-8"
            id={`meeting-request-${id}`}
            // Pass the userID as a data attribute for companies
            data-userid={type === "company" && userID ? userID : undefined}
          />
        </span>
      </div>
    </motion.div>
  )
}



