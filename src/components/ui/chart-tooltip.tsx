"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: any, name: string, props: any) => [ReactNode, ReactNode]
  className?: string
  labelClassName?: string
  contentClassName?: string
  labelFormatter?: (label: string) => ReactNode
  itemClassName?: string
  valueClassName?: string
  nameClassName?: string
  children?: ReactNode
  customContent?: (props: any) => ReactNode
}

/**
 * Enhanced tooltip component for charts with improved styling and animations
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  className,
  labelClassName,
  contentClassName,
  labelFormatter,
  itemClassName,
  valueClassName,
  nameClassName,
  children,
  customContent,
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  // If custom content is provided, use it
  if (customContent) {
    return customContent({ active, payload, label })
  }

  // Format the label if a formatter is provided
  const formattedLabel = labelFormatter ? labelFormatter(label || "") : label

  return (
    <div
      className={cn(
        "bg-card border border-border p-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out",
        className
      )}
    >
      {formattedLabel && (
        <div className={cn("font-semibold text-base mb-2", labelClassName)}>{formattedLabel}</div>
      )}
      <div className={cn("space-y-2", contentClassName)}>
        {payload.map((entry, index) => {
          const name = entry.name || ""
          const value = entry.value
          const color = entry.color || entry.stroke || "#888"

          // Use formatter if provided
          const [formattedValue, formattedName] = formatter
            ? formatter(value, name, entry)
            : [value, name]

          return (
            <div key={`item-${index}`} className={cn("flex items-center gap-2", itemClassName)}>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className={cn("text-muted-foreground text-sm", nameClassName)}>
                {formattedName}:
              </span>
              <span className={cn("font-medium", valueClassName)}>{formattedValue}</span>
            </div>
          )
        })}
        {children}
      </div>
    </div>
  )
}

/**
 * Enhanced tooltip component for bar charts with job data
 */
export function JobBarTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const isViewData = "viewCount" in data
  const count = isViewData ? data.viewCount : data.applicationCount
  const iconType = isViewData ? "views" : "applications"

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out">
      <p className="font-semibold text-base mb-1">{data.title}</p>
      <p className="text-sm text-muted-foreground mb-3">{data.companyName}</p>
      <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-md">
        <div className={isViewData ? "bg-brand/10 p-1.5 rounded-full" : "bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-full"}>
          {isViewData ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-brand"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-blue-500 dark:text-blue-400"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
        </div>
        <div>
          <span className="font-medium text-foreground">{count}</span>
          <span className="text-muted-foreground ml-1 text-sm">{iconType}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Enhanced tooltip component for status charts
 */
export function StatusTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const color = payload[0].color || "#888"

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <p className="font-semibold">{data.status}</p>
      </div>
      <div className="bg-muted/40 p-2 rounded-md">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-sm text-muted-foreground">Count:</span>
          <span className="font-medium text-right">{data.count}</span>
          <span className="text-sm text-muted-foreground">Percentage:</span>
          <span className="font-medium text-right">{((data.count / payload[0].payload.total) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Enhanced tooltip component for meeting status charts
 */
export function MeetingStatusTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const color = payload[0].color || "#888"
  const statusKey = "status" in data ? "status" : "meetingType"
  const statusValue = data[statusKey]

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <p className="font-semibold">{statusValue}</p>
      </div>
      <div className="bg-muted/40 p-2 rounded-md">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-sm text-muted-foreground">Count:</span>
          <span className="font-medium text-right">{data.count}</span>
          <span className="text-sm text-muted-foreground">Percentage:</span>
          <span className="font-medium text-right">{((data.count / payload[0].payload.total) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Enhanced tooltip component for meeting schedule charts
 */
export function ScheduleTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const color = payload[0].fill || payload[0].color || "#888"
  const isHourData = "formattedHour" in data
  const timeLabel = isHourData ? data.formattedHour : data.dayOfWeek

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out">
      <p className="font-semibold text-base mb-2">{isHourData ? "Time" : "Day"}: {timeLabel}</p>
      <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-md">
        <div className="bg-brand/10 p-1.5 rounded-full">
          {isHourData ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-blue-500 dark:text-blue-400"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-brand"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          )}
        </div>
        <div>
          <span className="font-medium text-foreground">{data.count}</span>
          <span className="text-muted-foreground ml-1 text-sm">meetings</span>
        </div>
      </div>
    </div>
  )
}
