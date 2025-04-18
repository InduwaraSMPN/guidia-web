// DateDivider component for chat interfaces

interface DateDividerProps {
  date: string;
}

export function DateDivider({ date }: DateDividerProps) {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-secondary-dark dark:bg-secondary-light text-muted-foreground dark:text-muted-foreground text-xs px-4 py-1.5 rounded-full font-medium shadow-sm">
        {date}
      </div>
    </div>
  );
}

export default DateDivider;
