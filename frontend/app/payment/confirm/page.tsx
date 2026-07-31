import type { Metadata } from "next";
import { Suspense } from "react";
import Reveal from "@/components/Reveal";
import PaymentStatus from "./_components/PaymentStatus";

export const metadata: Metadata = {
  title: "Payment status",
  robots: { index: false },
};

export default function PaymentConfirmPage() {
  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-16">
      <div className="absolute inset-0 bg-linear-to-b from-boxx-coal via-boxx-night to-boxx-night" />
      <Reveal className="relative w-full">
        <Suspense fallback={null}>
          <PaymentStatus />
        </Suspense>
      </Reveal>
    </section>
  );
}
