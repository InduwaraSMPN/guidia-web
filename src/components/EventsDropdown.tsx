import { useState, useEffect } from "react"
import { HoveredLink } from "./navbar-menu"
import { Skeleton } from "./ui/skeleton"

type Event = {
  eventID: string
  title: string
  description: string
  eventDate: string
  location: string
  imageURL: string  // Changed from imageUrl to imageURL to match database
  imagePath: string  // Added imagePath field from database
  organizerID: string
  organizerName: string
  attendeeCount: number
}

// Sample events to use as fallback
const sampleEvents: Event[] = [
  {
    eventID: "1",
    title: "Career Fair 2025",
    description: "Annual career fair with top companies",
    eventDate: "2025-05-15T10:00:00",
    location: "Main Campus Hall",
    imageURL: "https://guidiacloudstorage.blob.core.windows.net/guidia-events/career-fair.jpg",
    imagePath: "guidia-events/career-fair.jpg",
    organizerID: "1",
    organizerName: "Career Services",
    attendeeCount: 120
  },
  {
    eventID: "2",
    title: "Tech Workshop",
    description: "Learn the latest technologies",
    eventDate: "2025-04-20T14:00:00",
    location: "Tech Building, Room 305",
    imageURL: "https://guidiacloudstorage.blob.core.windows.net/guidia-events/tech-workshop.jpg",
    imagePath: "guidia-events/tech-workshop.jpg",
    organizerID: "2",
    organizerName: "IT Department",
    attendeeCount: 45
  },
  {
    eventID: "3",
    title: "Alumni Networking",
    description: "Connect with successful alumni",
    eventDate: "2025-03-10T18:00:00",
    location: "Conference Center",
    imageURL: "https://guidiacloudstorage.blob.core.windows.net/guidia-events/alumni-networking.jpg",
    imagePath: "guidia-events/alumni-networking.jpg",
    organizerID: "1",
    organizerName: "Alumni Association",
    attendeeCount: 75
  },
  {
    eventID: "4",
    title: "Industry Panel",
    description: "Insights from industry leaders",
    eventDate: "2025-02-28T15:30:00",
    location: "Auditorium",
    imageURL: "https://guidiacloudstorage.blob.core.windows.net/guidia-events/industry-panel.jpg",
    imagePath: "guidia-events/industry-panel.jpg",
    organizerID: "3",
    organizerName: "Business School",
    attendeeCount: 90
  }
]

