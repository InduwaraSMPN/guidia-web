import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

/**
 * Standard empty state component with consistent styling
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center bg-secondary/30 rounded-lg",
        className
      )}
    >
      {Icon && (
        <div className="bg-secondary rounded-full p-4 mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      
      <p className="text-muted-foreground text-lg mb-2">{title}</p>
      
      {description && (
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
      )}
      
      {action && (
        <Button 
          onClick={action.onClick} 
          variant="outline" 
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
      
      {children}
    </motion.div>
  );
}
