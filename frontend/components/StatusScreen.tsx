import type { ReactNode } from "react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";

type StatusScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions: ReactNode;
};

/** Full-height branded screen for status routes (404, error boundary). */
export default function StatusScreen({
  eyebrow,
  title,
  description,
  actions,
}: StatusScreenProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-boxx-coal via-boxx-night to-boxx-night" />

      <Container className="relative flex min-h-[72svh] flex-col items-center justify-center py-24 text-center">
        <Reveal className="flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
            {eyebrow}
          </span>
          <h1 className="mt-6 max-w-4xl font-heading text-6xl uppercase leading-[1.05] tracking-wide text-boxx-white sm:text-8xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-boxx-mist sm:text-lg">
            {description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {actions}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
