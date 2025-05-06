import type React from "react"

import { useState, useRef } from "react"
import { Eye, FileText, File } from "lucide-react"
import { ViewDocumentModal } from "./ViewDocumentModal"

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
        className="bg-card rounded-lg border border-border p-3 sm:p-5 hover:shadow-md transition-all duration-300 hover:border-brand/30 group"
        role="article"
        aria-labelledby={`doc-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <div className="text-muted-foreground w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true">
              {getFileIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id={`doc-title-${title.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-sm sm:text-base font-semibold text-adaptive-dark truncate group-hover:text-brand transition-colors duration-300"
            >
              {title}
            </h3>
            {document && (
              <p
                className="text-xs sm:text-sm text-muted-foreground truncate"
                title={document.name}
              >
                {document.name}
              </p>
            )}

            {isUploaded && document && (
              <div className="mt-2 sm:mt-3 flex items-center">
                <button
                  onClick={handleViewDocument}
                  onKeyDown={handleKeyDown}
                  className="text-brand hover:text-brand-dark text-[10px] sm:text-xs font-medium inline-flex items-center gap-1 hover:underline"
                  aria-label={`View ${document.name}`}
                >
                  <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" />
                  <span>View Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
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
