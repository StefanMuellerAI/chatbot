"use client";
import { Check, Copy, Download, Inbox, LogOut, Mail, MessageSquare, MessageSquarePlus, Monitor, Moon, Search, Send, Settings, SquarePen, Sun, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { mailAddress, type MailFolder } from "@/lib/shared/mail";
import { downloadExport, forgetCurrentGuest, importAll, type Conversation } from "@/lib/client/db";
import { formatTime } from "@/lib/events/window";
import type { AccountInfo } from "@/lib/shared/types";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import type { Theme } from "@/components/ui/theme";

export function Sidebar({
  account,
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  busy,
  theme,
  onTheme,
  onClose,
  mail,
}: {
  account: AccountInfo;
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
  /** Posteingang (nur wenn eingeschaltet). */
  mail?: SidebarMail;
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
      {mail && <ViewSwitch mail={mail} onClose={onClose} />}
      {mail?.view === "mail" ? (
        <MailNav mail={mail} account={account} onClose={onClose} />
      ) : (
        <>
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
                className="w-full bg-transparent text-white outline-none placeholder:text-white/55"
              />
            </label>
          </div>
          <nav className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3" aria-label="Chatverlauf">
            {groups.length === 0 && <p className="px-3 py-6 text-center text-sm text-white/65">{query ? "Keine Treffer." : "Noch keine Chats."}</p>}
            {groups.map(([label, items]) => (
              <div key={label} className="mb-3">
                <div className="px-3 pt-2 pb-1 text-[0.7rem] font-semibold tracking-[0.12em] text-white/60 uppercase">{label}</div>
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
                      className="mr-1 rounded-lg p-1.5 text-white/60 opacity-0 hover:bg-white/10 hover:text-white group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
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
        </>
      )}
      {mail?.view === "mail" && <div className="flex-1" />}
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
              className={cn("flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-xs", theme === value ? "bg-white/15 text-white" : "text-white/70 hover:text-white")}
              title={label}
              aria-pressed={theme === value}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
        {account.role === "guest" && (
          <p className="mb-2 px-1 text-xs text-white/65">
            Angemeldet als <span className="font-semibold text-white/85">{account.username}</span>
            {account.validUntil && <> · gültig bis {formatTime(new Date(account.validUntil))} Uhr</>}
          </p>
        )}
        <div className="grid grid-cols-2 gap-1">
          <SideAction
            onClick={() => void downloadExport()}
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
          {account.role === "admin" && (
            <Link href="/admin" prefetch={false} className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/70 hover:bg-white/8 hover:text-white">
              <Settings className="h-4 w-4" /> Admin
            </Link>
          )}
          <SideAction
            onClick={async () => {
              // Gast-Chats bleiben nicht auf (oft gemeinsam genutzten) Schulungsrechnern liegen; das Postfach wird geleert.
              const question = logoutQuestion(account.role, mail);
              if (question && !confirm(question)) return;
              try {
                await fetch("/api/auth/logout", { method: "POST" });
                await forgetCurrentGuest();
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

export interface SidebarMail {
  view: "chat" | "mail";
  onView: (view: "chat" | "mail") => void;
  unread: number;
  /** Alle Mails im eigenen Postfach (für die Rückfrage beim Abmelden). */
  total: number;
  folder: MailFolder;
  onFolder: (folder: MailFolder) => void;
  onNewMail: () => void;
}

/** Rückfrage beim Abmelden – null heißt: ohne Rückfrage. */
function logoutQuestion(role: AccountInfo["role"], mail?: SidebarMail): string | null {
  if (role === "guest") {
    return mail
      ? "Beim Abmelden werden deine Chats von diesem Gerät gelöscht und dein Posteingang wird geleert. Wenn du Chats behalten möchtest, vorher „Export“ wählen. Jetzt abmelden?"
      : "Beim Abmelden werden deine Chats von diesem Gerät gelöscht. Wenn du sie behalten möchtest, vorher „Export“ wählen. Jetzt abmelden?";
  }
  return mail && mail.total > 0 ? "Beim Abmelden wird dein Posteingang geleert. Jetzt abmelden?" : null;
}

/** Umschalter „Chat | Posteingang“ mit der Zahl ungelesener Mails. */
function ViewSwitch({ mail, onClose }: { mail: SidebarMail; onClose?: () => void }) {
  const tab = (view: "chat" | "mail", label: string, icon: React.ReactNode, badge?: number) => (
    <button
      type="button"
      aria-pressed={mail.view === view}
      aria-label={badge ? `${label}, ${badge} ungelesen` : label}
      onClick={() => {
        mail.onView(view);
        onClose?.();
      }}
      className={cn(
        "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold",
        mail.view === view ? "bg-white/15 text-white" : "text-white/70 hover:text-white",
      )}
    >
      {icon}
      {label}
      {badge ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-gradient px-1.5 text-[0.7rem] font-bold text-white">{badge}</span> : null}
    </button>
  );
  return (
    <div role="group" aria-label="Ansicht wechseln" className="mx-3 mb-3 flex gap-1 rounded-full bg-white/7 p-1">
      {tab("chat", "Chat", <MessageSquare className="h-4 w-4" />)}
      {tab("mail", "Posteingang", <Mail className="h-4 w-4" />, mail.unread)}
    </div>
  );
}

/** Seitenleiste im Posteingang: „Neue E-Mail“, Ordner und die eigene Adresse. */
function MailNav({ mail, account, onClose }: { mail: SidebarMail; account: AccountInfo; onClose?: () => void }) {
  const [copied, setCopied] = useState(false);
  const address = mailAddress(account.mailLocal);
  const folder = (value: MailFolder, label: string, icon: React.ReactNode, count?: number) => (
    <button
      type="button"
      aria-current={mail.folder === value ? "page" : undefined}
      onClick={() => {
        mail.onFolder(value);
        onClose?.();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm",
        mail.folder === value ? "bg-white/12 font-semibold text-white" : "text-white/75 hover:bg-white/6 hover:text-white",
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count ? <span className="text-xs font-bold text-white">{count}</span> : null}
    </button>
  );
  return (
    <div className="flex flex-col gap-3 px-3">
      <button
        type="button"
        onClick={() => {
          mail.onNewMail();
          onClose?.();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:opacity-95"
      >
        <SquarePen className="h-4.5 w-4.5" /> Neue E-Mail
      </button>
      <nav aria-label="Ordner" className="flex flex-col gap-0.5">
        {folder("inbox", "Posteingang", <Inbox className="h-4 w-4" />, mail.unread)}
        {folder("sent", "Gesendet", <Send className="h-4 w-4" />)}
      </nav>
      <div className="rounded-2xl bg-white/6 p-3">
        <div className="text-[0.68rem] font-semibold tracking-[0.12em] text-white/60 uppercase">Deine Adresse</div>
        <div className="mt-1 text-sm font-semibold break-all text-white">{address}</div>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(address).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/7 px-2.5 py-1 text-xs text-white/80 hover:bg-white/12 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Kopiert" : "Adresse kopieren"}
        </button>
        <p className="mt-2 text-xs leading-relaxed text-white/65">
          {account.role === "guest"
            ? `Du kannst deiner Gruppe${account.groupName ? ` „${account.groupName}“` : ""} und der Kursleitung schreiben.`
            : "Du kannst den Gruppen laufender Termine schreiben."}
        </p>
      </div>
    </div>
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
