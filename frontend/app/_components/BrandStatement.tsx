import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";

export default function BrandStatement() {
  return (
    <section className="border-y border-boxx-line bg-boxx-coal py-24 sm:py-32">
      <Container className="text-center">
        <Reveal>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
            Why {site.name}
          </span>
          <blockquote className="mx-auto mt-8 max-w-3xl font-heading text-3xl uppercase leading-snug tracking-wide text-boxx-white sm:text-4xl">
            One address where the whole evening happens
          </blockquote>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed">
            A film with your people, a game that gets loud, a workout that
            counts, and a lounge to land in. Built as a premium destination,{" "}
            {site.name} brings four experiences together so the only decision
            left is where to start.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
