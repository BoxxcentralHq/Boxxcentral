import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import PageHero from "@/components/PageHero";
import Magnetic from "@/components/motion/Magnetic";
import { Button } from "@/components/ui/button";
import { bookingCta, site } from "@/lib/site";
import AtmosphereStrip from "./_components/AtmosphereStrip";
import BrandStatement from "./_components/BrandStatement";
import ExperienceGrid from "./_components/ExperienceGrid";
import VisitUs from "./_components/VisitUs";
import AboutCta from "./about/_components/AboutCta";

export default function HomePage() {
  return (
    <>
      <PageHero
        size="tall"
        eyebrow="Premium lifestyle & recreation"
        title={site.tagline}
        description={site.description}
        videoSrc="/videos/hero.mp4"
        actions={
          <>
            <Magnetic>
              <Button asChild size="lg">
                <Link href={bookingCta.href}>
                  {bookingCta.label}
                  <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">
                  Explore{" "}
                  <span className="hidden md:flex">the experiences</span>
                </Link>
              </Button>
            </Magnetic>
          </>
        }
      />
      <ExperienceGrid />
      <BrandStatement />
      <AtmosphereStrip />
      <VisitUs />
      <AboutCta />
    </>
  );
}
