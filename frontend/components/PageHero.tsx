"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import Container from "@/components/Container";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  note?: string;
  videoSrc?: string;
  poster?: string;
  align?: "center" | "left";
  size?: "tall" | "standard";
};

/** Orchestrated entrance: children cascade in on springs, blur-to-sharp. */
const cascade: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 42, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 80, damping: 18 },
  },
};

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  note,
  videoSrc,
  poster,
  align = "center",
  size = "standard",
}: PageHeroProps) {
  const centered = align === "center";
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  /*
   * Scroll choreography — progress runs from the hero pinned at the top of
   * the viewport until it has scrolled away entirely.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* Media sinks slower than the page and swells — reads as depth. */
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  /* Copy drifts up faster and dissolves before the hero is gone. */
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-32%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-boxx-line"
    >
      {/* Atmospheric backdrop — parallax layer under the static scrims */}
      <motion.div
        style={reduceMotion ? undefined : { y: mediaY, scale: mediaScale }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-linear-to-b from-boxx-coal via-boxx-night to-boxx-night" />
        {videoSrc && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        )}
      </motion.div>

      {/* Contrast scrim over the media */}
      <div className="absolute inset-0 bg-boxx-night/70" />
      <div className="absolute inset-0 bg-linear-to-t from-boxx-night via-transparent to-boxx-night/40" />

      <Container
        className={cn(
          "relative flex flex-col justify-center pb-20 pt-30",
          size === "tall" ? "min-h-svh" : "min-h-[64svh]",
          centered ? "items-center text-center" : "items-start text-left",
        )}
      >
        <motion.div
          variants={reduceMotion ? undefined : cascade}
          initial="hidden"
          animate="show"
          style={
            reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }
          }
          className={cn(
            "flex flex-col",
            centered ? "items-center" : "items-start",
          )}
        >
          <motion.span
            variants={rise}
            className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red"
          >
            {eyebrow}
          </motion.span>
          <motion.h1
            variants={rise}
            className="mt-6 max-w-4xl font-heading text-5xl uppercase leading-[1.05] tracking-wide text-boxx-white sm:text-7xl lg:text-[5.5rem]"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              variants={rise}
              className="mt-6 max-w-xl text-base leading-relaxed text-boxx-mist sm:text-lg"
            >
              {description}
            </motion.p>
          )}
          {actions && (
            <motion.div
              variants={rise}
              className={cn(
                "mt-10 flex flex-row gap-4",
                centered && "items-center justify-center",
              )}
            >
              {actions}
            </motion.div>
          )}
          {note && (
            <motion.p variants={rise} className="mt-5 text-xs text-boxx-dim">
              {note}
            </motion.p>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
