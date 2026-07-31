"use client";

import { useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Send } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { toast, toastApiError } from "@/lib/api/toast";
import { useCreateContactMessage } from "@/lib/contact";
import { cn } from "@/lib/utils";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const createMessage = useCreateContactMessage();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    createMessage.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: topic,
        message: message.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Message sent — we'll reply within the day.");
          setName("");
          setEmail("");
          setPhone("");
          setMessage("");
          setTopic(topics[0]);
        },
        onError: (error) =>
          toastApiError(error, "Couldn't send your message. Please try again."),
      },
    );
  };

  return (
    <div className="rounded-2xl border border-boxx-line bg-boxx-coal p-6 sm:p-10">
      <span className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Get in touch
      </span>
      <h2 className="mt-3 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        What&apos;s the plan?
      </h2>
      <p className="mt-3 text-sm leading-relaxed">
        Group size, dates, the experience you&apos;re after — the more detail
        the better. We reply within the day.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="contact-email">Email</FieldLabel>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Where we can reach you"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="contact-phone">Phone (optional)</FieldLabel>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+234 ..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="contact-topic">Topic</FieldLabel>
          <div
            id="contact-topic"
            role="radiogroup"
            className="flex flex-wrap gap-2"
          >
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={topic === t}
                onClick={() => setTopic(t)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors duration-200",
                  topic === t
                    ? "border-boxx-red bg-boxx-red text-boxx-white"
                    : "border-boxx-line text-boxx-mist hover:border-boxx-dim hover:text-boxx-white",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel htmlFor="contact-message">Message</FieldLabel>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            placeholder="Tell us what you're planning..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${fieldClass} resize-y`}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" disabled={createMessage.isPending}>
            {createMessage.isPending ? "Sending…" : "Send"}
            <HugeiconsIcon icon={Send} className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
