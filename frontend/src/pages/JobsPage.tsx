

import { useState, useEffect, useRef } from "react"
import { JobSearchForm } from "../components/JobSearchForm"
import { JobCard } from "../components/JobCard"
import type { Job } from "../components/JobCard"
import { useNavigate } from "react-router-dom"
import axiosInstance from "@/lib/axios"
import { motion } from "framer-motion"
import { Briefcase, Filter, SlidersHorizontal } from "lucide-react"
import { toast } from 'sonner'
import { FilterPanel, type FilterSection } from "@/components/FilterPanel"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/PageLayout"
import { EmptyState } from "@/components/EmptyState"
import { useAuth } from "@/contexts/AuthContext"

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    sectors: [] as string[],
    showExpired: false, // Show expired jobs filter
  })

  const filterPanelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Close filters when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [])

  // Apply filters whenever they change
  useEffect(() => {
    if (jobs.length > 0) {
      applyFilters()
    }
  }, [filters, jobs])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get("/api/jobs")
      const jobsData = response.data.map((job: any) => ({
        id: job.jobID.toString(),
        title: job.title,
        company: job.companyName,
        companyId: job.companyID.toString(),
        location: job.location,
        description: job.description,

        logo: job.companyLogoPath,
        sector: job.tags,
        isExpired: job.isExpired,
        endDate: job.endDate || ""
      }))
      setJobs(jobsData)
      setFilteredJobs(jobsData)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (keywords: string, searchLocation: string) => {
    setSearchPerformed(true)
    applyFilters(keywords, searchLocation)
  }

  const applyFilters = (keywords = "", searchLocation = "") => {
    setIsLoading(true)

    const filtered = jobs.filter((job) => {
      // Text search filters
      const matchesKeywords = keywords
        ? job.title.toLowerCase().includes(keywords.toLowerCase()) ||
          job.company.toLowerCase().includes(keywords.toLowerCase()) ||
          job.description.toLowerCase().includes(keywords.toLowerCase())
        : true

      const matchesLocation = searchLocation ? job.location.toLowerCase().includes(searchLocation.toLowerCase()) : true

      // Advanced filters - since we removed job types, always return true for job type filter
      const matchesJobType = true

      // Clean up sectors by removing empty, whitespace-only, or invalid tags
      const validSectors = filters.sectors
        .map(s => s.trim())
        .filter(s => s && s.length > 0 && !/^\d+$/.test(s) && s.length <= 50);

      // Split job's sector string into individual tags
      const jobTags = job.sector ? job.sector.split(',').map(tag => tag.trim()) : []

      // Check if any of the job's tags match any of the selected sectors
      const matchesSector = validSectors.length > 0
        ? jobTags.some(tag => validSectors.includes(tag))
        : true

      // Expired filter
      const matchesExpired = filters.showExpired
        ? true
        : !job.isExpired;

      return matchesKeywords && matchesLocation && matchesJobType && matchesSector && matchesExpired;
    })

    setFilteredJobs(filtered)
    setIsLoading(false)
  }

  const handleFilterChange = (filterType: "sectors", value: string) => {
    setFilters((prev) => {
      const currentValues = [...prev[filterType]]
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [filterType]: newValues,
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      sectors: [],
      showExpired: false,
    })
  }

  const handleApply = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job?.isExpired) {
      toast.error("This job posting has expired", {
        duration: 3000,
      });
      return;
    }

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

    navigate(`/jobs/${jobId}/apply`);
  }

  // We no longer use job types

  // Split comma-separated tags into individual tags
  const sectors = Array.from(
    new Set(
      jobs
        .filter(job => !job.isExpired) // Only include sectors from active jobs
        .flatMap((job) =>
          job.sector
            ? job.sector.split(',').map(tag => tag.trim()).filter(tag =>
                tag &&
                tag.length > 0 &&
                !/^\d+$/.test(tag) &&
                tag.length <= 50
              )
            : []
        )
    )
  ) as string[]

  const activeFilterCount = filters.sectors.length + (filters.showExpired ? 1 : 0);

  const filterSections: FilterSection[] = [
    {
      title: "Tags",
      items: sectors,
      selectedItems: filters.sectors,
      onChange: (value) => handleFilterChange("sectors", value)
    },
    {
      title: "Job Status",
      items: ["Include expired jobs"],
      selectedItems: filters.showExpired ? ["Include expired jobs"] : [],
      onChange: () => {
        setFilters(prev => ({
          ...prev,
          showExpired: !prev.showExpired
        }))
      }
    }
  ]

  return (
    <PageLayout>
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center mb-4 bg-brand/10 p-3 rounded-full">
          <Briefcase className="h-6 w-6 text-brand" />
        </div>
        <h1 className="text-4xl font-bold text-adaptive-dark mb-3">
          Find Your Next <span className="text-brand">Career</span>
        </h1>
      </div>

        <JobSearchForm
          onSearch={handleSearch}
          className="bg-white rounded-lg border border-border p-6 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        <div className="mb-6 flex justify-between items-center relative">
          <div className="text-foreground">
            {!isLoading && searchPerformed && (
              <p>
                Showing <span className="font-medium">{filteredJobs.length}</span> job
                {filteredJobs.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="relative">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                isOpen || activeFilterCount > 0 ? "bg-brand text-white" : "text-foreground hover:bg-secondary-light"
              }`}
              onClick={() => setIsOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-brand text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <FilterPanel
              sections={filterSections}
              onClose={() => setIsOpen(false)}
              onClearAll={clearFilters}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          </div>
        </div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-border p-4 sm:p-6 animate-pulse">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                    <Skeleton className="h-5 sm:h-6 w-3/4" />
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                      <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                      <Skeleton className="h-4 sm:h-5 w-20 sm:w-28" />
                    </div>
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-5/6" />
                    <div className="flex justify-end">
                      <Skeleton className="h-8 sm:h-9 w-24 sm:w-28" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : filteredJobs.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {filteredJobs.map((job, index) => (
              <JobCard key={job.id} job={job} onApply={handleApply} index={index} />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Filter}
            title="No matching jobs found"
            description="Try adjusting your search criteria or explore other opportunities."
            action={{
              label: "View all jobs",
              onClick: () => {
                clearFilters()
                handleSearch("", "")
              }
            }}
          />
        )}
    </PageLayout>
  )
}




