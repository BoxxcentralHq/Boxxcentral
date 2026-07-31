"use client";

import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { useMessagesList } from "@/lib/contact";
import EmptyState from "@/components/EmptyState";

/** Latest contact messages for the overview panel — first page, newest first. */
export default function RecentMessages() {
  const { data, isLoading, isError } = useMessagesList({ page: 1, limit: 5 });
  const messages = data?.messages ?? [];

  if (isLoading) {
    return (
      <p className="px-6 py-10 text-center text-sm text-boxx-dim">Loading…</p>
    );
  }

  if (isError) {
    return (
      <p className="px-6 py-10 text-center text-sm text-boxx-dim">
        Couldn&apos;t load messages.
      </p>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Mail01Icon}
        title="No messages yet"
        description="Contact form enquiries will show up here."
      />
    );
  }

  return (
    <ul>
      {messages.map((m) => (
        <li
          key={m._id}
          className="border-b border-boxx-line/50 px-6 py-5 last:border-0"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-semibold text-boxx-white">
              {!m.read && (
                <span
                  className="size-1.5 shrink-0 rounded-full bg-boxx-red"
                  aria-label="Unread"
                />
              )}
              {m.name}
            </p>
            <span className="shrink-0 text-xs text-boxx-dim">
              {formatDistanceToNowStrict(parseISO(m.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-boxx-red">
            {m.subject || "General enquiry"}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-boxx-mist">
            {m.message}
          </p>
        </li>
      ))}
    </ul>
  );
}
