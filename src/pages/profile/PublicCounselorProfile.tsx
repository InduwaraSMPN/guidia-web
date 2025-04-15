

import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MeetingRequestButton } from "@/components/meetings/MeetingRequestButton"
import {
  Mail,
  Phone,
  User,
  MapPin,
  Calendar,
  GraduationCap,
  Languages,
  Award,
  ChevronRight,
  ChevronLeft,
  MessageSquare
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface CounselorProfile {
  counselorName: string
  counselorPosition: string
  counselorEducation: string
  counselorContactNumber: string
  counselorEmail: string
  counselorExperienceYears: number
  counselorLocation: string
  counselorLanguages: string[]
  counselorDescription: string
  counselorProfileImagePath?: string
  counselorSpecializations: string[]
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <div className="flex flex-col md:flex-row gap-6">
      <Skeleton className="h-32 w-32 rounded-full" />
      <div className="space-y-4 flex-1">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
    <Skeleton className="h-40 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
)

// Export both names to maintain compatibility
// Chat button component
function ChatButton({ profile, userID }: { profile: CounselorProfile, userID: string | undefined }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if current user is viewing their own profile
  const isCurrentUser = user?.userType === "Counselor" && user?.userID === userID;

  const handleChat = () => {
    if (!isCurrentUser && user?.userType && user?.userID) {
      const userTypePath = user.userType.toLowerCase();
      // Navigate to chat using the new URL format
      navigate(`/${userTypePath}/${user.userID}/messages/${userID}?type=counselor`);
    }
  };

  return (
    <Button
      size="lg"
      className={`gap-2 ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleChat}
      disabled={isCurrentUser}
      title={isCurrentUser ? "You cannot chat with yourself" : ""}
    >
      Chat with {profile.counselorName.split(" ")[0]}
      <MessageSquare className="h-4 w-4" />
    </Button>
  );
}

export function PublicCounselorProfile() {
  const navigate = useNavigate()
  const { userID } = useParams<{ userID: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<CounselorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)

  // Check if current user is viewing their own profile
  useEffect(() => {
    if (user && userID) {
      setIsCurrentUser(user.userType === "Counselor" && user.userID === userID);
    }
  }, [user, userID]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!userID) {
          throw new Error("Invalid profile URL")
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/counselors/${userID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch counselor profile")
        }

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        console.error("Profile fetch error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userID])

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-4xl mx-auto px-4 py-16 text-center"
      >
        <div className="bg-muted/30 rounded-lg p-8 flex flex-col items-center">
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">
            {error || (!userID ? "Invalid profile URL" : "Counselor profile not found")}
          </h2>
          <p className="text-muted-foreground mb-6">We couldn't find the profile you're looking for.</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    )
  }

  if (!profile) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-4xl mx-auto px-4 py-16 text-center"
      >
        <div className="bg-muted/30 rounded-lg p-8 flex flex-col items-center">
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the profile you're looking for.</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-background pt-32 pb-32 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => window.history.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <motion.div variants={fadeIn} className="flex flex-col md:flex-row gap-6 items-start mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-32 h-32 border-4 border-background overflow-hidden rounded-lg shadow-lg">
              <img
                src={profile.counselorProfileImagePath}
                alt={profile.counselorName}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <div className="flex-1">
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-3xl font-bold text-foreground mb-1"
            >
              {profile.counselorName}
            </motion.h1>

            <motion.div
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <Badge variant="secondary" className="text-sm font-medium">
                {profile.counselorPosition}
              </Badge>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {profile.counselorLocation}
              </div>
            </motion.div>

            <motion.div variants={staggerChildren} className="flex flex-col sm:flex-row gap-4 text-sm">
              {profile.counselorEmail && (
                <motion.a
                  variants={fadeIn}
                  href={`mailto:${profile.counselorEmail}`}
                  className="flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {profile.counselorEmail}
                </motion.a>
              )}
              <motion.div variants={fadeIn} className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                {profile.counselorContactNumber}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* About section */}
        {profile.counselorDescription && (
          <motion.div variants={fadeIn} className="mb-8">
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  About
                </h2>
              </CardHeader>
              <CardContent>
                <div
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: profile.counselorDescription }}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Information Grid */}
        <motion.div variants={staggerChildren} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <h2 className="text-base font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Education
                </h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.counselorEducation}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <h2 className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Experience
                </h2>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <span className="text-2xl font-semibold">{profile.counselorExperienceYears}</span>
                <span className="text-muted-foreground">years of professional experience</span>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <h2 className="text-base font-medium flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" />
                  Languages
                </h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.counselorLanguages.map((language, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {profile.counselorSpecializations && profile.counselorSpecializations.length > 0 && (
            <motion.div variants={fadeIn}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <h2 className="text-base font-medium flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Specializations
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.counselorSpecializations.map((specialization, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {specialization}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 flex justify-center gap-4"
        >
          {isCurrentUser ? (
            <Button
              size="lg"
              className="opacity-50 cursor-not-allowed"
              disabled={true}
              title="You cannot chat with yourself"
            >
              Chat with {profile.counselorName.split(" ")[0]}
              <MessageSquare className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <ChatButton profile={profile} userID={userID} />
          )}
          {userID && (
            isCurrentUser ? (
              <Button
                size="lg"
                className="opacity-50 cursor-not-allowed"
                disabled={true}
                title="You cannot request a meeting with yourself"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Request Meeting
              </Button>
            ) : (
              <MeetingRequestButton
                recipientID={parseInt(userID)}
                recipientName={profile.counselorName}
                recipientType="Counselor"
                size="lg"
              />
            )
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default PublicCounselorProfile;
