import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import type { PricingGroup } from "@/lib/pricing";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;
const staggerDelay = (i: number) => Math.min(i, 8) * 60;

/** Static price-card grid for a service — see lib/pricing.ts for the data. */
export default function PricingSection({
  eyebrow,
  title,
  lede,
  plans,
  addOn,
}: PricingGroup) {
  return (
    <section className="border-t border-boxx-line py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} lede={lede} />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={staggerDelay(i)}>
              <div className="flex h-full flex-col rounded-2xl border border-boxx-line bg-boxx-coal p-6">
                <h3 className="font-heading text-lg tracking-wide text-boxx-white uppercase">
                  {plan.name}
                </h3>
                <p className="mt-3 font-heading text-3xl text-boxx-red-glow">
                  {naira(plan.price)}
                  {plan.unit && (
                    <span className="ml-1.5 font-sans text-sm font-normal tracking-normal text-boxx-dim normal-case">
                      {plan.unit}
                    </span>
                  )}
                </p>
                {plan.note && (
                  <p className="mt-2 text-sm text-boxx-dim">{plan.note}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {addOn && <p className="mt-6 text-sm text-boxx-dim">{addOn}</p>}
      </Container>
    </section>
  );
}
