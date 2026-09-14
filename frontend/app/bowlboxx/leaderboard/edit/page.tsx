import type { Metadata } from "next";
import Link from "next/link";
import LeaderboardEditor from "./_components/LeaderboardEditor";

export const metadata: Metadata = {
  title: "BowlBoxx Leaderboard — Staff Console",
  robots: { index: false },
};

export default function LeaderboardEditPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-boxx-white">
            BowlBoxx Leaderboard — Staff Console
          </h1>
          <p className="mt-1 text-sm text-boxx-mist">
            Enter scores for either board, then publish it — updating one
            never touches the other. The TV display picks it up within a
            few seconds, wherever it&apos;s running.
          </p>
        </div>
        <Link
          href="/bowlboxx/leaderboard"
          target="_blank"
          className="shrink-0 text-xs font-semibold uppercase tracking-wider text-boxx-red-glow hover:underline"
        >
          Open TV display →
        </Link>
      </div>

      <div className="mt-8 space-y-10">
        <LeaderboardEditor />
      </div>
    </div>
  );
}
