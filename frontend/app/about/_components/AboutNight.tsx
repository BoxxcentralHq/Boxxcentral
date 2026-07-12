import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

/* TODO: placeholder itinerary copy — tune once opening programming is set */
const steps = [
  {
    title: "Arrive early, train first",
    body: "Beat the crowd with a session at GymBoxx. Shower, change, and step out of the studio straight into the rest of your night.",
  },
  {
    title: "Take the screen",
    body: "Your FilmBoxx session starts when you say it does. Lights down, sound up, and the room belongs to your crowd alone.",
  },
  {
    title: "Settle the score",
    body: "Carry the energy to BowlBoxx. A few frames, a running scoreboard, and at least one friendship briefly on the line.",
  },
  {
    title: "Land in the Lounge",
    body: "Finish where the light is warm. Drinks, small plates, and the slow replay of everything that just happened.",
  },
] as const;

export default function AboutNight() {
  return (
    <section className="border-y border-boxx-line bg-boxx-coal py-24 sm:py-32">
      <Container className="grid items-start gap-12 md:grid-cols-[2fr_3fr] lg:gap-16">
        <Reveal className="md:sticky md:top-28">
          <SectionHeading
            eyebrow="A night here"
            title="How an evening flows"
            lede="There's no fixed route — start anywhere, end anywhere. But if you asked us to plan it, it would look like this."
          />
        </Reveal>
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 100}>
              <li className="flex gap-5 rounded-2xl border border-boxx-line bg-boxx-night p-6 sm:gap-6 sm:p-7">
                <span
                  aria-hidden
                  className="font-heading text-3xl leading-none text-stroke sm:text-4xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading text-lg uppercase tracking-wide text-boxx-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
