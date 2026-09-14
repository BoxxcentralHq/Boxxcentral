import type { Metadata } from "next";
import LeaderboardDisplay from "./_components/LeaderboardDisplay";

export const metadata: Metadata = {
  title: "BowlBoxx Leaderboard",
  robots: { index: false },
};

export default function LeaderboardDisplayPage() {
  return <LeaderboardDisplay />;
}
