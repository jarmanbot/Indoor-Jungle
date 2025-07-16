import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        // PWA-specific mobile input attributes
        autoComplete="off"
        autoCapitalize="words"
        autoCorrect="off"
        spellCheck="false"
        inputMode={type === "number" ? "numeric" : "text"}
        enterKeyHint="done"
        // Critical for PWA keyboard display
        readOnly={false}
        onTouchStart={(e) => {
          // Ensure input becomes active on PWA
          if (e.currentTarget) {
            e.currentTarget.focus();
          }
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
