import type React from "react"
import { DirectoryCard } from "@/components/DirectoryCard"
import { useEffect, useState, useTransition, useRef } from "react"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { FilterPanel, type FilterSection } from "@/components/FilterPanel"
import { SlidersHorizontal, Users } from "lucide-react"
import { SearchBar } from "@/components/SearchBar"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/PageLayout"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"

interface Counselor {
  counselorID: string
  counselorName: string
  counselorPosition: string
  counselorEducation: string
  counselorContactNumber: string
  counselorExperienceYears: number
  counselorLocation: string
  counselorLanguages: string[]
  counselorDescription: string
  counselorProfileImagePath: string
  userID: string
  createdAt: string
  updatedAt: string
  counselorSpecializations: string[]
}

export function CounselorsPage() {
  const location = useLocation()
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [filteredCounselors, setFilteredCounselors] = useState<Counselor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    specializations: [] as string[],
    experience: [] as string[],
    positions: [] as string[],
    locations: [] as string[],
    languages: [] as string[]
  })

  // Default specializations based on your data
  const DEFAULT_SPECIALIZATIONS = [
    "Technology Career Paths",
    "Resume Building",
    "Job Search Strategies",
    "Career Transition",
    "Interview Preparation",
    "Professional Development"
  ]

  // Experience ranges
  const DEFAULT_EXPERIENCE = [
    "0-2 years",
    "3-5 years",
    "6-10 years",
    "10+ years"
  ]

  const filterPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/counselors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch counselors")
        }
        const data = await response.json()
        setCounselors(data)
        setFilteredCounselors(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCounselors()
  }, [])

  // Get unique values from actual data
  const specializations = counselors.length > 0
    ? [...new Set(counselors.flatMap(counselor =>
        Array.isArray(counselor.counselorSpecializations)
          ? counselor.counselorSpecializations
          : JSON.parse(counselor.counselorSpecializations || '[]')
      ))]
    : DEFAULT_SPECIALIZATIONS

  const positions = counselors.length > 0
    ? [...new Set(counselors.map(counselor => counselor.counselorPosition))]
    : ["Licensed Clinical Psychologist", "Career Counselor", "Academic Advisor"]

  const locations = counselors.length > 0
    ? [...new Set(counselors.map(counselor => counselor.counselorLocation))]
    : ["Los Angeles, California, USA", "New York, USA", "London, UK"]

  const languages = counselors.length > 0
    ? [...new Set(counselors.flatMap(counselor =>
        Array.isArray(counselor.counselorLanguages)
          ? counselor.counselorLanguages
          : JSON.parse(counselor.counselorLanguages || '[]')
      ))]
    : ["English", "Spanish", "Japanese", "Portuguese"]

  const getExperienceRange = (years: number): string => {
    if (years <= 2) return "0-2 years"
    if (years <= 5) return "3-5 years"
    if (years <= 10) return "6-10 years"
    return "10+ years"
  }

  const experiences = counselors.length > 0
    ? [...new Set(counselors.map(counselor =>
        getExperienceRange(counselor.counselorExperienceYears)
      ))]
    : DEFAULT_EXPERIENCE

  const handleFilterChange = (
    filterType: "specializations" | "experience" | "positions" | "locations" | "languages",
    value: string
  ) => {
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
      specializations: [],
      experience: [],
      positions: [],
      locations: [],
      languages: []
    })
  }

  useEffect(() => {
    startTransition(() => {
      let filtered = [...counselors]

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (counselor) =>
            counselor.counselorName.toLowerCase().includes(query) ||
            counselor.counselorPosition.toLowerCase().includes(query) ||
            counselor.counselorLocation.toLowerCase().includes(query) ||
            counselor.counselorSpecializations.some(spec =>
              spec.toLowerCase().includes(query)
            ) ||
            counselor.counselorLanguages.some(lang =>
              lang.toLowerCase().includes(query)
            )
        )
      }

      // Apply specialization filters
      if (filters.specializations.length > 0) {
        filtered = filtered.filter(counselor =>
          filters.specializations.some(spec =>
            counselor.counselorSpecializations.includes(spec)
          )
        )
      }

      // Apply experience filters
      if (filters.experience.length > 0) {
        filtered = filtered.filter(counselor =>
          filters.experience.includes(
            getExperienceRange(counselor.counselorExperienceYears)
          )
        )
      }

      // Apply position filters
      if (filters.positions.length > 0) {
        filtered = filtered.filter(counselor =>
          filters.positions.includes(counselor.counselorPosition)
        )
      }

      // Apply location filters
      if (filters.locations.length > 0) {
        filtered = filtered.filter(counselor =>
          filters.locations.includes(counselor.counselorLocation)
        )
      }

      // Apply language filters
      if (filters.languages.length > 0) {
        filtered = filtered.filter(counselor =>
          filters.languages.some(lang =>
            counselor.counselorLanguages.includes(lang)
          )
        )
      }

      setFilteredCounselors(filtered)
    })
  }, [searchQuery, counselors, filters])

  const filterSections: FilterSection[] = [
    {
      title: "Specialization",
      items: specializations,
      selectedItems: filters.specializations,
      onChange: (value) => handleFilterChange("specializations", value)
    },
    {
      title: "Experience",
      items: experiences,
      selectedItems: filters.experience,
      onChange: (value) => handleFilterChange("experience", value)
    },
    {
      title: "Position",
      items: positions,
      selectedItems: filters.positions,
      onChange: (value) => handleFilterChange("positions", value)
    },
    {
      title: "Location",
      items: locations,
      selectedItems: filters.locations,
      onChange: (value) => handleFilterChange("locations", value)
    },
    {
      title: "Languages",
      items: languages,
      selectedItems: filters.languages,
      onChange: (value) => handleFilterChange("languages", value)
    }
  ]

  const activeFilterCount =
    filters.specializations.length +
    filters.experience.length +
    filters.positions.length +
    filters.locations.length +
    filters.languages.length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  if (loading) {
    return (
      <PageLayout>
        <PageHeader title="Counselors" icon={Users} />
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="ml-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <PageHeader title="Counselors" icon={Users} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        title="Counselors"
        icon={Users}
        actions={
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64 lg:w-80">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search counselors..." />
            </div>

            {/* Add Filters Button Here */}
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
        }
      />

        {filteredCounselors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No counselors found"
            description="Try adjusting your search criteria"
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredCounselors.map((counselor) => (
              <motion.div key={counselor.userID} variants={itemVariants}>
                <DirectoryCard
                  type="counselor"
                  id={counselor.userID}
                  name={counselor.counselorName}
                  subtitle={counselor.counselorTitle}
                  email={counselor.counselorEmail}
                  contactNumber={counselor.counselorContactNumber}
                  image={counselor.counselorProfileImagePath}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
    </PageLayout>
  )
}


