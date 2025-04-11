

import { useState, useEffect } from "react"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Country {
  name: {
    common: string
    official: string
  }
  cca2: string
  flags: {
    png: string
    svg: string
    alt?: string
  }
}

interface CountrySelectProps {
  onCountryChange?: (country: Country | null) => void
  placeholder?: string
}

export default function CountrySelect({ onCountryChange, placeholder = "Select a country" }: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags")

        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.status}`)
        }

        const data: Country[] = await response.json()
        const sortedCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common))

        setCountries(sortedCountries)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch countries")
        setCountries([])
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    if (onCountryChange) {
      onCountryChange(country)
    }
  }

  const toggleDropdown = () => {
    if (!loading) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="relative w-full font-opensans">
      <button
        type="button"
        onClick={toggleDropdown}
        className={cn(
          "w-full h-[42px] px-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-[#800020]",
          "flex items-center justify-between text-left",
          "dark:bg-gray-800 dark:border-gray-700",
          loading ? "cursor-not-allowed opacity-75" : "cursor-pointer",
          "text-sm"
        )}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading countries...</span>
          </div>
        ) : selectedCountry ? (
          <div className="flex items-center gap-2">
            <img
              src={selectedCountry.flags.svg || "/placeholder.svg"}
              alt={selectedCountry.flags.alt || `Flag of ${selectedCountry.name.common}`}
              className="w-5 h-3.5 object-cover"
            />
            <span>{selectedCountry.name.common}</span>
          </div>
        ) : (
          <span className="block text-sm font-medium text-foreground">{placeholder}</span>
        )}
        <ChevronDown
          className={cn("w-4 h-4 transition-transform duration-200", isOpen ? "transform rotate-180" : "")}
        />
      </button>

      {error && !loading && (
        <div className="mt-1 text-sm text-red-500">{error}. Please try again later.</div>
      )}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
          <div className="sticky top-0 z-10 bg-white p-2 dark:bg-gray-800 border-b border-border dark:border-gray-700">
            <input
              type="text"
              className="w-full h-[42px] px-3 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-[#800020]"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <ul className="py-1 text-sm" role="listbox" aria-labelledby="country-select">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <li
                  key={country.cca2}
                  role="option"
                  aria-selected={selectedCountry?.cca2 === country.cca2}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-secondary-light dark:hover:bg-gray-700",
                    selectedCountry?.cca2 === country.cca2 ? "bg-secondary-light dark:bg-gray-700" : "",
                  )}
                  onClick={() => handleSelectCountry(country)}
                >
                  <img
                    src={country.flags.svg || "/placeholder.svg"}
                    alt={country.flags.alt || `Flag of ${country.name.common}`}
                    className="w-5 h-3.5 object-cover"
                  />
                  <span className="flex-1">{country.name.common}</span>
                  {selectedCountry?.cca2 === country.cca2 && <Check className="w-4 h-4 text-brand" />}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 block text-sm font-medium text-foreground">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}


