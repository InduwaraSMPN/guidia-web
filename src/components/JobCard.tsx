
import type React from "react"
import { format } from "date-fns";

import { Building2, MapPin, Briefcase, Tag, Calendar, ArrowUpRight } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"

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
  type?: string
  startDate?: string
  endDate?: string
}

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    logo?: string;
    isExpired?: boolean;
    endDate: string;
  };
  onApply: (id: string) => void;
  mode?: "view" | "edit";
  index?: number;
}

export function JobCard({ job, onApply, mode = "view", index }: JobCardProps) {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const isExpired = job.isExpired || (job.endDate && new Date(job.endDate) < new Date());

  const handleCardClick = () => {
    navigate(`/jobs/${job.id}`)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking button
    if (mode === "edit") {
      navigate(`/jobs/${job.id}/edit`)
    } else {
      onApply(job.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${isExpired ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      whileHover={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
      }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#800020] to-[#800020]/70" />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5">
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
                <img
                  src={job.logo || "/placeholder.svg"}
                  alt={job.company}
                  className="w-16 h-16 object-contain rounded-lg border border-gray-100 p-1 bg-white"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div>
                <motion.h3
                  className="text-xl font-bold text-gray-900"
                >
                  {job.title}
                </motion.h3>

                <Link
                  to={`/companies/${job.companyId || "1"}/details`}
                  className="text-[#800020] font-medium mt-1 hover:underline inline-flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Building2 className="h-4 w-4 mr-1" />
                  {job.company}
                </Link>

                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full text-sm">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#800020]" />
                    <span>{job.location}</span>
                  </div>
                  {job.type && (
                    <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full text-sm">
                      <Briefcase className="h-3.5 w-3.5 mr-1.5 text-[#800020]" />
                      <span>{job.type}</span>
                    </div>
                  )}
                  {job.sector && (
                    <div className="flex flex-wrap gap-2">
                      {job.sector.split(',').map((tag, index) => (
                        <div 
                          key={index} 
                          className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full text-sm"
                        >
                          <Tag className="h-3.5 w-3.5 mr-1.5 text-[#800020]" />
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
              >
                <Button
                  onClick={handleButtonClick}
                  size="sm"
                  variant={mode === "edit" ? "outline" : "default"}
                  disabled={isExpired && mode !== "edit"}
                  className={`min-w-[120px] transition-all duration-200 ${
                    mode === "edit"
                      ? "hover:bg-gray-100 border-[#800020] text-[#800020] hover:text-[#800020]"
                      : isExpired
                        ? "bg-[#800020] hover:bg-rose-800 cursor-not-allowed opacity-50"
                        : "bg-[#800020] hover:bg-rose-800 text-white"
                  }`}
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
              className="mt-4 text-gray-600 line-clamp-2 text-sm leading-relaxed prose prose-sm"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />

            {(job.startDate || job.endDate) && (
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2 text-[#800020]" />
                <span>
                  {job.startDate && `Start Date: ${formatDate(job.startDate)}`}
                  {job.endDate && job.startDate && " | "}
                  {job.endDate && `End Date: ${formatDate(job.endDate)}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View details indicator */}
      <motion.div
        className="absolute bottom-3 right-3 text-xs text-gray-400 flex items-center"
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
