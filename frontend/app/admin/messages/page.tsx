import type { Metadata } from "next";
import MessagesManager from "./_components/MessagesManager";

export const metadata: Metadata = {
  title: "Messages — Admin",
};

export default function AdminMessagesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Messages
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Inbox
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-boxx-mist">
        Enquiries from the contact form. Open a message to read it in full
        and reply on the guest&apos;s channel.
      </p>

      <div className="mt-8">
        <MessagesManager />
      </div>
    </div>
  );
}
