

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, X, MapPin, Briefcase, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface JobSearchFormProps {
  onSearch: (keywords: string, location: string) => void
  initialKeywords?: string
  initialLocation?: string
}

export function JobSearchForm({ onSearch, initialKeywords = "", initialLocation = "" }: JobSearchFormProps) {
  const [keywords, setKeywords] = useState(initialKeywords)
  const [location, setLocation] = useState(initialLocation)
  const [isFocused, setIsFocused] = useState<string | null>(null)

  // This ensures the form reflects any external changes to search criteria
  useEffect(() => {
    setKeywords(initialKeywords)
    setLocation(initialLocation)
  }, [initialKeywords, initialLocation])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSearch(keywords, location)
  }

  const handleClear = () => {
    setKeywords("")
    setLocation("")
    onSearch("", "")
  }

  const hasFilters = keywords || location

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <label htmlFor="keywords" className="text-sm font-medium text-gray-700 mb-2 block">
                <Briefcase className="h-4 w-4 inline-block mr-2 text-[#800020]" />
                Job Title or Keywords
              </label>
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isFocused === "keywords" ? 1.02 : 1,
                    boxShadow: isFocused === "keywords" ? "0 4px 12px rgba(0,0,0,0.05)" : "0 0 0 rgba(0,0,0,0)",
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Input
                    id="keywords"
                    name="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    onFocus={() => setIsFocused("keywords")}
                    onBlur={() => setIsFocused(null)}
                    placeholder="e.g. Software Engineer, Marketing"
                    className="h-12 pl-10 pr-10 transition-all duration-200 border-gray-300 focus:border-[#800020] focus:ring-[#800020] focus:ring-opacity-50 rounded-lg"
                  />
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <AnimatePresence>
                    {keywords && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => setKeywords("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                        aria-label="Clear keywords"
                      >
                        <X className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            <div className="flex-1 relative group">
              <label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                <MapPin className="h-4 w-4 inline-block mr-2 text-[#800020]" />
                Location
              </label>
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isFocused === "location" ? 1.02 : 1,
                    boxShadow: isFocused === "location" ? "0 4px 12px rgba(0,0,0,0.05)" : "0 0 0 rgba(0,0,0,0)",
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Input
                    id="location"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setIsFocused("location")}
                    onBlur={() => setIsFocused(null)}
                    placeholder="e.g. New York, Remote"
                    className="h-12 pl-10 pr-10 transition-all duration-200 border-gray-300 focus:border-[#800020] focus:ring-[#800020] focus:ring-opacity-50 rounded-lg"
                  />
                  <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <AnimatePresence>
                    {location && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => setLocation("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                        aria-label="Clear location"
                      >
                        <X className="h-3.5 w-3.5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            <div className="flex gap-2 md:self-end">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  className="h-12 px-8 min-w-[120px] bg-[#800020] hover:bg-rose-800 text-white transition-all duration-200"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </motion.div>

              <AnimatePresence>
                {hasFilters && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      className="h-12 px-4 transition-all duration-200 border-[#800020] text-[#800020]"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {hasFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-100"
              >
                <div className="flex items-center text-sm text-gray-500">
                  <Filter className="h-4 w-4 mr-2 text-[#800020]" />
                  <span>Active filters:</span>
                  {keywords && (
                    <span className="ml-2 bg-[#800020]/10 text-[#800020] px-2 py-1 rounded-full text-xs flex items-center">
                      Keywords: {keywords}
                      <button onClick={() => setKeywords("")} className="ml-1 hover:text-rose-800">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {location && (
                    <span className="ml-2 bg-[#800020]/10 text-[#800020] px-2 py-1 rounded-full text-xs flex items-center">
                      Location: {location}
                      <button onClick={() => setLocation("")} className="ml-1 hover:text-rose-800">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  )
}

