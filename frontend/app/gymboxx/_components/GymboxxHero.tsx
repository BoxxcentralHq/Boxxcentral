import Button from "@/components/Button";
import Container from "@/components/Container";
import { getExperience } from "@/lib/experiences";

const gymboxx = getExperience("gymboxx");

/** Kinetic mood: hard left-aligned type, sharp red edge instead of soft glow. */
export default function GymboxxHero() {
  return (
    <section className="relative overflow-hidden border-b border-boxx-line">
      <div className="absolute inset-0 bg-gradient-to-r from-boxx-coal to-boxx-night" />
      <div className="absolute inset-y-0 left-0 w-1.5 bg-boxx-red" />

      <Container className="relative flex min-h-[60vh] flex-col justify-center py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-boxx-red">
          {gymboxx.kind}
        </span>
        <h1 className="mt-5 text-5xl font-bold uppercase tracking-tight text-boxx-white sm:text-7xl">
          {gymboxx.name}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">{gymboxx.tagline}</p>
        <div className="mt-10">
          <Button href="/contact" variant="ghost">
            Ask about membership
          </Button>
        </div>
      </Container>
    </section>
  );
}
