import { HugeiconsIcon } from "@hugeicons/react";
import {
  Diamond02Icon,
  FavouriteIcon,
  FlashIcon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

/* TODO: placeholder values copy — refine with the client's own words */
const values = [
  {
    icon: Diamond02Icon,
    title: "Premium as standard",
    body: "From the seats to the sound to the service, every detail is chosen like it's the whole experience — because to someone, it is.",
  },
  {
    icon: FavouriteIcon,
    title: "Personal by design",
    body: "A cinema you book for your own crowd, a lounge that learns your order. Nothing here is one-size-fits-all.",
  },
  {
    icon: FlashIcon,
    title: "Energy in every room",
    body: "Four experiences feeding off each other under one roof — the glow of the lanes, the bass of the studio, the hush before the film starts.",
  },
  {
    icon: Location01Icon,
    title: "Rooted in Osogbo",
    body: "Built in Osun State, for Osun State. A world-class night out shouldn't require a trip to Lagos.",
  },
] as const;

export default function AboutValues() {
  return (
    <section className="border-y border-boxx-line bg-boxx-coal py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What we stand for"
            title="The standard behind the name"
            lede="Four rooms, one bar to clear: if it wouldn't impress your most particular friend, it doesn't make it onto the floor."
            align="center"
          />
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 100}>
              <article className="h-full rounded-2xl border border-boxx-line bg-boxx-night p-7">
                <span className="inline-flex size-11 items-center justify-center rounded-xl border border-boxx-line bg-boxx-coal">
                  <HugeiconsIcon
                    icon={value.icon}
                    aria-hidden
                    className="size-5 text-boxx-red"
                  />
                </span>
                <h3 className="mt-5 font-heading text-xl uppercase tracking-wide text-boxx-white">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed">{value.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
