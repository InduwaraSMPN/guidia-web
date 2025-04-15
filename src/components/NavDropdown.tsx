import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface DropdownItem {
  path: string;
  label: string;
}

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
  className?: string;
}

export function NavDropdown({ label, items, className = "" }: NavDropdownProps) {
  // Add test availability page to meetings dropdown during development
  if (label === 'Meetings') {
    items = [...items, { path: "/test-availability", label: "Test Availability" }];
  }
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Check if any dropdown item is active
  const isActive = items.some(item => location.pathname === item.path);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center px-1 py-2 text-sm font-medium transition-colors duration-200 ${
          isActive ? "text-brand" : "text-foreground hover:text-brand"
        }`}
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown
          className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 mt-1 w-48 bg-card rounded-lg shadow-lg border border-border z-50"
        >
          <div className="py-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 text-sm hover:bg-secondary transition-colors ${
                  location.pathname === item.path
                    ? "text-brand font-medium"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Mobile version of the dropdown for the mobile menu
export function MobileNavDropdown({ label, items }: NavDropdownProps) {
  // Add test availability page to meetings dropdown during development
  if (label === 'Meetings') {
    items = [...items, { path: "/test-availability", label: "Test Availability" }];
  }
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Check if any dropdown item is active
  const isActive = items.some(item => location.pathname === item.path);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full py-3 text-sm font-medium transition-colors ${
          isActive ? "text-brand" : "text-foreground hover:text-brand"
        }`}
      >
        <span>{label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="pl-4 space-y-1 border-l border-border"
        >
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block py-2 text-sm transition-colors ${
                location.pathname === item.path
                  ? "text-brand font-medium"
                  : "text-foreground hover:text-brand"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
