

import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { DirectoryCard } from '../components/DirectoryCard';
import { useEffect, useState, useTransition, useRef } from "react"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { FilterPanel, type FilterSection } from "@/components/FilterPanel";
import { SlidersHorizontal } from "lucide-react";
import { Building2 } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';

interface Company {
  companyID: string
  companyName: string
  companyCountry: string
  companyCity: string
  companyWebsite: string
  companyContactNumber: string
  companyEmail: string
  companyDescription: string
  companyLogoPath: string
  createdAt: string
  updatedAt: string
  userID: string
}

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPending, startTransition] = useTransition()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    countries: [] as string[],
    cities: [] as string[],
  })

  const filterPanelRef = useRef<HTMLDivElement>(null)

  // Get unique values from actual data
  const countries = companies.length > 0 
    ? [...new Set(companies.map(company => company.companyCountry))]
    : ["Sri Lanka", "Pakistan", "India", "Bangladesh"]; // Default values based on region

  const cities = companies.length > 0 
    ? [...new Set(companies.map(company => company.companyCity))]
    : ["Colombo", "Karachi", "Mumbai", "Dhaka"]; // Default values based on region

  const handleFilterChange = (
    filterType: "countries" | "cities",
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
      countries: [],
      cities: [],
    })
  }

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/companies`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch companies: ${response.status}`);
        }
        
        const data = await response.json()
        setCompanies(data)
        setFilteredCompanies(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  useEffect(() => {
    startTransition(() => {
      let filtered = [...companies]

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (company) =>
            company.companyName.toLowerCase().includes(query) ||
            company.companyCountry.toLowerCase().includes(query) ||
            company.companyCity.toLowerCase().includes(query)
        )
      }

      // Apply country filters
      if (filters.countries.length > 0) {
        filtered = filtered.filter(company =>
          filters.countries.includes(company.companyCountry)
        )
      }

      // Apply city filters
      if (filters.cities.length > 0) {
        filtered = filtered.filter(company =>
          filters.cities.includes(company.companyCity)
        )
      }

      setFilteredCompanies(filtered)
    })
  }, [searchQuery, companies, filters])

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
    visible: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-white ${location.pathname.startsWith("/admin") ? "pt-6" : "pt-32"}`}>
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#800020] mb-8">Companies</h1>
          <div className="relative mb-12 max-w-lg ml-auto">
            <div className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-xs p-4 h-28 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-white ${location.pathname.startsWith("/admin") ? "pt-6" : "pt-32"}`}>
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#800020] mb-8">Companies</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#800020] text-white rounded-md hover:bg-rose-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filterSections: FilterSection[] = [
    {
      title: "Country",
      items: countries,
      selectedItems: filters.countries,
      onChange: (value) => handleFilterChange("countries", value)
    },
    {
      title: "City",
      items: cities,
      selectedItems: filters.cities,
      onChange: (value) => handleFilterChange("cities", value)
    }
  ]

  const activeFilterCount = 
    filters.countries.length + 
    filters.cities.length;

  return (
    <div className={`min-h-screen bg-white ${location.pathname.startsWith("/admin") ? "pt-6" : "pt-32"}`}>
      <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <header className="mb-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-[#800020]" />
                <h1 className="text-4xl font-bold text-[#800020]">Companies</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-full md:w-64 lg:w-80">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search companies..." />
                </div>

                {/* Add Filters Button Here */}
                <div className="relative">
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                      isOpen || activeFilterCount > 0 ? "bg-[#800020] text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="bg-white text-[#800020] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
            </div>
          </header>
        </motion.div>

        {filteredCompanies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-gray-50 rounded-lg"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No companies found</h2>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredCompanies.map((company) => (
              <motion.div key={company.userID} variants={itemVariants}>
                <DirectoryCard
                  type="company"
                  id={company.userID}
                  name={company.companyName}
                  subtitle={company.companyCategory}
                  email={company.companyEmail}
                  contactNumber={company.companyContactNumber}
                  image={company.companyLogoPath}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
