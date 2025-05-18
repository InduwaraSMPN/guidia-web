

import { Plus, Calendar } from "lucide-react"
import { SearchBar } from "../components/SearchBar"
import { Button } from "../components/ui/button"
import { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { EventCard, type Event } from "../components/EventCard"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { PageLayout } from "@/components/PageLayout"
import { PageHeader } from "@/components/PageHeader"
import { EmptyState } from "@/components/EmptyState"

type EventType = "Upcoming" | "Past"

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/events")
      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }

  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [])

  // Update selected type when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'past') {
      setSelectedType('Past')
    } else if (tab === 'upcoming') {
      setSelectedType('Upcoming')
    }
  }, [location.search])

  // Get tab from URL query parameter
  const queryParams = new URLSearchParams(location.search)
  const tabParam = queryParams.get('tab')

  // Set initial selected type based on URL query parameter
  const [selectedType, setSelectedType] = useState<EventType>(
    tabParam === 'past' ? "Past" : "Upcoming"
  )
  const [searchQuery, setSearchQuery] = useState("")

  // Update URL when tab changes
  const handleTypeChange = (type: EventType) => {
    setSelectedType(type)
    navigate(`/events?tab=${type.toLowerCase()}`, { replace: true })
  }

  // Filter events based on date and search query
  const filteredEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return events
      .filter((event) => {
        const eventDate = new Date(event.eventDate)
        const isPast = eventDate < today

        if (selectedType === "Upcoming") {
          return !isPast
        } else {
          return isPast
        }
      })
      .filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const dateA = new Date(a.eventDate)
        const dateB = new Date(b.eventDate)
        return selectedType === "Upcoming" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
      })
  }, [selectedType, searchQuery, events])

  const renderContent = () => {
    if (loading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-border overflow-hidden animate-pulse">
              <Skeleton className="w-full h-36 sm:h-48" />
              <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                <Skeleton className="h-5 sm:h-6 w-3/4" />
                <div className="flex items-center gap-1 sm:gap-2">
                  <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                </div>
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-3 sm:h-4 w-5/6" />
                <div className="flex justify-between items-center pt-1 sm:pt-2">
                  <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
                  <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-6 text-center my-8"
        >
          <p className="text-red-500 text-lg font-medium">{error}</p>
          <Button onClick={fetchEvents} className="mt-4 bg-brand hover:bg-brand-dark">
            Try Again
          </Button>
        </motion.div>
      )
    }

    if (filteredEvents.length === 0) {
      return (
        <EmptyState
          icon={Calendar}
          title={`No ${selectedType.toLowerCase()} events found${searchQuery ? " matching your search" : ""}`}
          action={searchQuery ? { label: "Clear Search", onClick: () => setSearchQuery("") } : undefined}
        />
      )
    }

    return (
      <motion.div
        key={selectedType + searchQuery}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
      >
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.eventID}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: index * 0.05 },
            }}
          >
            <EventCard event={event} onDelete={fetchEvents} />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <PageLayout>
      <PageHeader
        title="Events"
        icon={Calendar}
        actions={
          user?.userType === "Admin" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button
                onClick={() => navigate("/events/post")}
                className="flex items-center gap-2 bg-brand hover:bg-brand-dark transition-all duration-300 shadow-sm hover:shadow"
              >
                <Plus className="h-4 w-4" />
                Post Event
              </Button>
            </motion.div>
          )
        }
      />

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="flex gap-2 sm:gap-4">
            {(["Upcoming", "Past"] as EventType[]).map((type) => (
              <motion.button
                key={type}
                onClick={() => handleTypeChange(type)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-200 ${
                  selectedType === type
                    ? "bg-brand text-white shadow-md"
                    : "border border-brand text-brand hover:bg-brand-dark hover:text-white"
                }`}
              >
                {type} Events
              </motion.button>
            ))}
          </div>

          <div className="relative flex-grow max-w-full sm:max-w-md mt-2 sm:mt-0 sm:ml-auto">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search events..." />
          </div>
        </div>

        {renderContent()}
    </PageLayout>
  )
}

