import * as React from "react"
import { cn } from "cn"
import { Tooltip as TooltipPrimitive } from "radix-ui"

function Tooltip({ children, label, side = "top", className }: { children: React.ReactNode; label: string; side?: "top" | "bottom"; className?: string }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span className={cn("inline-flex", className)}>{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              "z-50 rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            )}
          >
            {label}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export { Tooltip }
