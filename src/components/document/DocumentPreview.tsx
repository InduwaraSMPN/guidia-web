

import type { DocumentPreviewProps } from "../../interfaces/Document"
import { FileText, Trash2, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { useState } from "react"

export function DocumentPreview({
  file,
  previewData,
  onRemove,
  disabled = false,
  className = "",
  onPreview,
}: DocumentPreviewProps & { onPreview?: () => void }) {
  const [isHovering, setIsHovering] = useState(false)

  const fileSize =
    file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

  const fileExtension = file.name.split(".").pop()?.toUpperCase() || ""

  return (
    <motion.div
      className={`${className} transition-all`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
        whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-[#800020]/10 p-2 rounded-md">
              <FileText className="h-6 w-6 text-[#800020]" />
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1 break-all pr-4">{file.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-700">{fileExtension}</span>
                <p className="text-sm text-gray-500">{fileSize}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onPreview && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onPreview}
                className="text-gray-500 hover:text-[#800020] transition-colors"
                disabled={disabled}
                title="Preview File"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="text-gray-500 hover:text-red-500 transition-colors"
              disabled={disabled}
              title="Remove File"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {previewData && (
        <motion.div
          className="mt-4 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Document Preview</h3>
          </div>
          <div style={{ width: "100%", height: "500px" }}>
            <iframe src={previewData} title="PDF Preview" style={{ width: "100%", height: "100%", border: "none" }} />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}