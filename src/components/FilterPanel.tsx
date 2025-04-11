import { X, Filter, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { Drawer } from "vaul"
import { useState, useEffect } from "react"

export interface FilterSection {
  title: string
  items: string[]
  selectedItems: string[]
  onChange: (value: string) => void
}

interface FilterPanelProps {
  sections: FilterSection[]
  onClose: () => void
  onClearAll: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function FilterPanel({ sections, onClose, onClearAll, isOpen, setIsOpen }: FilterPanelProps) {
  // Count total active filters
  const activeFiltersCount = sections.reduce((count, section) => count + section.selectedItems.length, 0)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    sections.reduce((acc, section) => ({ ...acc, [section.title]: true }), {}),
  )

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const [contentHeight, setContentHeight] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Add a small buffer (80px) for padding and to avoid exact fitting
        setContentHeight(entry.contentRect.height + 80)
      }
    })

    const contentElement = document.getElementById("filter-panel-content")
    if (contentElement) {
      resizeObserver.observe(contentElement)
    }

    return () => {
      if (contentElement) {
        resizeObserver.unobserve(contentElement)
      }
    }
  }, [isOpen])

  // Add effect to handle body scroll lock and navigation bar styling
  useEffect(() => {
    const navElement = document.querySelector("nav") || document.querySelector("header")

    if (isOpen) {
      // Lock body scroll when drawer is open
      document.body.style.overflow = "hidden"

      // Apply desaturation to navigation if it exists
      if (navElement) {
        navElement.style.filter = "saturate(0.85) brightness(0.95)"
        navElement.style.transition = "filter 0.3s ease"
      }
    } else {
      // Restore body scroll when drawer is closed
      document.body.style.overflow = ""

      // Remove desaturation from navigation
      if (navElement) {
        navElement.style.filter = ""
      }
    }

    return () => {
      document.body.style.overflow = ""
      if (navElement) {
        navElement.style.filter = ""
      }
    }
  }, [isOpen])

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-[45] transition-all duration-300"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />
        <Drawer.Content
          style={{
            height: contentHeight ? `${Math.min(contentHeight, window.innerHeight * 0.85)}px` : "auto",
            maxHeight: "85vh",
          }}
          className="bg-card flex flex-col rounded-t-[20px] mt-24 fixed bottom-0 left-0 right-0 z-[46] shadow-xl border-t border-border"
        >
          <Drawer.Title className="sr-only">Filter Options</Drawer.Title>
          <Drawer.Description className="sr-only">
            Panel for selecting and applying filters to the current view
          </Drawer.Description>

          <div className="p-3 bg-card rounded-t-[20px] flex-1 overflow-auto">
            {/* Improved drag handle with subtle animation */}
            <div className="flex justify-center mb-3">
              <motion.div
                className="w-12 h-1.5 flex-shrink-0 rounded-full bg-muted"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
            </div>

            {/* Enhanced header with better visual hierarchy */}
            <div className="px-4 py-2 flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <Filter className="h-5 w-5 text-brand" />
                <h2 className="font-semibold text-foreground text-xl">Filters</h2>
                {activeFiltersCount > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ml-1.5 bg-brand text-white text-xs font-medium rounded-full px-2.5 py-1"
                  >
                    {activeFiltersCount}
                  </motion.div>
                )}
              </div>
              <motion.button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-2.5 rounded-full hover:bg-muted/80 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close filter panel"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Content area with improved spacing and visual grouping */}
            <div
              id="filter-panel-content"
              className="px-6 pb-4 max-h-[calc(70vh-120px)] overflow-y-auto custom-scrollbar"
            >
              <AnimatePresence>
                {sections
                  .filter((section) => section.items.length > 0)
                  .map((section, index, filteredSections) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07, duration: 0.3 }}
                      className={`${index < filteredSections.length - 1 ? "mb-5 pb-5 border-b border-border" : ""}`}
                    >
                      <motion.button
                        onClick={() => toggleSection(section.title)}
                        className="flex justify-between items-center w-full mb-3 group"
                        whileHover={{ x: 2 }}
                        aria-expanded={expandedSections[section.title]}
                        aria-controls={`section-${section.title}`}
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-sm text-foreground uppercase tracking-wider">
                            {section.title}
                          </h3>
                          {section.selectedItems.length > 0 && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-brand font-medium"
                            >
                              {section.selectedItems.length} selected
                            </motion.span>
                          )}
                        </div>
                        <motion.div
                          animate={{ rotate: expandedSections[section.title] ? 180 : 0 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                          className="text-muted-foreground group-hover:text-foreground"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {expandedSections[section.title] && (
                          <motion.div
                            id={`section-${section.title}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-3 pl-2">
                              {section.items.map((item, itemIndex) => (
                                <motion.div
                                  key={item}
                                  className="flex items-center space-x-3.5 group bg-muted/30 rounded-md px-2 py-1.5"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: itemIndex * 0.03, duration: 0.2 }}
                                  whileHover={{ y: -2 }}
                                >
                                  <Checkbox
                                    id={`${section.title}-${item}`}
                                    checked={section.selectedItems.includes(item)}
                                    onCheckedChange={() => section.onChange(item)}
                                    className="data-[state=checked]:bg-brand hover:border-brand data-[state=checked]:border-brand h-4.5 w-4.5 rounded-sm"
                                  />
                                  <Label
                                    htmlFor={`${section.title}-${item}`}
                                    className="text-sm font-normal cursor-pointer text-muted-foreground leading-tight group-hover:text-brand transition-colors"
                                  >
                                    {item}
                                  </Label>
                                  {section.selectedItems.includes(item) && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="ml-auto"
                                    >
                                      <Check className="h-3.5 w-3.5 text-brand" />
                                    </motion.div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
              </AnimatePresence>

              {/* Enhanced empty state with better visual feedback */}
              {sections.every((section) => section.items.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="py-16 text-center"
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-5"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                  >
                    <Filter className="h-8 w-8 text-muted-foreground" />
                  </motion.div>
                  <h4 className="text-foreground font-medium text-lg mb-2">No filters available</h4>
                  <p className="text-muted-foreground dark:text-neutral-400 text-sm max-w-xs mx-auto">
                    Try changing your search criteria or check back later
                  </p>
                </motion.div>
              )}
            </div>

            {/* Sticky footer with applied filters summary and actions */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.div
                  className="sticky bottom-0 left-0 right-0 p-5 bg-card border-t border-border mt-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {activeFiltersCount} {activeFiltersCount === 1 ? "filter" : "filters"} applied
                      </span>
                      <p className="text-xs text-muted-foreground dark:text-neutral-400 mt-1">Showing filtered results</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearAll}
                        className="text-xs hover:border-brand hover:bg-brand-dark hover:text-white transition-colors"
                      >
                        Clear All
                      </Button>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          size="sm"
                          onClick={onClose}
                          className="text-xs bg-brand hover:bg-brand-dark text-white px-5"
                        >
                          Apply Filters
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom scrollbar styles are defined in index.css */}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

