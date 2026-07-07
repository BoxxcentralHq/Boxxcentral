import Link from "next/link";
import { format, parseISO } from "date-fns";
import { bookings, messages, overviewStats } from "@/lib/admin-data";
import { PanelLabel, StatusBadge } from "./_components/shared";

/** Header row for an overview panel, with a link to the full page. */
function PanelHeader({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-boxx-line px-6 py-5">
      <PanelLabel>{label}</PanelLabel>
      <Link
        href={href}
        className="text-[10px] font-bold uppercase tracking-widest text-boxx-mist transition-colors duration-200 hover:text-boxx-red"
      >
        View all →
      </Link>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-boxx-red">
        Overview
      </p>
      <h1 className="mt-2 font-heading text-3xl uppercase tracking-wide text-boxx-white sm:text-4xl">
        Today at a glance
      </h1>

      {/* Stat tiles */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-boxx-line bg-boxx-coal p-5"
          >
            <PanelLabel>{stat.label}</PanelLabel>
            <p className="mt-3 font-heading text-4xl text-boxx-white">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs text-boxx-dim">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid items-start gap-6 xl:grid-cols-3">
        {/* Recent bookings */}
        <section className="rounded-2xl border border-boxx-line bg-boxx-coal xl:col-span-2">
          <PanelHeader label="Recent bookings" href="/admin/bookings" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-boxx-line text-[10px] font-bold uppercase tracking-widest text-boxx-dim">
                  <th className="px-6 py-3 font-bold">Guest</th>
                  <th className="px-4 py-3 font-bold">Experience</th>
                  <th className="px-4 py-3 font-bold">When</th>
                  <th className="px-4 py-3 text-right font-bold">Guests</th>
                  <th className="px-6 py-3 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-boxx-line/50 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-boxx-white">
                        {b.guestName}
                      </p>
                      <p className="mt-0.5 text-xs text-boxx-dim">{b.contact}</p>
                    </td>
                    <td className="px-4 py-4 text-boxx-mist">{b.experience}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-boxx-mist">
                      {format(parseISO(b.date), "EEE d MMM")} · {b.time}
                    </td>
                    <td className="px-4 py-4 text-right text-boxx-mist">
                      {b.guests}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Latest messages */}
        <section className="rounded-2xl border border-boxx-line bg-boxx-coal">
          <PanelHeader label="Latest messages" href="/admin/messages" />
          <ul>
            {messages.map((m) => (
              <li
                key={m.id}
                className="border-b border-boxx-line/50 px-6 py-5 last:border-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 font-semibold text-boxx-white">
                    {m.unread && (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-boxx-red"
                        aria-label="Unread"
                      />
                    )}
                    {m.name}
                  </p>
                  <span className="shrink-0 text-xs text-boxx-dim">
                    {m.receivedAgo}
                  </span>
                </div>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-boxx-red">
                  {m.topic}
                </p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-boxx-mist">
                  {m.preview}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
