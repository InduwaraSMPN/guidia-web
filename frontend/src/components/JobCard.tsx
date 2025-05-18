
import type React from "react"
import { format } from "date-fns";

import { Building2, MapPin, Tag, Calendar, ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axiosInstance from "@/lib/axios"
import { toast } from "sonner"
import { CompanyImage } from "@/lib/imageUtils"

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'PPP'); // This will format as "March 31st, 2025"
  } catch (error) {
    return dateString;
  }
};

export interface Job {
  id: string
  title: string
  company: string
  companyId?: string
  sector: string
  location: string
  description: string
  logo?: string
  requirements?: string[]
  functions?: string[]
  startDate?: string
  endDate?: string
  isExpired?: boolean
}

interface JobCardProps {
  job: Job;
  onApply: (id: string) => void;
  mode?: "view" | "edit";
  index?: number;
}

export function JobCard({ job, onApply, mode = "view", index }: JobCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isExpired = Boolean(job.isExpired || (job.endDate && new Date(job.endDate) < new Date()));
  const isStudent = user?.userType === "Student"

  // Check if job is saved when component mounts
  useEffect(() => {
    const checkIfJobIsSaved = async () => {
      if (!user || !isStudent) return;

      try {
        const response = await axiosInstance.get(`/api/jobs/is-saved/${job.id}`);
        if (response.data && typeof response.data === 'object' && 'isSaved' in response.data) {
          setIsSaved(Boolean(response.data.isSaved));
        }
      } catch (error) {
        console.error('Error checking if job is saved:', error);
      }
    };

    checkIfJobIsSaved();
  }, [job.id, user, isStudent]);

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking button
    if (mode === "edit") {
      navigate(`/jobs/${job.id}/edit`)
    } else {
      // Check if user is logged in and is a student before applying
      if (!user) {
        toast.error("Please login to apply for jobs");
        navigate('/auth/login');
        return;
      }

      if (user.userType !== "Student") {
        toast.error("You must be logged in as a student to apply");
        return;
      }

      onApply(job.id)
    }
  }

  const handleSaveJob = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking save button

    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    if (!isStudent) {
      toast.error('Only students can save jobs');
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave job
        await axiosInstance.delete(`/api/jobs/${job.id}/save`);
        setIsSaved(false);
        toast.success('Job removed from saved jobs');
      } else {
        // Save job
        await axiosInstance.post(`/api/jobs/${job.id}/save`);
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      toast.error(isSaved ? 'Failed to remove job from saved jobs' : 'Failed to save job');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index !== undefined ? index * 0.05 : 0 }}
      className={`relative bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 ${isExpired ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      whileHover={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
      }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-brand to-brand/70" />

      <div className="p-4 sm:p-6"> {/* Adjusted padding for mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5"> {/* Adjusted gap for mobile */}
          <div className="flex-shrink-0">
            <motion.div
              animate={{
                scale: isHovered ? 1.05 : 1,
                y: isHovered ? -2 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {job.logo ? (
                <CompanyImage
                  src={job.logo}
                  alt={job.company}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg border border-border p-1 bg-card" /* Smaller logo on mobile */
                  fallbackSrc="/placeholder.svg"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-lg flex items-center justify-center border border-border"> {/* Smaller placeholder on mobile */}
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" /> {/* Smaller icon on mobile */}
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3"> {/* Adjusted gap for mobile */}
              <div className="w-full">
                <motion.h3
                  className="text-lg sm:text-xl font-bold text-card-foreground truncate" /* Smaller text on mobile */
                  title={job.title}
                >
                  {job.title}
                </motion.h3>

                <Link
                  to={`/company/${job.companyId || "1"}/details`}
                  className="text-brand font-medium mt-1 hover:underline inline-flex items-center truncate block w-full"
                  onClick={(e) => e.stopPropagation()}
                  title={job.company}
                >
                  <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" /> {/* Smaller icon on mobile */}
                  <span className="truncate text-sm sm:text-base">{job.company}</span> {/* Smaller text on mobile */}
                </Link>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3"> {/* Adjusted spacing for mobile */}
                  <div className="flex items-center text-muted-foreground dark:text-neutral-400 bg-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm"> {/* Smaller padding and text on mobile */}
                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-brand" /> {/* Smaller icon on mobile */}
                    <span>{job.location}</span>
                  </div>
                  {job.sector && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2"> {/* Adjusted gap for mobile */}
                      {job.sector.split(',').map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center text-muted-foreground dark:text-neutral-400 bg-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm" /* Smaller padding and text on mobile */
                        >
                          <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-brand" /> {/* Smaller icon on mobile */}
                          <span>{tag.trim()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                animate={{
                  scale: isHovered ? 1.05 : 1,
                  y: isHovered ? -2 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="flex gap-2 mt-2 sm:mt-0" /* Added margin-top on mobile */
              >
                {/* Save Job Button - Only show for students and in view mode */}
                {isStudent && mode === "view" && (
                  <Button
                    onClick={handleSaveJob}
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    className="border-border text-foreground hover:bg-secondary hover:text-brand dark:hover:text-foreground transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 p-0" /* Adjusted size for mobile */
                    title={isSaved ? "Remove from saved jobs" : "Save job"}
                  >
                    {isLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : isSaved ? (
                      <BookmarkCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand" /> /* Smaller icon on mobile */
                    ) : (
                      <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> /* Smaller icon on mobile */
                    )}
                  </Button>
                )}

                <Button
                  onClick={handleButtonClick}
                  size="sm"
                  variant={mode === "edit" ? "outline" : "default"}
                  disabled={isExpired && mode !== "edit"}
                  className={`min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm h-8 sm:h-9 transition-all duration-200 ${
                    mode === "edit"
                      ? " border-brand text-brand hover:text-brand"
                      : isExpired
                        ? "bg-brand  cursor-not-allowed opacity-50"
                        : "bg-brand  text-white"
                  }`} /* Adjusted size and text for mobile */
                >
                  {mode === "edit"
                    ? "Edit Job"
                    : isExpired
                      ? "Expired"
                      : "Apply Now"
                  }
                </Button>
              </motion.div>
            </div>

            <div
              className="mt-3 sm:mt-4 text-muted-foreground line-clamp-2 text-xs sm:text-sm leading-relaxed prose prose-sm overflow-hidden" /* Smaller text on mobile */
              dangerouslySetInnerHTML={{ __html: job.description.length > 300
                ? job.description.substring(0, 300) + '...'
                : job.description }}
            />

            {(job.startDate || job.endDate) && (
              <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-muted-foreground"> {/* Adjusted spacing and text for mobile */}
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-brand" /> {/* Smaller icon on mobile */}
                <span className="truncate">
                  {job.startDate && `Start: ${formatDate(job.startDate)}`}
                  {job.endDate && job.startDate && " | "}
                  {job.endDate && `End: ${formatDate(job.endDate)}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View details indicator */}
      <motion.div
        className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-muted-foreground flex items-center" /* Adjusted position for mobile */
        animate={{
          opacity: isHovered ? 1 : 0,
          x: isHovered ? 0 : 10,
        }}
        transition={{ duration: 0.2 }}
      >
        View details <ArrowUpRight className="h-3 w-3 ml-1" />
      </motion.div>
    </motion.div>
  )
}

