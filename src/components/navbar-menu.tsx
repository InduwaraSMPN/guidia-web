"use client"
import React, { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Link as RouterLink } from "react-router-dom"
import { useDropdown } from "../contexts/DropdownContext"

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
}

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  preview,
  isRouteActive = false, // New prop to indicate if the route is active
}: {
  setActive: (item: string | null) => void
  active: string | null
  item: string
  children?: React.ReactNode
  preview?: React.ReactNode
  isRouteActive?: boolean // New prop to indicate if the route is active
}) => {
  const menuItemRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isHoveringDropdown, setIsHoveringDropdown } = useDropdown();

  // Handle mouse enter on the menu item
  const handleMouseEnter = () => {
    // This will close any other open dropdown and open this one
    setActive(item);
  };

  // Handle mouse leave on the menu item
  const handleMouseLeave = () => {
    // We don't close immediately - let the parent Menu component handle this
    // This allows the user to move to the dropdown
  };

  // Handle click on the menu item
  const handleClick = (e: React.MouseEvent) => {
    // Toggle dropdown on click
    if (active === item) {
      e.stopPropagation(); // Prevent event from bubbling up
      setActive(null);
    } else {
      e.stopPropagation(); // Prevent event from bubbling up
      // Close any other open dropdown and open this one
      setActive(item);
    }
  };

  // Handle mouse enter on the dropdown
  const handleDropdownMouseEnter = () => {
    setIsHoveringDropdown(true);
    // Keep the dropdown open when hovering over it
    setActive(item);
  };

  // Handle mouse leave on the dropdown
  const handleDropdownMouseLeave = () => {
    setIsHoveringDropdown(false);
    // Let the parent Menu component handle closing with a delay
  };

  // Create a path between the menu item and dropdown for smoother hover
  const createHoverPath = () => {
    if (active === item || isHoveringDropdown) {
      return (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 h-8 w-16 top-full z-40"
          onMouseEnter={() => setActive(item)}
        />
      );
    }
    return null;
  };

  // Determine if this item is active for styling purposes
  // This handles both the dropdown being open (active === item) and the route being active
  const isActiveItem = active === item || isRouteActive;

  return (
    <div
      ref={menuItemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <motion.p
        onClick={handleClick}
        transition={{ duration: 0.3 }}
        data-dropdown-trigger={item}
        className={`cursor-pointer px-0 py-1 flex items-center h-[28px] ${isActiveItem ? 'text-brand ' : 'text-foreground hover:text-brand dark:text-white'}`}
      >
        {item}
      </motion.p>

      {/* Invisible hover path between menu item and dropdown */}
      {createHoverPath()}

      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div
              ref={dropdownRef}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
              className="absolute top-[calc(100%_+_0.5rem)] left-1/2 transform -translate-x-1/2 pt-2 z-50"
              data-dropdown-content={item}
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside dropdown from closing it
            >
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-card dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-border dark:border-white/[0.2] shadow-xl"
              >
                {preview ? (
                  <div className="flex">
                    <div className="w-64 p-4 border-r border-border">
                      {children}
                    </div>
                    <div className="w-80 p-4">
                      {preview}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    layout // layout ensures smooth animation
                    className="w-max h-full p-4"
                  >
                    {children}
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void
  children: React.ReactNode
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const { isHoveringDropdown: isHovering, setIsHoveringDropdown: setIsHovering } = useDropdown();
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLElement>(null);

  // Update the active item and clear any existing timeout
  const handleSetActive = (item: string | null) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    setIsLeaving(false);
    setActiveItem(item);
    setActive(item);
  };

  // Handle mouse enter on the menu
  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsLeaving(false);

    // Clear any existing timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  // Handle mouse leave with a delay
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsLeaving(true);

    // Set a timeout to close the dropdown after a delay
    leaveTimeoutRef.current = setTimeout(() => {
      if (isLeaving && !isHovering) {
        setActiveItem(null);
        setActive(null);
      }
    }, 300); // 300ms delay before closing
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveItem(null);
        setActive(null);
      }
    };

    // Add event listener for all clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setActive]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave} // This will close the dropdown when mouse leaves the entire menu
      className="relative shadow-input flex justify-center items-center space-x-8 w-full"
    >
      {Array.isArray(children)
        ? children.map((child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                key: index,
                setActive: handleSetActive,
                active: activeItem,
              });
            }
            return child;
          })
        : children
      }
    </nav>
  )
}

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string
  description: string
  href: string
  src: string
}) => {
  return (
    <RouterLink to={href} className="flex space-x-2">
      <img
        src={src || "/placeholder.svg"}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl  mb-1 text-foreground dark:text-white">{title}</h4>
        <p className="text-muted-foreground text-sm max-w-[10rem] dark:text-neutral-300">{description}</p>
      </div>
    </RouterLink>
  )
}

export const EventItem = ({
  title,
  date,
  href,
  src,
  type,
}: {
  title: string
  date: string
  href: string
  src: string
  type: "upcoming" | "past"
}) => {
  return (
    <RouterLink
      to={href}
      className="flex space-x-2 group transition-all duration-300 hover:bg-secondary/50 p-2 rounded-lg"
      onClick={(e) => e.stopPropagation()} // Prevent the dropdown from closing when clicking a link
    >
      <img
        src={src || "/placeholder.svg"}
        width={140}
        height={70}
        alt={title}
        className={`flex-shrink-0 rounded-md shadow-md ${type === "past" ? "grayscale" : ""}`}
      />
      <div>
        <h4 className="text-base font-medium mb-1 text-foreground dark:text-white group-hover:text-brand transition-colors">{title}</h4>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="inline-block w-3 h-3 mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </span>
          <span>{date}</span>
        </div>
        <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${type === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
          {type === "upcoming" ? "Upcoming" : "Past"}
        </span>
      </div>
    </RouterLink>
  )
}

export const HoveredLink = ({ children, href, isActive, ...rest }: any) => {
  return (
    <RouterLink
      to={href}
      {...rest}
      className={`block py-2 px-1 ${isActive ? 'text-brand ' : 'text-muted-foreground dark:text-neutral-200'} hover:text-brand transition-colors rounded-md`}
      onClick={(e) => e.stopPropagation()} // Prevent the dropdown from closing when clicking a link
    >
      {children}
    </RouterLink>
  )
}

