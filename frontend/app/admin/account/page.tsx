import type { Metadata } from "next";
import AccountManager from "./_components/AccountManager";

export const metadata: Metadata = {
  title: "Account — Admin",
};

export default function AdminAccountPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Account
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Your account
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        Update your password, and — if you&apos;re a super admin — manage
        who else has staff access.
      </p>

      <div className="mt-8">
        <AccountManager />
      </div>
    </div>
  );
}
