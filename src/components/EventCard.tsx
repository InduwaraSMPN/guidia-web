

import type React from "react"

import { useState } from "react"
import { EventModal } from "./EventModal"
import { Trash2, Calendar } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { motion } from "framer-motion"

export interface Event {
  eventID: number
  title: string
  eventDate: string
  imageURL: string
  imagePath: string
  createdAt: string
  updatedAt: string
}

interface EventCardProps {
  event: Event
  onDelete?: () => void
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()

    toast.promise(
      new Promise((resolve, reject) => {
        toast("Are you sure you want to delete this event?", {
          position: "top-center",
          action: {
            label: "Delete",
            onClick: async () => {
              try {
                setIsDeleting(true)
                const response = await fetch(`http://localhost:3001/api/events/${event.eventID}`, {
                  method: "DELETE",
                })

                if (!response.ok) {
                  throw new Error("Failed to delete event")
                }

                onDelete?.()
                resolve("Event deleted successfully")
              } catch (error) {
                console.error("Error deleting event:", error)
                reject(error)
              } finally {
                setIsDeleting(false)
              }
            },
          },
          cancel: {
            label: "Cancel",
            onClick: () => reject("Cancelled"),
          },
        })
      }),
      {
        loading: "Deleting event...",
        success: "Event deleted successfully",
        error: "Failed to delete event",
      },
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <motion.div
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        className="bg-white rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer relative h-full"
      >
        <div className="relative overflow-hidden aspect-video">
          <motion.img
            src={event.imageURL}
            alt={event.title}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-semibold text-adaptive-dark line-clamp-2 mb-2">{event.title}</h3>

          <div className="flex items-center text-muted-foreground mt-3">
            <Calendar className="h-4 w-4 mr-2" />
            <p className="text-sm">{formatDate(event.eventDate)}</p>
          </div>

          <motion.div
            className="mt-4 text-brand text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            View details →
          </motion.div>
        </div>

        {user?.userType === "Admin" && (
          <motion.div
            className="absolute top-3 right-3 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-brand hover:bg-brand-dark shadow-md"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete event</span>
            </Button>
          </motion.div>
        )}
      </motion.div>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} event={event} />
    </>
  )
}




