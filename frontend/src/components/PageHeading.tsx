import { cn } from "@/lib/utils"

interface PageHeadingProps {
  title: string
  subtitle?: string
  className?: string
  action?: React.ReactNode
}

export function PageHeading({ title, subtitle, className, action }: PageHeadingProps) {
  return (
    <div className={cn("max-w-[1216px] mx-auto", className)}>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1 relative">
          <h2 className="text-2xl font-bold text-brand relative inline-block pb-2">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground max-w-3xl">{subtitle}</p>}
        </div>
        {action && (
          <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeading

