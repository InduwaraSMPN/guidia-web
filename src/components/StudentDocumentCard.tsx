import type React from "react"

import { useState, useRef } from "react"
import { Eye, FileText, File } from "lucide-react"
import { ViewDocumentModal } from "./ViewDocumentModal"
import { motion } from "framer-motion"

interface DocumentDetails {
  name: string
  url: string
  type: string
}

interface StudentDocumentCardProps {
  title: string
  isUploaded: boolean
  document?: DocumentDetails
}

export function StudentDocumentCard({ title, isUploaded, document }: StudentDocumentCardProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleViewDocument = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    if (document) {
      setIsViewModalOpen(true)
    }
  }

  // Determine file icon based on document type
  const getFileIcon = () => {
    if (!document?.type) return <File aria-hidden="true" />

    const type = document.type.toLowerCase()
    if (type.includes("pdf")) return <FileText aria-hidden="true" />
    return <File aria-hidden="true" />
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleViewDocument(e)
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        className={`p-6 rounded-xl border ${
          isUploaded
            ? "bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm"
            : "bg-secondary-light text-adaptive-dark"
        } transition-all duration-300 hover:shadow-md ${isHovered || isFocused ? "ring-2 ring-brand ring-offset-2" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        role="article"
        aria-labelledby={`doc-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${isUploaded ? "bg-white/20" : "bg-white"}`} aria-hidden="true">
            {getFileIcon()}
          </div>
          <div>
            <h3
              id={`doc-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
              className={`text-lg font-semibold ${isUploaded ? "text-white" : "text-adaptive-dark"}`}
            >
              {title}
            </h3>
            {document && (
              <p
                className={`text-sm truncate max-w-[200px] ${isUploaded ? "text-white/80" : "text-muted-foreground"}`}
                title={document.name}
              >
                {document.name}
              </p>
            )}
          </div>
        </div>

        {isUploaded && document && (
          <motion.div
            className="flex gap-2 mt-4 justify-end"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: isHovered || isFocused ? 1 : 0.8 }}
          >
            <button
              onClick={handleViewDocument}
              onKeyDown={handleKeyDown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-brand text-sm hover:bg-light transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand"
              aria-label={`View ${document.name}`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>View Document</span>
            </button>
          </motion.div>
        )}
      </div>

      {document && (
        <ViewDocumentModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            // Return focus to the card when modal closes
            setTimeout(() => cardRef.current?.focus(), 0)
          }}
          documentName={document.name}
          documentUrl={document.url}
          documentType={document.type}
        />
      )}
    </>
  )
}
