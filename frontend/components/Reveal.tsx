"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "fade";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms — use for card grids (index * 100). */
  delay?: number;
  /**
   * Entrance style. "up" (default) rises into place; "down" drops in;
   * "left"/"right" slide in from that edge; "scale" grows from 94%;
   * "fade" is opacity-only. Matches the direction implied by its name,
   * same convention as tw-animate's `slide-in-from-*`.
   */
  variant?: RevealVariant;
};

/**
 * Scroll-triggered entrance animation. Pairs with the `[data-reveal]`
 * styles in globals.css: content eases into place the first time it
 * enters the viewport. Respects `prefers-reduced-motion`.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={visible ? "visible" : ""}
      data-reveal-variant={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
