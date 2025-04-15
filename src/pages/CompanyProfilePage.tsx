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
import { Skeleton } from "@/components/ui/skeleton"

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

        // Store companyID in localStorage for the current user
        if (isCurrentUser && response.data.companyID) {
          localStorage.setItem('companyID', response.data.companyID.toString())
          console.log('Stored companyID in localStorage:', response.data.companyID)
        }
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
      <div className="min-h-screen bg-secondary pt-32 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Company Info Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="w-48 h-48 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-28" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-end">
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </div>
                  </div>
                </div>
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
        className="min-h-screen bg-secondary pt-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-adaptive-dark mb-2">Company Not Found</h2>
          <p className="text-muted-foreground mb-6">
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
      className="min-h-screen bg-secondary pt-32 pb-32 px-4 sm:px-6 lg:px-8"
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
          <div className="relative h-24 bg-brand">
            {/* Profile controls moved to dropdown menu */}
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Company Logo */}
              <div className="w-48 h-48 flex-shrink-0 -mt-16 relative z-10 bg-white p-2 rounded-lg shadow-md border border-border">
                {companyData.companyLogoPath ? (
                  <img
                    src={companyData.companyLogoPath || "/placeholder.svg"}
                    alt={companyData.companyName}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary-light rounded-lg flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 -mt-6 md:mt-0 pt-6 md:pt-0">
                <motion.div variants={itemVariants}>
                  <h1 className="text-3xl font-bold text-adaptive-dark pt-4">{companyData.companyName}</h1>
                  <p className="text-xl text-muted-foreground mt-1">{companyData.companyType || "Technology Company"}</p>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-muted-foreground group">
                    <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center mr-3 group-hover:bg-brand/10 transition-colors">
                      <MapPin className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div>
                        {companyData.companyCity}, {companyData.companyCountry}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-muted-foreground group">
                    <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center mr-3 group-hover:bg-brand/10 transition-colors">
                      <Globe className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Website</div>
                      <a href={companyData.companyWebsite} className="text-brand hover:underline">
                        {companyData.companyWebsite.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center text-muted-foreground group">
                    <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center mr-3 group-hover:bg-brand/10 transition-colors">
                      <Mail className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <a href={`mailto:${companyData.companyEmail}`} className="text-brand hover:underline">
                        {companyData.companyEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center text-muted-foreground group">
                    <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center mr-3 group-hover:bg-brand/10 transition-colors">
                      <Phone className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div>{companyData.companyContactNumber}</div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* About section moved outside the flex layout to align with profile image */}
            {companyData.companyDescription && (
              <motion.div variants={itemVariants} className="mt-8 p-4 bg-secondary rounded-lg border border-border">
                <h2 className="text-lg font-semibold text-adaptive-dark mb-3 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-brand" />
                  About {companyData.companyName}
                </h2>
                <div
                  className="prose max-w-none text-muted-foreground text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: companyData.companyDescription,
                  }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Posted Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="border-b border-border px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-adaptive-dark">Posted Jobs</h2>
              {isCurrentUser && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate(`/company/applications/${companyData.companyID}`)}
                    variant="outline"
                    className="border-brand text-brand transition-transform hover:scale-105 active:scale-95"
                  >
                    View Applications
                  </Button>
                  <Button
                    onClick={() => navigate("/jobs/post")}
                    className="bg-brand hover:bg-brand-dark text-white transition-transform hover:scale-105 active:scale-95"
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
                  className="flex flex-col items-center justify-center py-12  rounded-lg border border-dashed border-border"
                >
                  <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-foreground mb-2">No Jobs Posted Yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    {isCurrentUser
                      ? "Start attracting talent by posting your first job opening."
                      : "This company hasn't posted any job openings yet."}
                  </p>
                  {isCurrentUser && (
                    <Button
                      onClick={() => navigate("/jobs/post")}
                      className="bg-brand hover:bg-brand-dark text-white"
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




