import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-boxx-line bg-boxx-coal px-4 text-sm text-boxx-white outline-none transition-colors duration-200 [color-scheme:dark] selection:bg-boxx-red selection:text-boxx-white placeholder:text-boxx-dim focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
