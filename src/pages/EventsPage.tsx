

import { Plus } from "lucide-react"
import { SearchBar } from "../components/SearchBar"
import { Button } from "../components/ui/button"
import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { EventCard, type Event } from "../components/EventCard"
import { motion, AnimatePresence } from "framer-motion"

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

  useEffect(() => {
    fetchEvents()
  }, [])

  const [selectedType, setSelectedType] = useState<EventType>("Upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()

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
          className="flex justify-center items-center py-16"
        >
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#800020] border-opacity-20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#800020] rounded-full animate-spin"></div>
          </div>
          <span className="sr-only">Loading events...</span>
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
          <Button onClick={fetchEvents} className="mt-4 bg-[#800020] hover:bg-rose-800">
            Try Again
          </Button>
        </motion.div>
      )
    }

    if (filteredEvents.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center my-8"
        >
          <p className="text-gray-500 text-lg mb-4">
            No {selectedType.toLowerCase()} events found
            {searchQuery && " matching your search"}
          </p>
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              className="border-[#800020] text-[#800020]  hover:bg-rose-800"
            >
              Clear Search
            </Button>
          )}
        </motion.div>
      )
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedType + searchQuery}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
      </AnimatePresence>
    )
  }

  return (
    <div className={`min-h-screen bg-white ${location.pathname.startsWith("/admin") ? "pt-6" : "pt-32"}`}>
      <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[#800020]"
          >
            Events
          </motion.h1>

          {user?.userType === "Admin" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button
                onClick={() => navigate("/events/post")}
                className="flex items-center gap-2 bg-[#800020] hover:bg-rose-800 transition-all duration-300 shadow-sm hover:shadow"
              >
                <Plus className="h-4 w-4" />
                Post Event
              </Button>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-12">
          <div className="flex gap-4">
            {(["Upcoming", "Past"] as EventType[]).map((type) => (
              <motion.button
                key={type}
                onClick={() => setSelectedType(type)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-6 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  selectedType === type
                    ? "bg-[#800020] text-white shadow-md"
                    : "border border-[#800020] text-[#800020]  hover:bg-rose-800 hover:text-white"
                }`}
              >
                {type} Events
              </motion.button>
            ))}
          </div>

          <div className="relative flex-grow max-w-md ml-auto">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search events..." />
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}