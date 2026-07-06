import Link from "next/link";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { bookingCta, site } from "@/lib/site";
import AtmosphereStrip from "./_components/AtmosphereStrip";
import BrandStatement from "./_components/BrandStatement";
import ExperienceGrid from "./_components/ExperienceGrid";
import VisitUs from "./_components/VisitUs";

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
            <Button asChild size="lg">
              <Link href={bookingCta.href}>{bookingCta.label}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/services">Explore the experiences</Link>
            </Button>
          </>
        }
      />
      <ExperienceGrid />
      <BrandStatement />
      <AtmosphereStrip />
      <VisitUs />
    </>
  );
}
