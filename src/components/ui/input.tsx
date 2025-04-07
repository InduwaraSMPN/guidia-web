import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full px-4 py-2.5 rounded-lg border bg-gray-50 focus:outline-none transition-all duration-200",
          {
            "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500": error,
            "border-emerald-300 bg-emerald-50 focus:ring-emerald-500 focus:border-emerald-500": success && !error,
            "border-0 focus:ring-1 focus:ring-[#800020] shadow-xs": !error && !success,
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }


