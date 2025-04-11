"use client"

import type React from "react"

import { useState } from "react"
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

  const handleViewDocument = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (document) {
      setIsViewModalOpen(true)
    }
  }

  // Determine file icon based on document type
  const getFileIcon = () => {
    if (!document?.type) return <File />

    const type = document.type.toLowerCase()
    if (type.includes("pdf")) return <FileText />
    return <File />
  }

  return (
    <>
      <div
        className={`p-6 rounded-xl border ${
          isUploaded
            ? "bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm"
            : "bg-secondary-light text-adaptive-dark"
        } transition-all duration-300 hover:shadow-md`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${isUploaded ? "bg-white/20" : "bg-white"}`}>{getFileIcon()}</div>
          <div>
            <h3 className={`text-lg font-semibold ${isUploaded ? "text-white" : "text-adaptive-dark"}`}>{title}</h3>
            {document && (
              <p className={`text-sm truncate max-w-[200px] ${isUploaded ? "text-white/80" : "text-muted-foreground"}`}>
                {document.name}
              </p>
            )}
          </div>
        </div>

        {isUploaded && document && (
          <motion.div
            className="flex gap-2 mt-4 justify-end"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0.8 }}
          >
            <button
              onClick={handleViewDocument}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-brand text-sm hover:bg-secondary-light transition-colors shadow-sm hover:shadow"
              aria-label={`View ${document.name}`}
            >
              <Eye className="h-3.5 w-3.5" /> View Document
            </button>
          </motion.div>
        )}
      </div>

      {document && (
        <ViewDocumentModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          documentName={document.name}
          documentUrl={document.url}
          documentType={document.type}
        />
      )}
    </>
  )
}
