import type { Metadata } from "next";
import ExperiencePage from "@/components/ExperiencePage";
import { getMenuItems } from "@/lib/api/server";
import { getExperience } from "@/lib/experiences";
import MenuSection from "./_components/MenuSection";

const lounge = getExperience("lounge");

export const metadata: Metadata = {
  title: "The Lounge",
  description:
    "The Lounge is the warm center of BoxxCentral — drinks, small plates, and conversation.",
};

export default async function LoungePage() {
  const items = await getMenuItems();
  return (
    <>
      <ExperiencePage experience={lounge} />
      <MenuSection items={items ?? []} />
    </>
  );
}