export function EventsDropdown() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [useBackupData, setUseBackupData] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/events")
        if (!response.ok) {
          throw new Error("Failed to fetch events")
        }
        const data = await response.json()
        console.log('Events data:', data)

        // Log each event's imageURL to debug
        data.forEach((event: Event, index: number) => {
          console.log(`Event ${index + 1} imageURL:`, event.imageURL)
        })

        // Check if we have valid events with images
        if (data && data.length > 0) {
          // Check if any of the events have image URLs
          const hasImages = data.some((event: Event) => event.imageURL);

          if (hasImages) {
            console.log('Using API data with images');
            setEvents(data);
          } else {
            console.log('API events have no images, using sample data');
            setUseBackupData(true);
            setEvents(sampleEvents);
          }
        } else {
          console.log('No events found from API, using sample data');
          setUseBackupData(true);
          setEvents(sampleEvents);
        }
      } catch (err) {
        console.error("Error fetching events:", err)
        console.log('Error fetching events, using sample data')
        setUseBackupData(true)
        setEvents(sampleEvents)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Get upcoming events
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return eventDate >= today
    })
    .sort((a, b) => {
      const dateA = new Date(a.eventDate)
      const dateB = new Date(b.eventDate)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 2)

  // Get past events
  const pastEvents = events
    .filter((event) => {
      const eventDate = new Date(event.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return eventDate < today
    })
    .sort((a, b) => {
      const dateA = new Date(a.eventDate)
      const dateB = new Date(b.eventDate)
      return dateB.getTime() - dateA.getTime() // Most recent first
    })
    .slice(0, 2)

  if (loading) {
    return (
      <div className="flex flex-col p-4 min-w-[400px]">
        {/* Header with Navigation Links */}
        <div className="flex border-b border-border pb-2 mb-4">
          <div className="text-sm font-medium mr-6">Upcoming Events</div>
          <div className="text-sm font-medium text-muted-foreground">Past Events</div>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="opacity-80">
              <Skeleton className="h-24 w-full rounded-md mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>

        {/* Footer with Links */}
        <div className="mt-4 pt-3 border-t border-border flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    )
  }

  // If no events found
  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return (
      <div className="flex flex-col p-4 min-w-[400px]">
        {/* Header with Navigation Links */}
        <div className="flex border-b border-border pb-2 mb-4">
          <HoveredLink href="/events?tab=upcoming" className="text-sm font-medium mr-6">
            Upcoming Events
          </HoveredLink>
          <HoveredLink href="/events?tab=past" className="text-sm font-medium text-muted-foreground">
            Past Events
          </HoveredLink>
        </div>

        {/* Empty State */}
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No events found</p>
        </div>

        {/* Footer with Links */}
        <div className="mt-4 pt-3 border-t border-border flex justify-between">
          <div className="flex items-center">
            <HoveredLink href="/events?tab=upcoming" className="text-sm font-medium">
              View Upcoming Events
            </HoveredLink>
            {useBackupData && (
              <span className="ml-2 text-xs text-amber-500">(Sample Data)</span>
            )}
          </div>
          <HoveredLink href="/events?tab=past" className="text-sm font-medium">
            View Past Events
          </HoveredLink>
        </div>
      </div>
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format image URL
  const getImageUrl = (url: string | undefined) => {
    console.log('Processing image URL:', url)

    if (!url) {
      console.log('No URL provided, using placeholder')
      return "/placeholder.svg"
    }

    // Check for empty string or null
    if (url === '' || url === 'null' || url === 'undefined') {
      console.log('Empty or invalid URL string, using placeholder')
      return "/placeholder.svg"
    }

    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('URL is already absolute, using as is')
      return url
    }

    // If it's a relative path starting with /, use it as is
    if (url.startsWith('/')) {
      console.log('URL starts with /, using as is')
      return url
    }

    // Check for image paths that might be in the public directory
    if (url.includes('images/') || url.includes('assets/')) {
      console.log('URL contains images/ or assets/, adding leading /')
      return `/${url}`
    }

    // Otherwise, assume it's a relative path and add the base URL
    console.log('Adding leading / to URL')
    return `/${url}`
  }

  return (
    <div className="flex flex-col p-4 min-w-[400px]">
      {/* Header with Navigation Links */}
      <div className="flex border-b border-border pb-2 mb-4">
        <HoveredLink href="/events?tab=upcoming" className="text-sm font-medium mr-6">
          Upcoming Events
        </HoveredLink>
        <HoveredLink href="/events?tab=past" className="text-sm font-medium text-muted-foreground">
          Past Events
        </HoveredLink>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {upcomingEvents.map((event) => (
          <div key={event.eventID} className="group">
            <HoveredLink href={`/events?tab=upcoming`} className="block">
              <div className="relative rounded-md overflow-hidden mb-2">
                <img
                  src={getImageUrl(event.imageURL)}
                  alt={event.title}
                  className="w-full h-24 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="absolute bottom-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-tl-md">
                  Upcoming
                </div>
              </div>
              <h4 className="text-sm font-medium group-hover:text-brand transition-colors line-clamp-1">{event.title}</h4>
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="inline-block w-3 h-3 mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </span>
                <span>{formatDate(event.eventDate)}</span>
              </div>
            </HoveredLink>
          </div>
        ))}

        {pastEvents.map((event) => (
          <div key={event.eventID} className="group">
            <HoveredLink href={`/events?tab=past`} className="block">
              <div className="relative rounded-md overflow-hidden mb-2">
                <img
                  src={getImageUrl(event.imageURL)}
                  alt={event.title}
                  className="w-full h-24 object-cover grayscale"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="absolute bottom-0 right-0 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-tl-md">
                  Past
                </div>
              </div>
              <h4 className="text-sm font-medium group-hover:text-brand transition-colors line-clamp-1">{event.title}</h4>
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="inline-block w-3 h-3 mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </span>
                <span>{formatDate(event.eventDate)}</span>
              </div>
            </HoveredLink>
          </div>
        ))}

        {/* Fill empty slots with placeholders if needed */}
        {upcomingEvents.length + pastEvents.length < 4 && (
          [...Array(4 - (upcomingEvents.length + pastEvents.length))].map((_, index) => (
            <div key={`empty-${index}`} className="opacity-50">
              <div className="rounded-md overflow-hidden mb-2 bg-secondary/50 h-24 w-full" />
              <div className="h-4 w-3/4 bg-secondary/50 rounded mb-1" />
              <div className="h-3 w-1/2 bg-secondary/50 rounded" />
            </div>
          ))
        )}
      </div>

      {/* Footer with Links */}
      {/* <div className="mt-4 pt-3 border-t border-border flex justify-between">
        <div className="flex items-center">
          <HoveredLink href="/events?tab=upcoming" className="text-sm font-medium">
            View Upcoming Events
          </HoveredLink>
          {useBackupData && (
            <span className="ml-2 text-xs text-amber-500">(Sample Data)</span>
          )}
        </div>
        <HoveredLink href="/events?tab=past" className="text-sm font-medium">
          View Past Events
        </HoveredLink>
      </div> */}
    </div>
  )
}
