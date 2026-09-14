"use client";

import { useLeaderboard } from "@/lib/leaderboard";
import BoardEditor from "./BoardEditor";
import BoardEditorSkeleton from "./skeletons/BoardEditorSkeleton";

export default function LeaderboardEditor() {
  const { data, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <>
        <BoardEditorSkeleton heading="6-Frame Challenge" />
        <BoardEditorSkeleton heading="10-Frame Challenge" />
      </>
    );
  }

  return (
    <>
      <BoardEditor
        heading="6-Frame Challenge"
        slug="six-frame"
        defaultSubtitle="6-FRAME CHALLENGE"
        board={data?.sixFrame}
      />
      <BoardEditor
        heading="10-Frame Challenge"
        slug="ten-frame"
        defaultSubtitle="10-FRAME CHALLENGE"
        board={data?.tenFrame}
      />
    </>
  );
}
