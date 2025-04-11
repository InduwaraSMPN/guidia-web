

import { FileText, Eye, Trash2, ImageIcon } from "lucide-react"
import type { FilePreviewProps } from "../../interfaces/Profile"
import { Button } from "../ui/button"
import { motion } from "framer-motion"
import { useState } from "react"

export function FilePreview({ file, previewUrl, onRemove, onPreview, className = "" }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/")
  const [isHovering, setIsHovering] = useState(false)

  const fileSize =
    file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

  const fileExtension = file.name.split(".").pop()?.toUpperCase() || ""

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {isImage ? (
        <motion.div
          className="relative rounded-lg overflow-hidden"
          whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
        >
          <div className="relative group">
            <motion.img
              src={previewUrl}
              alt={file.name}
              className="w-full h-48 object-cover rounded-lg"
              layoutId={`image-${file.name}`}
            />
            <motion.div
              className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-lg p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-end">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onPreview}
                    className="bg-white/90 hover:bg-white text-foreground rounded-full w-8 h-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onRemove}
                    className="bg-white/90 hover:bg-white text-red-500 rounded-full w-8 h-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-white">
                <div className="flex items-center gap-1 text-xs bg-black/50 rounded-full px-2 py-1 w-fit">
                  <ImageIcon className="h-3 w-3" />
                  <span>{fileExtension}</span>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-foreground font-medium truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">{fileSize}</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="bg-secondary border border-border rounded-lg p-4 hover:border-border transition-all"
          whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-brand/10 p-2 rounded-md">
                <FileText className="h-6 w-6 text-brand" />
              </div>
              <div>
                <p className="font-medium text-adaptive-dark mb-1 break-all pr-4">{file.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-secondary-dark rounded-full text-foreground">{fileExtension}</span>
                  <p className="text-sm text-muted-foreground">{fileSize}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPreview}
                className="flex items-center gap-1 transition-all hover:bg-secondary-light"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="flex items-center gap-1 bg-brand text-white hover:bg-brand-dark transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}




