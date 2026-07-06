import Button from "@/components/Button";
import Container from "@/components/Container";
import { getExperience } from "@/lib/experiences";

const lounge = getExperience("lounge");

/** Warm mood: soft, low glow rising from the bottom — candlelight energy. */
export default function LoungeHero() {
  return (
    <section className="relative overflow-hidden border-b border-boxx-line">
      <div className="absolute inset-0 bg-gradient-to-b from-boxx-night via-boxx-night to-boxx-coal" />
      <div className="absolute -bottom-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-boxx-red opacity-[0.09] blur-3xl" />

      <Container className="relative flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-boxx-red">
          {lounge.kind}
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-boxx-white sm:text-7xl">
          {lounge.name}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">{lounge.tagline}</p>
        <div className="mt-10">
          <Button href="/contact" variant="ghost">
            Find us tonight
          </Button>
        </div>
      </Container>
    </section>
  );
}
