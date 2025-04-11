

import { useState, useEffect, useRef } from "react"
import { JobSearchForm } from "../components/JobSearchForm"
import { JobCard } from "../components/JobCard"
import type { Job } from "../components/JobCard"
import { useNavigate, useLocation } from "react-router-dom"
import axiosInstance from "@/lib/axios"
import { motion } from "framer-motion"
import { Briefcase, Filter, SlidersHorizontal, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { FilterPanel, type FilterSection } from "@/components/FilterPanel"

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    jobTypes: [] as string[],
    sectors: [] as string[],
    showExpired: false, // Add this new filter
  })

  const filterPanelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

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
        type: "Full-time",
        logo: job.companyLogoPath,
        sector: job.tags,
        isExpired: job.isExpired,
        endDate: job.endDate || ""
      }))
      setJobs(jobsData)
      setFilteredJobs(jobsData)

      // Extract unique job types and sectors for filters
      const uniqueJobTypes = Array.from(new Set(jobsData.map((job) => job.type).filter(Boolean)))
      const uniqueSectors = Array.from(new Set(jobsData.map((job) => job.sector).filter(Boolean)))
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (keywords: string, location: string) => {
    setSearchPerformed(true)
    applyFilters(keywords, location)
  }

  const applyFilters = (keywords = "", location = "") => {
    setIsLoading(true)

    const filtered = jobs.filter((job) => {
      // Text search filters
      const matchesKeywords = keywords
        ? job.title.toLowerCase().includes(keywords.toLowerCase()) ||
          job.company.toLowerCase().includes(keywords.toLowerCase()) ||
          job.description.toLowerCase().includes(keywords.toLowerCase())
        : true

      const matchesLocation = location ? job.location.toLowerCase().includes(location.toLowerCase()) : true

      // Advanced filters
      const matchesJobType = filters.jobTypes.length > 0 ? filters.jobTypes.includes(job.type || "") : true

      // Clean up sectors by removing empty, whitespace-only, or invalid tags
      const validSectors = filters.sectors
        .map(s => s.trim())
        .filter(s => s && s.length > 0 && !/^\d+$/.test(s) && s.length <= 50);

      const matchesSector = validSectors.length > 0
        ? validSectors.includes(job.sector || "")
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

  const handleFilterChange = (filterType: "jobTypes" | "sectors", value: string) => {
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
      jobTypes: [],
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
    navigate(`/jobs/${jobId}/apply`);
  }

  // Get unique job types and sectors from active jobs only
  const jobTypes = Array.from(new Set(jobs
    .filter(job => !job.isExpired)
    .map((job) => job.type)
    .filter(Boolean))) as string[]

  const sectors = Array.from(
    new Set(
      jobs
        .filter(job => !job.isExpired) // Only include sectors from active jobs
        .map((job) => job.sector)
        .filter(sector =>
          sector &&
          sector.trim().length > 0 &&
          !/^\d+$/.test(sector) &&
          sector.length <= 50
        )
    )
  ) as string[]

  const activeFilterCount = filters.jobTypes.length + filters.sectors.length + (filters.showExpired ? 1 : 0);

  const filterSections: FilterSection[] = [
    {
      title: "Job Type",
      items: jobTypes,
      selectedItems: filters.jobTypes,
      onChange: (value) => handleFilterChange("jobTypes", value)
    },
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
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center mb-4 bg-brand/10 p-3 rounded-full">
            <Briefcase className="h-6 w-6 text-brand" />
          </div>
          <h1 className="text-4xl font-bold text-adaptive-dark mb-3">
            Find Your Next <span className="text-brand">Career</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover opportunities that match your skills and aspirations. Browse through our curated list of job
            openings.
          </p>
        </motion.div>

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
            className="text-center py-16"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
            <p className="text-muted-foreground mt-4 font-medium">Searching for opportunities...</p>
          </motion.div>
        ) : filteredJobs.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {filteredJobs.map((job, index) => (
              <JobCard key={job.id} job={job} onApply={handleApply} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-secondary rounded-lg border border-border"
          >
            <div className="bg-white p-4 rounded-full inline-flex items-center justify-center mb-4 shadow-sm">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-adaptive-dark mb-2">No matching jobs found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search criteria or explore other opportunities.
            </p>
            <button
              onClick={() => {
                clearFilters()
                handleSearch("", "")
              }}
              className="mt-6 text-brand hover:underline font-medium"
            >
              View all jobs
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}




