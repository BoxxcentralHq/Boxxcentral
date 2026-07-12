"use client";

import Link from "next/link";
import { useEffect } from "react";
import StatusScreen from "@/components/StatusScreen";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      eyebrow="Something broke"
      title="Technical foul"
      description="An unexpected error interrupted the experience. Try again — if it keeps happening, we're probably already on it."
      actions={
        <>
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back home</Link>
          </Button>
        </>
      }
    />
  );
}
