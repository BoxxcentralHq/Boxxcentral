import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** primary = solid brand red (the commercial CTA), ghost = outlined. */
  variant?: "primary" | "ghost";
  className?: string;
};

const base =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200";

const variants = {
  primary: "bg-boxx-red text-boxx-white hover:bg-boxx-red-deep",
  ghost:
    "border border-boxx-line text-boxx-white hover:border-boxx-red hover:text-boxx-red-glow",
} as const;

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
