"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Call02Icon,
  Mail01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import {
  messages as initialMessages,
  type ContactMessage,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

const isEmail = (contact: string) => contact.includes("@");

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

/**
 * Contact-form inbox over the placeholder dataset. Read state only mutates
 * local state — TODO: persist via the messages API once the backend lands.
 */
export default function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => messages.filter((m) => m.unread).length,
    [messages],
  );

  const visible = useMemo(
    () => (filter === "unread" ? messages.filter((m) => m.unread) : messages),
    [messages, filter],
  );

  function setUnread(id: string, unread: boolean) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread } : m)),
    );
  }

  /** Expanding a message opens it and marks it read. */
  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
    setUnread(id, false);
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(
          [
            { value: "all", label: "All", count: messages.length },
            { value: "unread", label: "Unread", count: unreadCount },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
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
      </div>

      {/* Inbox */}
      <div className="mt-6 rounded-2xl border border-boxx-line bg-boxx-coal">
        <ul>
          {visible.map((m) => {
            const expanded = expandedId === m.id;
            return (
              <li
                key={m.id}
                className="border-b border-boxx-line/50 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  aria-expanded={expanded}
                  className="flex w-full cursor-pointer items-start justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-boxx-slate/40"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-boxx-white">
                      {m.unread && (
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-boxx-red"
                          aria-label="Unread"
                        />
                      )}
                      {m.name}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-boxx-red">
                      {m.topic}
                    </p>
                    {!expanded && (
                      <p className="mt-2 line-clamp-1 text-sm text-boxx-mist">
                        {m.preview}
                      </p>
                    )}
                  </div>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-boxx-dim">
                    {m.receivedAgo}
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
                      {m.body}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {isEmail(m.contact) ? (
                        <ReplyAction href={`mailto:${m.contact}`}>
                          <HugeiconsIcon
                            icon={Mail01Icon}
                            aria-hidden
                            className="size-3.5"
                          />
                          Reply by email
                        </ReplyAction>
                      ) : (
                        <>
                          <ReplyAction
                            href={`https://wa.me/${waNumber(m.contact)}`}
                            external
                          >
                            <HugeiconsIcon
                              icon={WhatsappIcon}
                              aria-hidden
                              className="size-3.5"
                            />
                            Reply on WhatsApp
                          </ReplyAction>
                          <ReplyAction href={`tel:${m.contact}`}>
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
                        onClick={() => {
                          setUnread(m.id, true);
                          setExpandedId(null);
                        }}
                        className="cursor-pointer rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-boxx-dim transition-colors duration-200 hover:text-boxx-white"
                      >
                        Mark as unread
                      </button>
                      <span className="ml-auto text-xs text-boxx-dim">
                        {m.contact}
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="px-6 py-14 text-center text-sm text-boxx-dim">
              Inbox zero — nothing unread.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
