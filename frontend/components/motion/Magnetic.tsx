"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

type MagneticProps = {
  children: React.ReactNode;
  /** Fraction of the cursor offset the element chases (0–1). */
  strength?: number;
  className?: string;
};

/**
 * Cursor-magnetic morph: while the pointer is over the wrapper, the child
 * is pulled toward the cursor on springs, swells slightly, and tilts in the
 * pull direction — then snaps elastically back to rest on leave.
 * Pointer-less and reduced-motion users get the child untouched.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  /* Raw cursor offset from the element's centre, in px. */
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 14, mass: 0.4 };

  /* Chase the cursor at a fraction of the offset. */
  const x = useSpring(
    useTransform(offsetX, (v) => v * strength),
    springConfig,
  );
  const y = useSpring(
    useTransform(offsetY, (v) => v * strength),
    springConfig,
  );

  /* Morph: swell with pull distance, tilt with horizontal pull. */
  const distance = useTransform(() =>
    Math.hypot(offsetX.get(), offsetY.get()),
  );
  const scale = useSpring(
    useTransform(distance, [0, 140], [1, 1.08]),
    springConfig,
  );
  const rotate = useSpring(
    useTransform(offsetX, [-140, 140], [-4, 4]),
    springConfig,
  );

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    offsetX.set(e.clientX - (rect.left + rect.width / 2));
    offsetY.set(e.clientY - (rect.top + rect.height / 2));
  }

  function handlePointerLeave() {
    offsetX.set(0);
    offsetY.set(0);
  }

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x, y, scale, rotate }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.div>
  );
}
