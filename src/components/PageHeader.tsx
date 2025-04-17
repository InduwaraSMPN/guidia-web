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
    <header className={cn("mb-16", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-8 w-8 text-brand" />}
          <h1 className="text-4xl font-bold text-brand">{title}</h1>
        </div>

        {actions && (
          <div className="flex items-center gap-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
