"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  className,
  inputClassName,
  buttonClassName,
}: {
  placeholders: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAnimation = useCallback(() => {
    // Clear existing interval before starting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders.length]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current); // Clear the interval when the tab is not visible
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation(); // Restart the interval when the tab becomes visible
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders, startAnimation, handleVisibilityChange]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);

    // Use brand color for particles regardless of theme
    const particleColor = "hsl(var(--brand))"; // #800020 - Main burgundy

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = particleColor; // Use dynamic color
    ctx.fillText(value, 16, 40); // Adjust position slightly if needed

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: any[] = [];

    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        // Check alpha channel for pixel presence
        if (pixelData[e + 3]! > 128) { // Check alpha value is > half
          newData.push({
            x: n,
            y: t,
            color: particleColor, // Assign the calculated color to particles
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: color, // Use the string color directly
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: particleColor } = t;
            if (n > pos) {
              ctx.fillStyle = particleColor; // Use particle color
              ctx.fillRect(n, i, s, s); // Use fillRect instead of stroke for solid particles
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only submit if Enter is pressed, not animating, and there's a value
    if (e.key === "Enter" && !animating && value) {
       // Check if onSubmit exists before preventing default and vanishing
       if (onSubmit) {
         // e.preventDefault(); // Prevent default form submission via Enter key ONLY IF onSubmit is defined
         vanishAndSubmit(e.currentTarget.form); // Pass the form element
       }
    }
  };

  const vanishAndSubmit = (form: HTMLFormElement | null) => {
      if (!value || !inputRef.current) return; // Don't animate if no value

    setAnimating(true);
    draw();
    const maxX = newDataRef.current.reduce(
      (prev, current) => (current.x > prev ? current.x : prev),
      0
    );
    requestAnimationFrame(() => animate(maxX)); // Ensure animation starts after drawing

    // Call onSubmit if it exists, passing a synthetic event if needed
    if (onSubmit && form) {
       // Create a synthetic event if needed or just call onSubmit
       // onSubmit expects FormEvent, but we might not have the original event easily here
       // Passing the form itself or a simple object might be enough depending on onSubmit needs
       const syntheticEvent = {
         preventDefault: () => {}, // Provide a dummy preventDefault
         currentTarget: form,
         target: form
       } as unknown as React.FormEvent<HTMLFormElement>;
       onSubmit(syntheticEvent);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission via button click
    vanishAndSubmit(e.currentTarget);
  };

  return (
    <form
      className={cn(
        "w-full relative max-w-xl mx-auto bg-background dark:bg-background h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        className
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left pr-20",
          animating ? "opacity-100" : "opacity-0",
          "z-10"
        )}
        ref={canvasRef}
        aria-hidden="true" // Hide canvas from screen readers
      />
      <input
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange && onChange(e);
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type="text" // Changed to text, use "email" in the demo component if needed
        className={cn(
          "w-full relative text-sm sm:text-base z-50 border-none text-foreground bg-transparent h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20",
          inputClassName,
          animating && "text-transparent dark:text-transparent"
        )}
        aria-label={placeholders[0]} // Add aria-label for accessibility
      />

      <button
        disabled={!value || animating} // Disable button if no value or during animation
        type="submit"
        className={cn(
          "absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full transition-colors duration-300 flex items-center justify-center",
          "bg-brand text-primary-foreground disabled:bg-brand disabled:opacity-70",
          buttonClassName
        )}
        aria-label="Submit" // Add aria-label for accessibility
      >
        {/* Arrow Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "h-4 w-4 transition-all duration-300",
            value ? "text-white" : "text-white" // Always visible with white text
          )}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="13" y1="18" x2="19" y2="12" />
          <line x1="13" y1="6" x2="19" y2="12" />
        </svg>
      </button>

      {/* Animated Placeholder */}
      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none z-40" aria-hidden="true">
        <AnimatePresence mode="wait">
          {!value && !animating && ( // Show placeholder only if no value and not animating
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
              className="w-full text-sm sm:text-base font-normal text-muted-foreground dark:text-muted-foreground pl-4 sm:pl-12 text-left truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

export default PlaceholdersAndVanishInput;
