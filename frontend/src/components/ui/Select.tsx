

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
}

interface SelectProps {
  options: Option[]
  value?: Option | null
  onChange?: (option: Option | null) => void
  placeholder?: string
  isSearchable?: boolean
  isLoading?: boolean
  disabled?: boolean
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  isSearchable = true,
  isLoading = false,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (option: Option) => {
    if (onChange) {
      onChange(option)
    }
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    if (!disabled && !isLoading) {
      setIsOpen(!isOpen)
    }
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleResize = () => {
      // Force re-render to update dropdown position
      if (isOpen) {
        setIsOpen(false)
        setTimeout(() => setIsOpen(true), 0)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("resize", handleResize)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", handleResize)
    }
  }, [isOpen])

  return (
    <div ref={selectRef} className="relative w-full font-opensans">
      <button
        type="button"
        onClick={toggleDropdown}
        className={cn(
          "w-full h-[42px] px-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-brand",
          "flex items-center justify-between text-left",
          "bg-white text-foreground dark:bg-card dark:text-card-foreground",
          disabled || isLoading ? "cursor-not-allowed opacity-75" : "cursor-pointer",
          "text-sm"
        )}
        disabled={disabled || isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : value ? (
          <span>{value.label}</span>
        ) : (
          <span className="text-muted-foreground dark:text-neutral-400">{placeholder}</span>
        )}
        <ChevronDown
          className={cn("w-4 h-4 transition-transform duration-200", isOpen ? "transform rotate-180" : "")}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-card border border-border rounded-md shadow-lg max-h-[200px] overflow-y-auto"
             style={{
               // Check if dropdown would go off the bottom of the viewport
               top: selectRef.current && selectRef.current.getBoundingClientRect().bottom + 200 > window.innerHeight
                 ? // Position above the select if it would go off the bottom
                   `-${200 + selectRef.current.offsetHeight}px`
                 : // Otherwise position below the select
                   `${selectRef.current?.offsetHeight || 0}px`
             }}>
          {isSearchable && (
            <div className="sticky top-0 z-20 bg-white dark:bg-card p-2 border-b border-border">
              <input
                type="text"
                className="w-full h-[42px] px-3 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-brand bg-white dark:bg-card text-foreground dark:text-card-foreground"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <ul className="py-1 text-sm text-foreground dark:text-card-foreground" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value?.value === option.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-secondary hover:text-brand dark:hover:text-foreground transition-colors duration-200",
                    value?.value === option.value ? "bg-secondary text-brand dark:text-foreground" : ""
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <span className="font-medium">{option.label}</span>
                  {value?.value === option.value && <Check className="w-4 h-4 text-brand dark:text-foreground transition-colors duration-200" />}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-muted-foreground">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

