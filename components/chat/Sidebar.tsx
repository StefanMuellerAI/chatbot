"use client";
import { Download, LogOut, MessageSquarePlus, Monitor, Moon, Search, Settings, Sun, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { exportAll, importAll, type Conversation } from "@/lib/client/db";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import type { Theme } from "@/components/ui/theme";

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  busy,
  theme,
  onTheme,
  onClose,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  /** Während einer Antwort sind Chatwechsel und neuer Chat gesperrt. */
  busy?: boolean;
  theme: Theme;
  onTheme: (t: Theme) => void;
  onClose?: () => void;
}) {
  const busyTitle = busy ? "Während einer Antwort nicht möglich" : undefined;
  const [query, setQuery] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const groups = useMemo(() => groupByDate(filterConversations(conversations, query)), [conversations, query]);

  return (
    <aside className="flex h-full w-full flex-col bg-[#120e1d] text-[#efeaf9]">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Logo />
        {onClose && (
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white md:hidden" aria-label="Menü schließen">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="px-3">
        <button
          type="button"
          onClick={onNew}
          disabled={busy}
          title={busyTitle}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:opacity-95 disabled:opacity-50"
        >
          <MessageSquarePlus className="h-4.5 w-4.5" /> Neuer Chat
        </button>
        <label className="mt-3 flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm text-white/70 focus-within:bg-white/12">
          <Search className="h-4 w-4" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chats durchsuchen"
            aria-label="Chats durchsuchen"
            className="w-full bg-transparent text-white outline-none placeholder:text-white/40"
          />
        </label>
      </div>
      <nav className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3" aria-label="Chatverlauf">
        {groups.length === 0 && <p className="px-3 py-6 text-center text-sm text-white/40">{query ? "Keine Treffer." : "Noch keine Chats."}</p>}
        {groups.map(([label, items]) => (
          <div key={label} className="mb-3">
            <div className="px-3 pt-2 pb-1 text-[0.7rem] font-semibold tracking-[0.12em] text-white/40 uppercase">{label}</div>
            {items.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center rounded-xl text-sm transition-colors",
                  c.id === activeId ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/6 hover:text-white",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  disabled={busy && c.id !== activeId}
                  title={busy && c.id !== activeId ? busyTitle : undefined}
                  aria-current={c.id === activeId ? "page" : undefined}
                  className="min-w-0 flex-1 truncate px-3 py-2 text-left disabled:cursor-not-allowed"
                >
                  {c.title || "Neuer Chat"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Chat „${c.title || "Neuer Chat"}“ löschen?`)) onDelete(c.id);
                  }}
                  className="mr-1 rounded-lg p-1.5 text-white/40 opacity-0 hover:bg-white/10 hover:text-white group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
                  aria-label={`Chat „${c.title || "Neuer Chat"}“ löschen`}
                  title="Chat löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3 text-sm">
        <div className="mb-2 flex items-center justify-between rounded-full bg-white/6 p-1">
          {(
            [
              ["light", Sun, "Hell"],
              ["system", Monitor, "System"],
              ["dark", Moon, "Dunkel"],
            ] as const
          ).map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onTheme(value)}
              className={cn("flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-xs", theme === value ? "bg-white/15 text-white" : "text-white/55 hover:text-white")}
              title={label}
              aria-pressed={theme === value}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <SideAction
            onClick={async () => {
              const json = await exportAll();
              const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = `freebie-chats-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            label="Alle Chats exportieren"
          >
            <Download className="h-4 w-4" /> Export
          </SideAction>
          <SideAction onClick={() => importRef.current?.click()} label="Chats importieren">
            <Upload className="h-4 w-4" /> Import
          </SideAction>
          <input
            ref={importRef}
            type="file"
            aria-label="Export-Datei für den Import"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                const n = await importAll(await file.text());
                alert(n === 1 ? "1 Chat importiert." : `${n} Chats importiert.`);
              } catch {
                alert("Die Datei konnte nicht importiert werden. Bitte eine Export-Datei von Freebie wählen.");
              }
            }}
          />
          <Link href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/70 hover:bg-white/8 hover:text-white">
            <Settings className="h-4 w-4" /> Admin
          </Link>
          <SideAction
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.replace(`${window.location.origin}/login`);
              } catch {
                alert("Abmelden hat nicht geklappt – bitte die Internetverbindung prüfen und erneut versuchen.");
              }
            }}
          >
            <LogOut className="h-4 w-4" /> Abmelden
          </SideAction>
        </div>
      </div>
    </aside>
  );
}

function SideAction({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-white/70 hover:bg-white/8 hover:text-white">
      {children}
    </button>
  );
}

function filterConversations(list: Conversation[], query: string): Conversation[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => (c.title ?? "").toLowerCase().includes(q) || (c.messages ?? []).some((m) => (m.text ?? "").toLowerCase().includes(q)));
}

function groupByDate(list: Conversation[]): [string, Conversation[]][] {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86_400_000;
  const startWeek = startToday - 6 * 86_400_000;
  const groups: Record<string, Conversation[]> = { Heute: [], Gestern: [], "Letzte 7 Tage": [], Älter: [] };
  for (const c of list) {
    const t = c.updatedAt;
    const key = t >= startToday ? "Heute" : t >= startYesterday ? "Gestern" : t >= startWeek ? "Letzte 7 Tage" : "Älter";
    groups[key].push(c);
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}
