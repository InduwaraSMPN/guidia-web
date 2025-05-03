

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
}

export function DirectoryCard({ id, type, name, image, subtitle, email, contactNumber }: DirectoryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if current user is viewing their own profile
  // For companies, we need to compare the company's companyID with the user's company profile
  let isCurrentUser = false;

  // Special case for admin users - they should always be able to chat and request meetings
  const isAdmin = user?.roleId === 1;

  if (user && !isAdmin) {
    if (type === "company" && user.userType === "Company") {
      // For companies, we need to check if the current user's company matches this company
      const userCompanyID = localStorage.getItem('companyID');

      if (userCompanyID) {
        // If we have the companyID in localStorage, use it for comparison
        isCurrentUser = String(userCompanyID) === String(id);
        console.log(`Comparing company IDs: user's company ID ${userCompanyID} vs directory company ID ${id}, match: ${isCurrentUser}`);
      } else {
        // If we don't have the companyID yet, we'll need to fetch it
        // For now, assume it's not the current user
        isCurrentUser = false;
        console.log('No companyID found in localStorage, assuming not current user');
      }
    } else {
      // For other types, we can directly compare userIDs
      isCurrentUser = String(user.userID) === String(id);
    }
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
          console.log(`Navigating to chat with company ${id} using userID ${company.userID}`);
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
          />
        </span>
      </div>
    </motion.div>
  )
}



