"use client";

import { useState } from "react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Call02Icon,
  Delete02Icon,
  Mail01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import Reveal from "@/components/Reveal";
import { toast, toastApiError } from "@/lib/api/toast";
import type { ContactMessage } from "@/lib/api/types";
import {
  useDeleteMessage,
  useMarkMessageRead,
  useMessagesList,
} from "@/lib/contact";
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

const PAGE_SIZE = 10;

/** wa.me needs digits only (no +, spaces). */
const waNumber = (phone: string) => phone.replace(/\D/g, "");

/** One inline reply action under an expanded message. */
function ReplyAction({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="inline-flex items-center gap-2 rounded-full border border-boxx-line px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white"
    >
      {children}
    </a>
  );
}

/** Contact-form inbox, wired to the real /contact endpoints. */
export default function MessagesManager() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useMessagesList({
    page,
    limit: PAGE_SIZE,
    unread: filter === "unread" ? true : undefined,
  });
  // Just the count for whichever tab isn't currently active.
  const { data: otherCount } = useMessagesList({
    limit: 1,
    unread: filter === "unread" ? undefined : true,
  });

  const markRead = useMarkMessageRead();
  const deleteMessage = useDeleteMessage();

  const messages = data?.messages ?? [];
  const meta = data?.meta;
  const totalCount = filter === "unread" ? (otherCount?.meta.total ?? 0) : (meta?.total ?? 0);
  const unreadCount = filter === "unread" ? (meta?.total ?? 0) : (otherCount?.meta.total ?? 0);

  function toggle(m: ContactMessage) {
    const opening = expandedId !== m._id;
    setExpandedId(opening ? m._id : null);
    if (opening && !m.read) {
      markRead.mutate(m._id, {
        onError: (error) =>
          toastApiError(error, "Couldn't mark that message as read."),
      });
    }
  }

  function handleDelete(m: ContactMessage) {
    if (!window.confirm(`Delete the message from ${m.name}? This can't be undone.`)) {
      return;
    }
    deleteMessage.mutate(m._id, {
      onSuccess: () => {
        toast.success("Message deleted");
        setExpandedId((current) => (current === m._id ? null : current));
      },
      onError: (error) => toastApiError(error, "Couldn't delete that message."),
    });
  }

  return (
    <div>
      {/* Filter tabs */}
      <Reveal className="flex gap-2">
        {(
          [
            { value: "all", label: "All", count: totalCount },
            { value: "unread", label: "Unread", count: unreadCount },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              "cursor-pointer rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-200",
              filter === tab.value
                ? "bg-boxx-red/10 text-boxx-red"
                : "text-boxx-mist hover:text-boxx-white",
            )}
          >
            {tab.label}
            <span className="ml-2 text-boxx-dim">{tab.count}</span>
          </button>
        ))}
      </Reveal>

      {/* Inbox */}
      <Reveal delay={100} className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal">
        <ul>
          {isLoading && (
            <li className="px-6 py-14 text-center text-sm text-boxx-dim">
              Loading messages…
            </li>
          )}
          {isError && (
            <li className="px-6 py-14 text-center text-sm text-boxx-dim">
              Couldn&apos;t load messages. Try refreshing.
            </li>
          )}
          {!isLoading && !isError &&
            messages.map((m) => {
              const expanded = expandedId === m._id;
              return (
                <li
                  key={m._id}
                  className="border-b border-boxx-line/50 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => toggle(m)}
                    aria-expanded={expanded}
                    className="flex w-full cursor-pointer items-start justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-boxx-slate/40"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold text-boxx-white">
                        {!m.read && (
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-boxx-red"
                            aria-label="Unread"
                          />
                        )}
                        {m.name}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-boxx-red">
                        {m.subject || "General enquiry"}
                      </p>
                      {!expanded && (
                        <p className="mt-2 line-clamp-1 text-sm text-boxx-mist">
                          {m.message}
                        </p>
                      )}
                    </div>
                    <span className="flex shrink-0 items-center gap-3 text-xs text-boxx-dim">
                      {formatDistanceToNowStrict(parseISO(m.createdAt), { addSuffix: true })}
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        aria-hidden
                        className={cn(
                          "size-4 transition-transform duration-200",
                          expanded && "rotate-180",
                        )}
                      />
                    </span>
                  </button>

                  {expanded && (
                    <div className="px-6 pb-6">
                      <p className="max-w-3xl text-sm leading-relaxed text-boxx-mist">
                        {m.message}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <ReplyAction href={`mailto:${m.email}`}>
                          <HugeiconsIcon
                            icon={Mail01Icon}
                            aria-hidden
                            className="size-3.5"
                          />
                          Reply by email
                        </ReplyAction>
                        {m.phone && (
                          <>
                            <ReplyAction
                              href={`https://wa.me/${waNumber(m.phone)}`}
                              external
                            >
                              <HugeiconsIcon
                                icon={WhatsappIcon}
                                aria-hidden
                                className="size-3.5"
                              />
                              Reply on WhatsApp
                            </ReplyAction>
                            <ReplyAction href={`tel:${m.phone}`}>
                              <HugeiconsIcon
                                icon={Call02Icon}
                                aria-hidden
                                className="size-3.5"
                              />
                              Call
                            </ReplyAction>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(m)}
                          disabled={deleteMessage.isPending}
                          className="cursor-pointer rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-boxx-dim transition-colors duration-200 hover:text-boxx-red disabled:pointer-events-none disabled:opacity-40"
                        >
                          <span className="inline-flex items-center gap-2">
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              aria-hidden
                              className="size-3.5"
                            />
                            Delete
                          </span>
                        </button>
                        <span className="ml-auto text-xs text-boxx-dim">
                          {m.phone ? `${m.email} · ${m.phone}` : m.email}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          {!isLoading && !isError && messages.length === 0 && (
            <li>
              <EmptyState
                icon={Mail01Icon}
                title="Inbox zero"
                description="Nothing to read here right now."
              />
            </li>
          )}
        </ul>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-boxx-line px-6 py-4 text-xs text-boxx-dim">
            <span>
              Page {meta.page} of {meta.totalPages} · {meta.total} total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex size-8 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="flex size-8 items-center justify-center rounded-full border border-boxx-line text-boxx-mist transition-colors duration-200 hover:border-boxx-red hover:text-boxx-white disabled:pointer-events-none disabled:opacity-40"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </Reveal>
    </div>
  );
}
