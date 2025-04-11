import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
interface MultipleInputProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
  allowDuplicates?: boolean;
  maxItems?: number;
  className?: string;
  inputClassName?: string;
}
export function MultipleInput({
  items,
  onItemsChange,
  placeholder = "Add item",
  allowDuplicates = false,
  maxItems,
  className = "",
  inputClassName = "",
}: MultipleInputProps) {
  const [inputValue, setInputValue] = useState("");
  const handleAddItem = () => {
    if (!inputValue.trim()) return;
    const newItem = inputValue.trim();
    if (!allowDuplicates && items.includes(newItem)) {
      return;
    }
    if (maxItems && items.length >= maxItems) {
      return;
    }
    onItemsChange([...items, newItem]);
    setInputValue("");
  };
  const handleRemoveItem = (itemToRemove: string) => {
    onItemsChange(items.filter((item) => item !== itemToRemove));
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };
  return (
    <div className={`space-y-3 ${className}`}>
      {" "}
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center bg-secondary-light rounded-md px-3 py-1.5 text-sm text-foreground h-[44px]"
          >
            {" "}
            <span>{item}</span>
            <button
              type="button"
              onClick={() => handleRemoveItem(item)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              {" "}
              <X className="h-3 w-3" />
            </button>{" "}
          </div>
        ))}
        <div className="flex">
          {" "}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`mr-1 h-[44px] min-w-[15rem] max-w-[20rem] rounded-md ${inputClassName}`}
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center justify-center h-[44px] w-[44px] text-brand"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>{" "}
    </div>
  );
}


