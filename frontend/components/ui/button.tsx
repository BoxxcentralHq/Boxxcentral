import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * BoxxCentral button: pill-shaped, loud uppercase type. `default` (solid
 * red + glow) is reserved for the primary CTA; `outline` is the standard
 * secondary action; `ghost` is for quiet chrome like the nav toggle.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-200 ease-(--ease-standard) outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-boxx-red text-boxx-white hover:bg-boxx-red-glow active:bg-boxx-red-deep",
        outline:
          "border border-boxx-line bg-transparent text-boxx-white hover:border-boxx-red hover:text-boxx-white",
        ghost: "text-boxx-mist hover:bg-boxx-slate hover:text-boxx-white",
        link: "text-boxx-red-glow underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-6",
        sm: "h-9 gap-1.5 px-4 text-xs",
        lg: "h-12 gap-2 px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
