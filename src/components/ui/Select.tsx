

import { useState, useEffect } from "react"
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

  return (
    <div className="relative w-full font-opensans">
      <button
        type="button"
        onClick={toggleDropdown}
        className={cn(
          "w-full h-[42px] px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#800020]",
          "flex items-center justify-between text-left",
          "dark:bg-gray-800 dark:border-gray-700",
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
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown
          className={cn("w-4 h-4 transition-transform duration-200", isOpen ? "transform rotate-180" : "")}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
          {isSearchable && (
            <div className="sticky top-0 z-10 bg-white p-2 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
              <input
                type="text"
                className="w-full h-[42px] px-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#800020] dark:bg-gray-800 dark:border-gray-700"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <ul className="py-1 text-sm" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value?.value === option.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                    value?.value === option.value ? "bg-gray-100 dark:bg-gray-700" : ""
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.label}</span>
                  {value?.value === option.value && <Check className="w-4 h-4 text-[#800020]" />}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}