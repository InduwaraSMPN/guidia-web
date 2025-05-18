

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, X, MapPin, Briefcase, Filter } from "lucide-react"
import { motion } from "framer-motion"

interface JobSearchFormProps {
  onSearch: (keywords: string, location: string) => void
  initialKeywords?: string
  initialLocation?: string
  className?: string
  initial?: any
  animate?: any
  transition?: any
}

export function JobSearchForm({ onSearch, initialKeywords = "", initialLocation = "", className, initial, animate, transition }: JobSearchFormProps) {
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
    <motion.div
      initial={initial || { opacity: 0, y: -10 }}
      animate={animate || { opacity: 1, y: 0 }}
      transition={transition || { duration: 0.3 }}
      className={className}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <label htmlFor="keywords" className="text-sm font-medium text-foreground mb-2 block">
                <Briefcase className="h-4 w-4 inline-block mr-2 text-brand" />
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
                    className="h-12 pl-10 pr-10 transition-all duration-200 border-border focus:border-brand focus:ring-[#800020]  rounded-lg"
                  />
                  <Search className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  {keywords && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      type="button"
                      onClick={() => setKeywords("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-secondary-light rounded-full w-6 h-6 flex items-center justify-center"
                      aria-label="Clear keywords"
                    >
                      <X className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="flex-1 relative group">
              <label htmlFor="location" className="text-sm font-medium text-foreground mb-2 block">
                <MapPin className="h-4 w-4 inline-block mr-2 text-brand" />
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
                    className="h-12 pl-10 pr-10 transition-all duration-200 border-border focus:border-brand focus:ring-[#800020]  rounded-lg"
                  />
                  <MapPin className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                  {location && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      type="button"
                      onClick={() => setLocation("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-secondary-light rounded-full w-6 h-6 flex items-center justify-center"
                      aria-label="Clear location"
                    >
                      <X className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="flex gap-2 md:self-end">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  className="h-12 px-8 min-w-[120px] bg-brand hover:bg-brand-dark text-white transition-all duration-200"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </motion.div>

              {hasFilters && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    className="h-12 px-4 transition-all duration-200 border-brand text-brand"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="flex items-center text-sm text-muted-foreground">
                <Filter className="h-4 w-4 mr-2 text-brand" />
                <span>Active filters:</span>
                {keywords && (
                  <span className="ml-2 bg-brand/10 text-brand px-2 py-1 rounded-full text-xs flex items-center">
                    Keywords: {keywords}
                    <button onClick={() => setKeywords("")} className="ml-1 hover:text-brand-dark">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {location && (
                  <span className="ml-2 bg-brand/10 text-brand px-2 py-1 rounded-full text-xs flex items-center">
                    Location: {location}
                    <button onClick={() => setLocation("")} className="ml-1 hover:text-brand-dark">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </form>
    </motion.div>
  )
}



