import Button from "@/components/Button";
import Container from "@/components/Container";
import { getExperience } from "@/lib/experiences";
import { bookingCta } from "@/lib/site";

const filmboxx = getExperience("filmboxx");

/** Cinematic mood: darkness with a single red "projector" glow from above. */
export default function FilmboxxHero() {
  return (
    <section className="relative overflow-hidden border-b border-boxx-line">
      <div className="absolute inset-0 bg-boxx-night" />
      <div className="absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-boxx-red opacity-[0.12] blur-3xl" />

      <Container className="relative flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-boxx-red">
          {filmboxx.kind}
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-boxx-white sm:text-7xl">
          {filmboxx.name}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">{filmboxx.tagline}</p>
        <div className="mt-10">
          <Button href={bookingCta.href}>Book a private session</Button>
        </div>
        <p className="mt-4 text-xs text-boxx-dim">
          Online booking with Paystack — coming soon
        </p>
      </Container>
    </section>
  );
}
