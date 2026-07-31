import Reveal from "@/components/Reveal";
import OverviewDashboard from "./_components/OverviewDashboard";

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
          Overview
        </p>
        <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
          Today at a glance
        </h1>
      </Reveal>

      <OverviewDashboard />
    </div>
  );
}
