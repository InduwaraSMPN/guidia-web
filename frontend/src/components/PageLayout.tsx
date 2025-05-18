import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

/**
 * Standard page layout component to ensure consistent spacing and structure across pages
 */
export function PageLayout({
  children,
  className,
  fullWidth = false,
  noPadding = false
}: PageLayoutProps) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div
      className={cn(
        "min-h-screen bg-white",
        isAdminPage ? "pt-4 sm:pt-6" : "pt-20 sm:pt-24 md:pt-32", // Adjusted padding for mobile
        className
      )}
    >
      <div
        className={cn(
          "mx-auto",
          !fullWidth && "max-w-[1216px]",
          !noPadding && "px-3 sm:px-6 lg:px-8 pb-16 sm:pb-24 md:pb-32" // Adjusted padding for mobile
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
