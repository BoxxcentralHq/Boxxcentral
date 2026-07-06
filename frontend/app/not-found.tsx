import type { Metadata } from "next";
import Link from "next/link";
import StatusScreen from "@/components/StatusScreen";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <StatusScreen
      eyebrow="Error 404"
      title="Wrong boxx"
      description="The page you're looking for doesn't exist or has moved. Head back home and find your experience from there."
      actions={
        <>
          <Button asChild size="lg">
            <Link href="/">Back home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">Explore services</Link>
          </Button>
        </>
      }
    />
  );
}
