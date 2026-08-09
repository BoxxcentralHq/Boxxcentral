import type { Metadata } from "next";
import MenuManager from "./_components/MenuManager";

export const metadata: Metadata = {
  title: "Menu — Admin",
};

export default function AdminMenuPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Menu
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Manage the menu
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        Add, edit, and remove dishes and drinks — changes here are what guests
        see on LoungeBoxx menu.
      </p>

      <div className="mt-8">
        <MenuManager />
      </div>
    </div>
  );
}
