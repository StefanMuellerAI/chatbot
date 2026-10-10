import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Logo } from "@/components/ui/Logo";
import { getUserSession } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/events/format";
import { listEvents } from "@/lib/events/store";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "Zugangsdaten drucken – Freebie" };

/** Kärtchen zum Ausschneiden: je Gast Benutzername, Passwort und Gültigkeit (A4, 3 × 8). */
export default async function PrintPage({ searchParams }: { searchParams: Promise<{ termin?: string; gruppe?: string }> }) {
  await connection();
  const session = await getUserSession();
  if (session?.role !== "admin") redirect("/login?weiter=admin");
  const { termin, gruppe } = await searchParams;
  const event = (await listEvents()).find((e) => e.id === termin);
  if (!event) notFound();
  const groups = event.groups.filter((g) => !gruppe || g.id === gruppe);
  if (gruppe && groups.length === 0) notFound();
  const until = formatDateTime(event.endedEarlyAt ?? event.endsAt);
  const cards = groups.flatMap((g) => g.guests.map((guest) => ({ ...guest, group: g.name })));
  const h = await headers();
  const address = h.get("x-forwarded-host") ?? h.get("host") ?? "";

  return (
    <main className="min-h-full bg-white p-6 text-black print:p-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-xl font-bold">Zugangsdaten: {event.name}</h1>
          <p className="text-sm text-neutral-600">
            {cards.length} {cards.length === 1 ? "Kärtchen" : "Kärtchen"}
            {gruppe ? ` · Gruppe „${groups[0].name}“` : ""} · gültig bis {until}
          </p>
        </div>
        <PrintButton />
      </div>
      {cards.length === 0 ? (
        <p>Diese Auswahl enthält keine Gäste.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-0 print:gap-0" aria-label="Zugangskärtchen">
          {cards.map((c) => (
            <li key={c.id} className="break-inside-avoid border border-dashed border-neutral-400 p-4" aria-label={`Zugang ${c.username}`}>
              <Logo subtitle={false} className="text-black" />
              <p className="mt-2 text-xs text-neutral-600">
                {event.name} · {c.group}
              </p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 text-sm">
                <dt className="text-neutral-600">Benutzername</dt>
                <dd className="font-mono font-semibold">{c.username}</dd>
                <dt className="text-neutral-600">Passwort</dt>
                <dd className="font-mono font-semibold">{c.password}</dd>
              </dl>
              <p className="mt-2 text-[11px] text-neutral-600">
                Anmelden unter {address} · gültig bis {until}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
