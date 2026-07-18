import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Staff login",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-16">
      {/* Same atmospheric backdrop language as the marketing heroes */}
      <div className="absolute inset-0 bg-linear-to-b from-boxx-coal via-boxx-night to-boxx-night" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-10">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt={site.name} width={140} height={47} />
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
            Staff access
          </p>
          <h1 className="mt-3 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
            Sign in to the dashboard
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-boxx-mist">
            Bookings, messages, and the day&apos;s schedule — staff only.
          </p>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-boxx-dim">
          Not staff?{" "}
          <Link
            href="/"
            className="text-boxx-mist underline-offset-4 transition-colors duration-200 hover:text-boxx-white hover:underline"
          >
            Back to the site
          </Link>
        </p>
      </div>
    </section>
  );
}
