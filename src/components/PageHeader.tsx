import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

/**
 * Standard page header component with consistent styling for title, icon, and actions
 */
export function PageHeader({
  title,
  icon: Icon,
  actions,
  className
}: PageHeaderProps) {
  return (
    <header className={cn("mb-8 sm:mb-12 md:mb-16", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-brand" />}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand">{title}</h1>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
