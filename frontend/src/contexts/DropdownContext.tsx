import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

type DropdownContextType = {
  activeDropdown: string | null;
  setActiveDropdown: (dropdown: string | null) => void;
  isHoveringDropdown: boolean;
  setIsHoveringDropdown: (isHovering: boolean) => void;
};

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to check if an element or its parents have dropdown attributes
  const isDropdownElement = (element: HTMLElement | null): boolean => {
    let currentElement = element;
    while (currentElement) {
      if (
        currentElement.hasAttribute('data-dropdown-trigger') ||
        currentElement.hasAttribute('data-dropdown-content')
      ) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  };

  // Global click handler to close all dropdowns
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Don't close if the click is on an element with data-dropdown-trigger or data-dropdown-content
      const target = event.target as HTMLElement;

      if (isDropdownElement(target)) {
        // This is a click on a dropdown trigger or content, don't close
        // Also stop propagation to prevent other click handlers from firing
        event.stopPropagation();
        return;
      }

      // If we get here, the click was outside any dropdown trigger or content
      // Close any open dropdown
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    // Add event listener for all clicks
    document.addEventListener('mousedown', handleGlobalClick);

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [activeDropdown]);

  // Global mousemove handler to track when mouse leaves dropdown areas
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!activeDropdown) return; // Only process if a dropdown is open

      const target = event.target as HTMLElement;
      const isOverDropdown = isDropdownElement(target);

      if (isOverDropdown) {
        // Mouse is over a dropdown element
        setIsHoveringDropdown(true);
        // Clear any existing timeout
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
      } else {
        // Mouse is not over a dropdown element
        // Special handling for profile dropdown
        if (activeDropdown === 'profile-dropdown') {
          // For profile dropdown, use a delay
          setIsHoveringDropdown(false);

          // Set timeout to close dropdown after delay
          if (!closeTimeoutRef.current) {
            closeTimeoutRef.current = setTimeout(() => {
              if (!isHoveringDropdown) {
                setActiveDropdown(null);
              }
              closeTimeoutRef.current = null;
            }, 300); // 300ms delay before closing profile dropdown
          }
        } else {
          // For other dropdowns (Events, Meetings), close immediately
          setIsHoveringDropdown(false);
          setActiveDropdown(null);
        }
      }
    };

    // Add event listener for mouse movement
    document.addEventListener('mousemove', handleGlobalMouseMove);

    // Cleanup event listener and timeout
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [activeDropdown, isHoveringDropdown]);

  return (
    <DropdownContext.Provider value={{
      activeDropdown,
      setActiveDropdown,
      isHoveringDropdown,
      setIsHoveringDropdown
    }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (context === undefined) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
}
