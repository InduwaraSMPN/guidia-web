

import { Button } from "@/components/ui/button"
import { PencilIcon, Building2, MapPin, Globe, Mail, Phone, Briefcase, Settings } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { JobCard } from "../components/JobCard"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import axiosInstance from "@/lib/axios"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface Job {
  jobID: number
  title: string
  tags: string
  location: string
  description: string
  startDate: string
  endDate: string
  status: string
  companyName: string
  companyLogoPath: string
}

interface CompanyData {
  companyID: number
  userID: string
  companyName: string
  companyCountry: string
  companyCity: string
  companyWebsite: string
  companyContactNumber: string
  companyEmail: string
  companyDescription: string
  companyLogoPath: string | null
  postedJobs?: Job[]
}

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function CompanyProfilePage() {
  const { userID } = useParams()
  const navigate = useNavigate()
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const { user } = useAuth()
  const isCurrentUser = user?.id === userID

  // Update the date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get(`/api/companies/profile/${userID}`)
        setCompanyData(response.data)
      } catch (error) {
        console.error("Error fetching company profile:", error)
        toast.error("Failed to load company profile")
      } finally {
        setIsLoading(false)
      }
    }

    if (userID) {
      fetchCompanyProfile()
    }
  }, [userID])

  const handleApply = (jobId: string) => {
    navigate(`/jobs/${jobId}/apply`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Company Info Skeleton */}
          <div className="bg-white rounded-lg shadow p-6 mb-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 h-48 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-5 bg-gray-200 rounded w-2/3"></div>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="h-7 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!companyData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 pt-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-6">
            The company profile you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-32 pb-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Company Info Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-md overflow-hidden mb-8"
        >
          {/* Company Header */}
          <div className="relative h-24 bg-[#800020]">
            <div className="absolute top-2 right-4 text-white text-right">
              <div className="text-lg font-semibold">
                {format(currentDateTime, 'MM/dd/yyyy')}
              </div>
              <div className="text-md">
                {format(currentDateTime, 'h:mm a')}
              </div>
            </div>
            {isCurrentUser && (
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white flex items-center gap-2"
                  onClick={() => navigate(`/company/profile/edit/${userID}`)}
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white flex items-center gap-2"
                  onClick={() => navigate(`/company/profile/settings/${userID}`)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Company Logo */}
              <div className="w-48 h-48 flex-shrink-0 -mt-16 relative z-10 bg-white p-2 rounded-lg shadow-md border border-gray-100">
                {companyData.companyLogoPath ? (
                  <img
                    src={companyData.companyLogoPath || "/placeholder.svg"}
                    alt={companyData.companyName}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 -mt-6 md:mt-0 pt-6 md:pt-0">
                <motion.div variants={itemVariants}>
                  <h1 className="text-3xl font-bold text-gray-900 pt-4">{companyData.companyName}</h1>
                  <p className="text-xl text-gray-600 mt-1">{companyData.companyType || "Technology Company"}</p>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-[#800020]/10 transition-colors">
                      <MapPin className="h-5 w-5 text-[#800020]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div>
                        {companyData.companyCity}, {companyData.companyCountry}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-[#800020]/10 transition-colors">
                      <Globe className="h-5 w-5 text-[#800020]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Website</div>
                      <a href={companyData.companyWebsite} className="text-[#800020] hover:underline">
                        {companyData.companyWebsite.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-[#800020]/10 transition-colors">
                      <Mail className="h-5 w-5 text-[#800020]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <a href={`mailto:${companyData.companyEmail}`} className="text-[#800020] hover:underline">
                        {companyData.companyEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 group">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 group-hover:bg-[#800020]/10 transition-colors">
                      <Phone className="h-5 w-5 text-[#800020]" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div>{companyData.companyContactNumber}</div>
                    </div>
                  </div>
                </motion.div>

                {companyData.companyDescription && (
                  <motion.div variants={itemVariants} className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-[#800020]" />
                      About {companyData.companyName}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">{companyData.companyDescription}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posted Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Posted Jobs</h2>
              {isCurrentUser && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate(`/company/applications/${companyData.companyID}`)}
                    variant="outline"
                    className="border-[#800020] text-[#800020] hover:bg-[#800020]/10 transition-transform hover:scale-105 active:scale-95"
                  >
                    View Applications
                  </Button>
                  <Button
                    onClick={() => navigate("/jobs/post")}
                    className="bg-[#800020] hover:bg-rose-800 text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    Post New Job
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {companyData.postedJobs && companyData.postedJobs.length > 0 ? (
                companyData.postedJobs.map((job, index) => (
                  <JobCard
                    key={job.jobID}
                    job={{
                      id: job.jobID.toString(),
                      title: job.title,
                      company: companyData.companyName,
                      companyId: companyData.companyID.toString(),
                      location: job.location,
                      description: job.description,
                      sector: job.tags,
                      type: "Full-time",
                      logo: companyData.companyLogoPath || undefined,
                      startDate: new Date(job.startDate).toLocaleDateString(),
                      endDate: new Date(job.endDate).toLocaleDateString(),
                    }}
                    onApply={handleApply}
                    mode={isCurrentUser ? "edit" : "view"}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200"
                >
                  <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Jobs Posted Yet</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    {isCurrentUser
                      ? "Start attracting talent by posting your first job opening."
                      : "This company hasn't posted any job openings yet."}
                  </p>
                  {isCurrentUser && (
                    <Button
                      onClick={() => navigate("/jobs/post")}
                      className="bg-[#800020] hover:bg-rose-800 text-white"
                    >
                      Post Your First Job
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

