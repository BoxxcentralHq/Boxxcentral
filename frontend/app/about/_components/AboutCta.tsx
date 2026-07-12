import Link from "next/link";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { bookingCta, contact, site } from "@/lib/site";

/** Page closer: one line, two doors — book the cinema or come say hello. */
export default function AboutCta() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Soft red glow rising from below, echoing the hero treatment */}
      <div
        aria-hidden
        className="absolute -bottom-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-boxx-red opacity-[0.08] blur-3xl"
      />
      <Container className="relative text-center">
        <Reveal className="flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
            The rest is yours
          </span>
          <h2 className="mt-6 max-w-3xl font-heading text-4xl uppercase leading-tight tracking-wide text-boxx-white sm:text-5xl">
            Now that you know the story, come write a night into it
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed">
            Book the screen for your people, or just walk in and find us at{" "}
            {contact.address.split(",")[0]} — {site.name} is easy to start and
            hard to leave.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href={bookingCta.href}>{bookingCta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Plan a visit</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
