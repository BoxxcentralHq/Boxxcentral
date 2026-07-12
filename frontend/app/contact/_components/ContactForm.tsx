"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const topics = [
  "General enquiry",
  "Group booking",
  "Private event",
  "Partnership",
] as const;

const fieldClass =
  "w-full rounded-xl border border-boxx-line bg-boxx-night px-4 py-3 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim"
    >
      {children}
    </label>
  );
}

export default function ContactForm() {
  const [topic, setTopic] = useState<string>(topics[0]);

  return (
    <div className="rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Message box
      </p>
      <h2 className="mt-3 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Send us a message
      </h2>
      <p className="mt-3 text-sm leading-relaxed">
        Tell us what you&apos;re planning — we usually reply within the day.
      </p>

      <form className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="contact-name">Name</FieldLabel>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="contact-email">Email or phone</FieldLabel>
            <input
              id="contact-email"
              name="email"
              type="text"
              required
              autoComplete="email"
              placeholder="Where we can reach you"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="contact-topic">Topic</FieldLabel>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger
              id="contact-topic"
              className="h-auto w-full rounded-xl border-boxx-line bg-boxx-night px-4 py-3 text-sm text-boxx-white focus-visible:border-boxx-red"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="contact-message">Message</FieldLabel>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            placeholder="Group size, dates, the experience you're after — the more detail the better."
            className={`${fieldClass} resize-y`}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <Button type="submit" size="lg">
            <HugeiconsIcon icon={SentIcon} className="size-4" />
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
}
