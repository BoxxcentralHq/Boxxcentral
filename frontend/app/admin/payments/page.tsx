import type { Metadata } from "next";
import PaymentsManager from "./_components/PaymentsManager";
import RevenueOverview from "./_components/RevenueOverview";

export const metadata: Metadata = {
  title: "Payments — Admin",
};

export default function AdminPaymentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Payments
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Ledger &amp; revenue
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        Every inflow and refund the payment gateway has reported, plus the
        last six months of revenue.
      </p>

      <div className="mt-8 rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-8">
        <RevenueOverview />
      </div>

      <div className="mt-10">
        <PaymentsManager />
      </div>
    </div>
  );
}
