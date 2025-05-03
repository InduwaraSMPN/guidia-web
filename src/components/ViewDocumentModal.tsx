

import type React from "react"

import { Download, FileText, X, ZoomIn, ZoomOut, Maximize, Minimize, Info } from "lucide-react"
import { Button } from "./ui/button"
import { useState, useEffect, useRef, useCallback } from "react"
import { getAzureFileInfo, parseAzureBlobUrl, getFullAzureUrl, AzureFileInfo } from "../lib/azureUtils"
import { UPLOAD_SETTINGS } from "../config"
// @ts-ignore - Importing from framer-motion
import { motion, AnimatePresence } from "framer-motion"

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentUrl: string;
  documentType?: string;
}

export function ViewDocumentModal({
  isOpen,
  onClose,
  documentName,
  documentUrl,
  documentType,
}: ViewDocumentModalProps) {
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [scale, setScale] = useState<number>(1.0)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fileInfo, setFileInfo] = useState<AzureFileInfo | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageContainerRef.current) {
      const newX = position.x + e.movementX
      const newY = position.y + e.movementY

      // Calculate boundaries
      const container = imageContainerRef.current
      const img = container.querySelector("img")
      if (img) {
        const bounds = {
          left: (img.width * scale - container.clientWidth) / -2,
          right: (img.width * scale - container.clientWidth) / 2,
          top: (img.height * scale - container.clientHeight) / -2,
          bottom: (img.height * scale - container.clientHeight) / 2,
        }

        // Constrain movement within boundaries
        const constrainedX = Math.max(bounds.left, Math.min(bounds.right, newX))
        const constrainedY = Math.max(bounds.top, Math.min(bounds.bottom, newY))

        setPosition({ x: constrainedX, y: constrainedY })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Memoize zoom functions to avoid recreating them on every render
  const handleZoomIn = useCallback(() => {
    setScale((prev) => {
      // More granular zoom steps for better control
      const zoomStep = prev < 1 ? 0.1 : 0.25
      const newScale = Math.min(prev + zoomStep, 3.0)
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newScale
    })
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      // More granular zoom steps for better control
      const zoomStep = prev <= 1 ? 0.1 : 0.25
      const newScale = Math.max(prev - zoomStep, 0.25)
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newScale
    })
  }, []);

  // Reset zoom to 100%
  const handleResetZoom = useCallback(() => {
    setScale(1.0)
    setPosition({ x: 0, y: 0 })
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen()
      }
      // Reset scale to 1.0 when entering fullscreen for better viewing
      setScale(1.0)
      setPosition({ x: 0, y: 0 })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  // Reset position when scale is 1
  useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 })
    }
  }, [scale])

  // Add event listeners for mouse up outside the container
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener("mouseup", handleGlobalMouseUp)

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modal when not in fullscreen
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose()
        return
      }

      // Zoom keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        // Prevent browser zoom
        if (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "0") {
          e.preventDefault()
        }

        // Zoom in: Ctrl/Cmd + Plus
        if (e.key === "+" || e.key === "=") {
          handleZoomIn()
        }
        // Zoom out: Ctrl/Cmd + Minus
        else if (e.key === "-") {
          handleZoomOut()
        }
        // Reset zoom: Ctrl/Cmd + 0
        else if (e.key === "0") {
          handleResetZoom()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, handleZoomIn, handleZoomOut, handleResetZoom])

  // Load document data when modal opens
  useEffect(() => {
    if (!isOpen || !documentUrl) return;

    setLoading(true);

    const loadDocument = async () => {
      try {
        // Handle data URLs directly
        if (documentUrl.startsWith("data:")) {
          setPdfData(documentUrl);
          return;
        }

        // Handle blob URLs directly
        if (documentUrl.startsWith("blob:")) {
          setPdfData(documentUrl);
          return;
        }

        // Handle mock URLs for development
        if (documentUrl.startsWith("mock-azure-url://")) {
          setPdfData(documentUrl);
          return;
        }

        // Try to load from localStorage first
        const storedDocuments = localStorage.getItem("userDocumentsContent");
        if (storedDocuments) {
          const documentsContent = JSON.parse(storedDocuments);
          const matchingDoc = Object.values(documentsContent).find(
            (doc: any) => doc.name === documentName
          );

          if (matchingDoc) {
            setPdfData((matchingDoc as any).content);
            return;
          }
        }

        // Try to get Azure file info
        try {
          console.log('Attempting to get file info for URL:', documentUrl);

          // Only attempt to get file info if it looks like an Azure URL
          if (documentUrl.includes('blob.core.windows.net')) {
            console.log('Detected Azure URL, fetching file info');
            const info = await getAzureFileInfo(documentUrl);
            console.log('Azure file info received:', info);
            setFileInfo(info);
          } else {
            // For non-Azure URLs, create a basic info object using client-side parsing
            console.log('Non-Azure URL, parsing client-side');
            const parsedInfo = parseAzureBlobUrl(documentUrl);
            console.log('Client-side parsed info:', parsedInfo);
            setFileInfo({
              url: documentUrl,
              ...parsedInfo
            });
          }
        } catch (infoError) {
          console.error('Error getting file info:', infoError);
          // Set a basic file info object to prevent errors
          setFileInfo({
            isLegacyFormat: true,
            url: documentUrl,
            originalPath: documentUrl
          });
          // Continue with document loading even if metadata retrieval fails
        }

        // If not in localStorage, try to fetch the document
        // Get the full Azure URL if it's a relative path
        const fullUrl = getFullAzureUrl(documentUrl);
        console.log('Fetching document from URL:', fullUrl);

        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        const dataUrl = URL.createObjectURL(blob);
        setPdfData(dataUrl);

      } catch (error) {
        console.error("Error loading document:", error);
        setPdfData(null);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();

    // Cleanup function to revoke object URLs
    return () => {
      if (pdfData?.startsWith("blob:")) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [isOpen, documentUrl, documentName]);

  // Add error state handling in the render
  if (!documentUrl) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Error</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-red-500 text-center">
                Unable to load document. Please try again later.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Apply zoom scale to the iframe
  useEffect(() => {
    if (iframeRef.current && pdfData) {
      const iframeDoc = iframeRef.current
      try {
        iframeDoc.style.transform = `scale(${scale})`
        // In fullscreen mode, we want to center the document
        iframeDoc.style.transformOrigin = isFullscreen ? "center center" : "center top"
      } catch (e) {
        console.warn("Cannot access iframe content", e)
      }
    }
  }, [scale, pdfData, isFullscreen])

  if (!isOpen) return null

  const handleDownload = () => {
    const a = document.createElement("a")
    // Use pdfData if available, otherwise use the full Azure URL
    a.href = pdfData || getFullAzureUrl(documentUrl)
    a.download = documentName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Use standardized image extensions from config
  const imageExtensions = UPLOAD_SETTINGS.FILE_TYPES.IMAGES.map(ext => ext.substring(1)).join('|')
  const imageRegex = new RegExp(`\\.(${imageExtensions})$`, 'i')
  const isImage = documentUrl.match(imageRegex)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={modalRef}
            className={`bg-white rounded-lg ${isFullscreen ? 'max-w-full w-full max-h-full' : 'max-w-4xl w-full max-h-[90vh]'} overflow-hidden flex flex-col shadow-xl transition-all duration-300`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between transition-colors duration-300">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-brand mr-2 transition-colors duration-300" />
                <h2 className={`text-xl font-semibold truncate ${isFullscreen ? 'max-w-[500px]' : 'max-w-[300px]'}`} title={documentName}>
                  {documentName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 transition-all hover:bg-brand-dark hover:text-white"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center transition-all hover:bg-brand-dark hover:text-white"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary-light"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-hidden bg-secondary-light relative transition-colors duration-300">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                </div>
              ) : pdfData ? (
                isImage ? (
                  <div
                    ref={imageContainerRef}
                    className={`w-full h-[75vh] flex items-center justify-center bg-black/5 p-4 ${
                      scale > 1 ? "cursor-grab" : "cursor-default"
                    } ${isDragging ? "cursor-grabbing" : ""} overflow-hidden`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <motion.img
                      src={pdfData}
                      alt={documentName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        transformOrigin: "center center",
                        transition: isDragging ? "none" : "transform 0.2s ease",
                      }}
                      className="rounded-lg"
                      onLoad={() => setLoading(false)}
                      onError={() => {
                        console.error("Error loading image");
                        setPdfData(null);
                      }}
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className={`w-full ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[75vh]'} overflow-hidden flex justify-center items-start bg-secondary transition-colors duration-300`}>
                    <div
                      className={`relative w-full h-full flex justify-center overflow-auto ${isFullscreen ? 'p-4' : 'p-2'}`}
                      onWheel={(e) => {
                        // Prevent default to avoid page scrolling
                        if (e.ctrlKey || e.metaKey) {
                          e.preventDefault();
                          // Zoom in/out with Ctrl/Cmd + mouse wheel
                          if (e.deltaY < 0) {
                            handleZoomIn();
                          } else {
                            handleZoomOut();
                          }
                        }
                      }}
                      onMouseDown={() => scale > 1 && setIsDragging(true)}
                      onMouseMove={(e) => {
                        if (isDragging && scale > 1) {
                          const newX = position.x + e.movementX / scale;
                          const newY = position.y + e.movementY / scale;
                          setPosition({ x: newX, y: newY });
                        }
                      }}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                    >
                      <iframe
                        ref={iframeRef}
                        src={pdfData}
                        title="PDF Preview"
                        style={{
                          width: `${100 / scale}%`,
                          height: `${100 / scale}%`,
                          border: "none",
                          transformOrigin: isFullscreen ? "center center" : "center top",
                          transform: `scale(${scale})`,
                          margin: "0 auto",
                          background: "white",
                          boxShadow: isFullscreen ? "0 4px 30px rgba(0,0,0,0.25)" : "none",
                          transition: isDragging ? "none" : "transform 0.2s ease, box-shadow 0.3s ease",
                          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default"
                        }}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                          console.error("Error loading PDF");
                          setPdfData(null);
                        }}
                      />
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Unable to load document.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setLoading(true);
                        setPdfData(documentUrl);
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-3 bg-secondary border-t border-border flex justify-between items-center transition-colors duration-300">
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-secondary-light rounded-md p-0.5 relative group">
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-foreground text-background text-xs rounded p-1 shadow-lg whitespace-nowrap">
                    <div className="font-medium mb-1">Zoom Shortcuts:</div>
                    <div className="flex flex-col gap-1">
                      <div><span className="font-mono bg-background/20 px-1 rounded">Ctrl + +</span> Zoom in</div>
                      <div><span className="font-mono bg-background/20 px-1 rounded">Ctrl + -</span> Zoom out</div>
                      <div><span className="font-mono bg-background/20 px-1 rounded">Ctrl + 0</span> Reset zoom</div>
                      <div><span className="font-mono bg-background/20 px-1 rounded">Ctrl + Scroll</span> Zoom in/out</div>
                    </div>
                    <div className="absolute top-full left-4 w-2 h-2 -mt-1 rotate-45 bg-foreground"></div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomOut}
                    disabled={scale <= 0.25}
                    className="h-7 w-7 p-0 transition-all hover:bg-secondary-light rounded-l-sm"
                    title="Zoom Out (Ctrl + -)"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={handleResetZoom}
                    className={`text-sm min-w-[50px] text-center transition-colors cursor-pointer px-1 ${scale === 1 ? 'text-brand font-medium' : 'text-muted-foreground hover:text-brand'}`}
                    title="Reset zoom to 100% (Ctrl + 0)"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomIn}
                    disabled={scale >= 3.0}
                    className="h-7 w-7 p-0 transition-all hover:bg-secondary-light rounded-r-sm"
                    title="Zoom In (Ctrl + +)"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fileInfo && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1" title="File information">
                    <Info className="h-3 w-3" />
                    {fileInfo.isLegacyFormat ? (
                      <span>Legacy Format</span>
                    ) : (
                      <>
                        <span>{fileInfo.userType || 'User'}</span>
                        <span>•</span>
                        <span>{fileInfo.fileType || 'File'}</span>
                      </>
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">{isImage ? "Image" : documentType?.toUpperCase() || 'Document'}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}