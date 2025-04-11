

import type React from "react"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from '../contexts/AuthContext';

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

export function DirectoryCard({ id, type, name, image, subtitle, title, email, contactNumber }: DirectoryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Ensure we're doing a strict comparison of the IDs
  const isCurrentUser = String(user?.userID) === String(id);

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCurrentUser && user?.userType && user?.userID) {
      const userTypePath = user.userType.toLowerCase();
      // Use the new URL format directly
      navigate(`/${userTypePath}/${user.userID}/messages/${id}?type=${type}`);
      console.log(`Navigating to chat with ${id} using new URL format: /${userTypePath}/${user.userID}/messages/${id}?type=${type}`);
    }
  }

  const handleViewProfile = (e: React.MouseEvent) => {
    if (type === "company") {
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
          <div className="overflow-hidden rounded-lg flex-shrink-0">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src={image}
              alt={name}
              className={`${type === "company" ? "w-16 h-10 object-contain" : "w-14 h-14 object-cover"}`}
            />
          </div>
        ) : (
          <div
            className={`rounded-lg bg-secondary-light flex items-center justify-center flex-shrink-0 ${
              type === "company" ? "w-16 h-10" : "w-14 h-14"
            }`}
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
            onClick={(e) => e.stopPropagation()}
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
          disabled={isCurrentUser}
          className={`flex-1 text-xs h-8 transition-all duration-300 ${
            isCurrentUser
              ? 'bg-brand hover:bg-brand-dark cursor-not-allowed opacity-50'
              : 'bg-brand hover:bg-brand-dark'
          }`}
          onClick={handleChat}
          title={isCurrentUser ? "You cannot chat with yourself" : ""}
        >
          Chat
        </Button>
      </div>
    </motion.div>
  )
}



