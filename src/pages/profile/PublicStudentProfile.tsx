

import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Student } from "@/interfaces/Student"
import { StudentDocumentCard } from "@/components/StudentDocumentCard"
import {
  Mail,
  Phone,
  User,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Files,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

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
    </div>
  </div>
)

export function PublicStudentProfile() {
  const navigate = useNavigate()
  const { userID } = useParams()
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!userID) {
        setError("Invalid profile URL")
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/students/${userID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch student profile")
        }

        const data = await response.json()
        setStudentData(data)
      } catch (err) {
        console.error("Profile fetch error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
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
            {error || (!userID ? "Invalid profile URL" : "Student profile not found")}
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

  if (!studentData) {
    return null
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-background pt-32 pb-32 px-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
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
                src={studentData.studentProfileImagePath || "/default-avatar.png"}
                alt={studentData.studentName}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
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
              {studentData.studentName}
            </motion.h1>

            <motion.div
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <Badge variant="secondary" className="text-sm font-medium">
                {studentData.studentCategory} · {studentData.studentLevel}
              </Badge>
              {studentData.studentTitle && (
                <div className="text-muted-foreground text-sm">
                  {studentData.studentTitle}
                </div>
              )}
            </motion.div>

            <motion.div variants={staggerChildren} className="flex flex-col sm:flex-row gap-4 text-sm">
              <motion.a
                variants={fadeIn}
                href={`mailto:${studentData.studentEmail}`}
                className="flex items-center text-primary hover:text-primary/80 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                {studentData.studentEmail}
              </motion.a>
              {studentData.studentContactNumber && (
                <motion.div variants={fadeIn} className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {studentData.studentContactNumber}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* About section */}
        {studentData.studentDescription && (
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
                  dangerouslySetInnerHTML={{ __html: studentData.studentDescription }}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Career Pathways */}
        {studentData.studentCareerPathways?.length > 0 && (
          <motion.div variants={fadeIn}>
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-base font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Career Pathways
                </h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {studentData.studentCareerPathways.map((pathway, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
                    >
                      {pathway}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Documents */}
        {studentData.studentDocuments?.length > 0 && (
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="text-base font-medium flex items-center gap-2">
                    <Files className="w-4 h-4 text-primary" />
                    Documents
                  </h2>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentData.studentDocuments.map((doc, index) => (
                      <StudentDocumentCard
                      key={index}
                        title={doc.stuDocType || "Document"}
                        isUploaded={true}
                        document={{
                          name: doc.stuDocName,
                          url: doc.stuDocURL,
                          type: doc.stuDocType,
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        {/* Contact Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <Button size="lg" className="gap-2">
            Contact {studentData.studentName.split(" ")[0]}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
