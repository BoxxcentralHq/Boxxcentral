import Button from "@/components/Button";
import Container from "@/components/Container";
import { bookingCta, site } from "@/lib/site";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-boxx-line">
      {/* Atmospheric backdrop — replaced by hero photo/video when assets arrive */}
      <div className="absolute inset-0 bg-gradient-to-b from-boxx-coal via-boxx-night to-boxx-night" />
      <div className="absolute -top-1/3 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-boxx-red opacity-[0.08] blur-3xl" />

      <Container className="relative flex min-h-[80vh] flex-col items-center justify-center py-24 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-boxx-red">
          Premium lifestyle &amp; recreation
        </span>
        <h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-tight text-boxx-white sm:text-6xl md:text-7xl">
          {site.tagline}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
          {site.description}
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button href={bookingCta.href}>{bookingCta.label}</Button>
          <Button href="/services" variant="ghost">
            Explore the experiences
          </Button>
        </div>
      </Container>
    </section>
  );
}
