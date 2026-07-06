import Button from "@/components/Button";
import Container from "@/components/Container";
import { getExperience } from "@/lib/experiences";

const bowlboxx = getExperience("bowlboxx");

/** Playful mood: twin neon-ish red glows like lane lights. */
export default function BowlboxxHero() {
  return (
    <section className="relative overflow-hidden border-b border-boxx-line">
      <div className="absolute inset-0 bg-boxx-night" />
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-boxx-red opacity-[0.1] blur-3xl" />
      <div className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-boxx-red-glow opacity-[0.08] blur-3xl" />

      <Container className="relative flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-boxx-red">
          {bowlboxx.kind}
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-boxx-white sm:text-7xl">
          {bowlboxx.name}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">{bowlboxx.tagline}</p>
        <div className="mt-10">
          <Button href="/contact" variant="ghost">
            Plan a game night
          </Button>
        </div>
      </Container>
    </section>
  );
}
