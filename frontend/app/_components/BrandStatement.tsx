import Container from "@/components/Container";
import { site } from "@/lib/site";

export default function BrandStatement() {
  return (
    <section className="border-y border-boxx-line bg-boxx-coal py-20 sm:py-24">
      <Container className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-boxx-red">
          Why {site.name}
        </span>
        <blockquote className="mx-auto mt-6 max-w-3xl text-2xl font-semibold leading-snug text-boxx-white sm:text-3xl">
          One address where the whole evening happens — a film with your people,
          a game that gets loud, a workout that counts, and a lounge to land in.
        </blockquote>
        <p className="mx-auto mt-6 max-w-xl leading-relaxed">
          {/* TODO: replace with the client's own brand story copy */}
          Built as a premium destination, {site.name} brings four experiences
          together so the only decision left is where to start.
        </p>
      </Container>
    </section>
  );
}
