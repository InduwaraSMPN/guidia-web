"use client"

import { Button } from "@/components/ui/button"
import { Mail, Phone, User, Pencil, Building2, Files, Briefcase, Bookmark, ExternalLink } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { StudentDocumentCard } from "../components/StudentDocumentCard"
import axiosInstance from "@/lib/axios"
import { format } from "date-fns"
import { motion } from "framer-motion"

interface JobApplication {
  applicationID: number
  jobID: number
  jobTitle: string
  jobLocation: string
  companyName: string
  companyLogoPath: string
  resumePath: string
  createdAt: string
  submittedAt: string
}

interface SavedJob {
  jobID: number
  title: string
  location: string
  companyName: string
  companyLogoPath: string
  endDate: string
  savedAt: string
  isExpired: boolean
}

// Update the formatDate function
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Not specified"

  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) return "Not specified"

    return format(date, "PPP") // This will format as "March 31st, 2025"
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Not specified"
  }
}

export function StudentProfilePage() {
  const navigate = useNavigate()
  const { userID } = useParams()
  const { user } = useAuth()
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const isCurrentUser = user?.userType === "Student" && user?.userID === userID

  // Update the date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!userID) {
        setError("No userID provided in URL")
        setLoading(false)
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

        if (response.status === 401) {
          throw new Error("Unauthorized access")
        } else if (response.status === 404) {
          throw new Error("Student profile not found")
        } else if (!response.ok) {
          throw new Error("Failed to fetch student data")
        }

        const data = await response.json()
        setStudentData(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching student data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch student data")
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [userID])

  useEffect(() => {
    const fetchJobApplications = async () => {
      if (!userID) return

      try {
        const response = await axiosInstance.get(`/api/jobs/applications/student/${userID}`)
        setJobApplications(response.data)
      } catch (error) {
        console.error("Error fetching job applications:", error)
      }
    }

    fetchJobApplications()
  }, [userID])

  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!isCurrentUser) return

      setLoadingSavedJobs(true)
      try {
        const response = await axiosInstance.get("/api/jobs/saved")
        setSavedJobs(response.data.slice(0, 3)) // Show only the first 3 saved jobs
      } catch (error) {
        console.error("Error fetching saved jobs:", error)
      } finally {
        setLoadingSavedJobs(false)
      }
    }

    fetchSavedJobs()
  }, [isCurrentUser])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-adaptive-dark">Loading profile...</h2>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center p-8 bg-secondary rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-adaptive-dark mb-4">
            {error || (!userID ? "Invalid profile URL" : "Student profile not found")}
          </h2>
          <Button onClick={() => navigate(-1)} className="bg-brand hover:bg-brand-dark text-white transition-colors">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-secondary/20 pt-32 pb-32 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Card with Profile Header */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-border overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-brand to-brand-dark relative"></div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo and Student Number - Square image */}
              <div className="flex-shrink-0 -mt-24 md:-mt-28">
                <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-white overflow-hidden rounded-xl shadow-md transition-transform hover:scale-105 duration-300">
                  <img
                    src={studentData.studentProfileImagePath || "/placeholder.svg"}
                    alt={studentData.studentName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="inline-block px-4 py-2 bg-brand text-white font-semibold mt-4 text-center w-full rounded-lg shadow-sm">
                  {studentData.studentNumber}
                </div>
              </div>

              {/* Profile Info - Better spacing */}
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-adaptive-dark">{studentData.studentName}</h1>
                    <p className="text-lg text-brand font-medium mt-1">
                      {studentData.studentCategory} · {studentData.studentLevel}
                    </p>
                    {studentData.studentTitle && (
                      <p className="text-muted-foreground italic mt-2">{studentData.studentTitle}</p>
                    )}

                    {/* Contact buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={`mailto:${studentData.studentEmail}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors hover:shadow-sm"
                      >
                        <Mail className="w-4 h-4 text-brand" />
                        <span className="truncate max-w-[180px]">{studentData.studentEmail}</span>
                      </a>
                      {studentData.studentContactNumber && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-md text-sm font-medium text-foreground">
                          <Phone className="w-4 h-4 text-brand" />
                          <span>{studentData.studentContactNumber}</span>
                        </div>
                      )}

                      {isCurrentUser && (
                        <Button
                          variant="outline"
                          className="ml-auto border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300"
                          onClick={() => navigate(`/students/profile/edit/${userID}`)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About section - Aligned with profile image */}
            {studentData.studentDescription && (
              <div className="mt-8 bg-secondary/30 rounded-xl p-6 border border-border/50 hover:border-border transition-colors duration-300">
                <h2 className="text-lg font-semibold text-adaptive-dark mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand" />
                  About Me
                </h2>
                <div
                  className="prose max-w-none text-muted-foreground text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: studentData.studentDescription,
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Career Pathways - Card Layout */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-border p-8"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-adaptive-dark flex items-center">
              <span className="w-1.5 h-6 bg-brand rounded-full mr-3 inline-block"></span>
              Career Pathways
            </h2>
            {isCurrentUser && (
              <Button
                variant="outline"
                className="border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300"
                onClick={() => navigate(`/students/profile/career-pathways/edit/${userID}`)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Pathways
              </Button>
            )}
          </div>

          {studentData.studentCareerPathways && studentData.studentCareerPathways.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {studentData.studentCareerPathways.map((pathway, index) => (
                <motion.div
                  key={index}
                  className="px-6 py-3 bg-brand/10 text-brand rounded-lg font-semibold border border-brand/20 hover:bg-brand hover:text-white transition-colors duration-300 cursor-default"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  {pathway}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground italic">No career pathways added yet.</p>
              {isCurrentUser && (
                <Button
                  className="mt-4 bg-brand hover:bg-brand-dark text-white transition-colors"
                  onClick={() => navigate(`/students/profile/career-pathways/edit/${userID}`)}
                >
                  Add Career Pathways
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Documents - Card Layout with Better Grid */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-border p-8"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-adaptive-dark flex items-center">
              <span className="w-1.5 h-6 bg-brand rounded-full mr-3 inline-block"></span>
              Documents
            </h2>
            {isCurrentUser && (
              <Button
                variant="outline"
                className="border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300"
                onClick={() => navigate(`/students/profile/documents/edit/${userID}`)}
              >
                <Files className="w-4 h-4 mr-2" />
                Manage Documents
              </Button>
            )}
          </div>

          {studentData.studentDocuments && studentData.studentDocuments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentData.studentDocuments.map((doc, index) => (
                <motion.div
                  key={`doc-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <StudentDocumentCard
                    title={doc.stuDocType || "Document"}
                    isUploaded={true}
                    document={{
                      name: doc.stuDocName,
                      url: doc.stuDocURL,
                      type: doc.stuDocType,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <Files className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No documents uploaded yet</p>
              {isCurrentUser && (
                <Button
                  className="mt-2 bg-brand hover:bg-brand-dark text-white transition-colors"
                  onClick={() => navigate(`/students/profile/documents/edit/${userID}`)}
                >
                  Upload Documents
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Job Applications section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-border p-8"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-adaptive-dark flex items-center">
              <span className="w-1.5 h-6 bg-brand rounded-full mr-3 inline-block"></span>
              <Briefcase className="w-6 h-6 text-brand mr-2" />
              Job Applications
            </h2>
            {isCurrentUser && (
              <Button
                variant="outline"
                className="border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300"
                onClick={() => navigate(`/profile/jobs-applications/edit/${userID}`)}
              >
                View All Applications
              </Button>
            )}
          </div>

          {jobApplications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobApplications.map((application, index) => (
                <motion.div
                  key={application.applicationID}
                  className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-all duration-300 hover:border-brand/30 group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => navigate(`/jobs/${application.jobID}`)}
                >
                  <div className="flex items-start gap-4">
                    {application.companyLogoPath ? (
                      <div className="w-14 h-14 bg-white rounded-lg border border-border p-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={application.companyLogoPath || "/placeholder.svg"}
                          alt={application.companyName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Building2 className="w-7 h-7 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-adaptive-dark truncate group-hover:text-brand transition-colors duration-300">
                        {application.jobTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{application.companyName}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied on: {formatDate(application.submittedAt || application.createdAt)}
                      </p>
                      <div className="mt-3 flex items-center">
                        <a
                          href={application.resumePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:text-brand-dark text-xs font-medium inline-flex items-center gap-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" /> View Resume
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No job applications submitted yet</p>
              {isCurrentUser && (
                <Button
                  className="mt-2 bg-brand hover:bg-brand-dark text-white transition-colors"
                  onClick={() => navigate("/jobs")}
                >
                  Browse Jobs
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Saved Jobs section */}
        {isCurrentUser && (
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-border p-8"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-adaptive-dark flex items-center">
                <span className="w-1.5 h-6 bg-brand rounded-full mr-3 inline-block"></span>
                <Bookmark className="w-6 h-6 text-brand mr-2" />
                Saved Jobs
              </h2>
              <Button
                variant="outline"
                className="border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300"
                onClick={() => navigate(`/saved-jobs`)}
              >
                View All Saved Jobs
              </Button>
            </div>

            {loadingSavedJobs ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand border-r-transparent"></div>
              </div>
            ) : savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedJobs.map((job, index) => (
                  <motion.div
                    key={job.jobID}
                    className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-all duration-300 hover:border-brand/30 cursor-pointer group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    onClick={() => navigate(`/jobs/${job.jobID}`)}
                  >
                    <div className="flex items-start gap-4">
                      {job.companyLogoPath ? (
                        <div className="w-14 h-14 bg-white rounded-lg border border-border p-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={job.companyLogoPath || "/placeholder.svg"}
                            alt={job.companyName}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          <Building2 className="w-7 h-7 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-adaptive-dark truncate group-hover:text-brand transition-colors duration-300">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{job.companyName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">Deadline: {formatDate(job.endDate)}</p>
                          {job.isExpired && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-secondary/30 rounded-lg">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No saved jobs yet</p>
                <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                  Save jobs you're interested in to receive notifications about application deadlines.
                </p>
                <Button
                  onClick={() => navigate("/jobs")}
                  className="bg-brand hover:bg-brand-dark text-white transition-colors"
                >
                  Browse Jobs
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}