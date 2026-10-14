"use client";
import { Check, Copy, Download, Inbox, LogOut, Mail, MessageSquare, MessageSquarePlus, Monitor, Moon, Plus, Search, Send, Settings, SquarePen, Sun, Trash2, Upload, Users, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { mailAddress, type MailFolder } from "@/lib/shared/mail";
import type { GroupChatSummary } from "@/lib/shared/groupchat";
import { downloadExport, forgetCurrentGuest, importAll, type Conversation } from "@/lib/client/db";
import { importProblem } from "@/lib/client/export";
import { leavePage } from "@/lib/client/leave";
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
  onLeaving,
  theme,
  onTheme,
  onClose,
  mail,
  groups: groupChats,
}: {
  account: AccountInfo;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  /** Während einer Antwort sind Chatwechsel, neuer Chat und Import gesperrt. */
  busy?: boolean;
  /** Abmelden beginnt (true) bzw. ist gescheitert (false) – eine laufende Antwort endet vorher. */
  onLeaving?: (leaving: boolean) => void;
  theme: Theme;
  onTheme: (t: Theme) => void;
  onClose?: () => void;
  /** Posteingang (nur wenn eingeschaltet). */
  mail?: SidebarMail;
  /** Gruppenchats (nur wenn eingeschaltet). */
  groups?: SidebarGroups;
}) {
  const busyTitle = busy ? "Während einer Antwort nicht möglich" : undefined;
  const [query, setQuery] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  // Export und Abmelden je nur einmal, auch bei einem Doppelklick.
  const exportingRef = useRef(false);
  const leavingRef = useRef(false);
  const groups = useMemo(() => groupByDate(filterConversations(conversations, query)), [conversations, query]);
  const shared = useMemo(() => filterGroupChats(groupChats?.chats ?? [], query), [groupChats?.chats, query]);

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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onNew}
                disabled={busy}
                title={busyTitle}
                className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:opacity-95 disabled:opacity-50"
              >
                <MessageSquarePlus className="h-4.5 w-4.5" /> Neuer Chat
              </button>
              {groupChats && (
                <button
                  type="button"
                  onClick={() => {
                    groupChats.onNew();
                    onClose?.();
                  }}
                  disabled={busy}
                  aria-label="Neuer Gruppenchat"
                  title={busyTitle ?? "Neuer Gruppenchat"}
                  className="relative grid w-11 shrink-0 place-items-center rounded-full border border-white/16 bg-white/8 text-white transition hover:bg-white/14 disabled:opacity-50"
                >
                  <Users className="h-4.5 w-4.5" />
                  <span aria-hidden="true" className="absolute -top-1 -right-1 grid h-4.5 w-4.5 place-items-center rounded-full border-2 border-[#120e1d] bg-brand-gradient">
                    <Plus className="h-2.5 w-2.5" strokeWidth={4} />
                  </span>
                </button>
              )}
            </div>
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
            {shared.length > 0 && groupChats && (
              <div className="mb-3">
                <div className="px-3 pt-2 pb-1 text-[0.7rem] font-semibold tracking-[0.12em] text-white/60 uppercase">Gruppenchats</div>
                {shared.map((g) => {
                  const current = g.id === groupChats.activeId;
                  const unread = g.unread && !current;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => groupChats.onSelect(g.id)}
                      disabled={busy && !current}
                      title={busy && !current ? busyTitle : undefined}
                      aria-current={current ? "page" : undefined}
                      aria-label={`${g.title}${g.left ? ", verlassen" : ""}${unread ? ", neue Nachrichten" : ""}`}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed",
                        current ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/6 hover:text-white",
                      )}
                    >
                      <Users className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{g.title}</span>
                      {g.left && <span className="shrink-0 text-[0.7rem] text-white/60">verlassen</span>}
                      {unread && <span aria-hidden="true" className="h-2.25 w-2.25 shrink-0 rounded-full bg-brand-gradient" />}
                    </button>
                  );
                })}
              </div>
            )}
            {groups.length === 0 && shared.length === 0 && <p className="px-3 py-6 text-center text-sm text-white/65">{query ? "Keine Treffer." : "Noch keine Chats."}</p>}
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
            onClick={async () => {
              if (exportingRef.current) return;
              exportingRef.current = true;
              try {
                await downloadExport();
              } finally {
                // Der zweite Klick eines Doppelklicks kommt erst nach dem Download an.
                setTimeout(() => (exportingRef.current = false), 1000);
              }
            }}
            label="Alle Chats exportieren"
          >
            <Download className="h-4 w-4" /> Export
          </SideAction>
          {/* Während einer Antwort gesperrt: ein importierter Chat mit derselben ID würde sie überschreiben. */}
          <SideAction onClick={() => importRef.current?.click()} label="Chats importieren" disabled={busy} title={busyTitle}>
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
              const text = await file.text().catch(() => "");
              try {
                const n = await importAll(text);
                alert(n === 1 ? "1 Chat importiert." : `${n} Chats importiert.`);
              } catch {
                alert(importProblem(file.name, text));
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
              if (leavingRef.current) return;
              const question = logoutQuestion(account.role, mail, Boolean(groupChats?.chats?.some((g) => !g.left)));
              if (question && !confirm(question)) return;
              leavingRef.current = true;
              onLeaving?.(true);
              try {
                await fetch("/api/auth/logout", { method: "POST" });
                await forgetCurrentGuest();
                leavePage(`${window.location.origin}/login`);
              } catch {
                leavingRef.current = false;
                onLeaving?.(false);
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
  /** Neues in einem Gruppenchat (Punkt am Reiter „Chat“, solange der Posteingang offen ist). */
  chatUnread?: boolean;
}

export interface SidebarGroups {
  /** Null, solange die erste Statusabfrage läuft. */
  chats: GroupChatSummary[] | null;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

/** Rückfrage beim Abmelden – null heißt: ohne Rückfrage. */
function logoutQuestion(role: AccountInfo["role"], mail?: SidebarMail, inGroupChats = false): string | null {
  // Gruppenchats liegen auf dem Server und bleiben – das sagen wir nur, wenn man in einem ist.
  const groups = inGroupChats ? " Deine Gruppenchats bleiben für deine Gruppe bis zum Termin-Ende bestehen." : "";
  if (role === "guest") {
    return mail
      ? `Beim Abmelden werden deine Chats von diesem Gerät gelöscht und dein Posteingang wird geleert. Wenn du Chats behalten möchtest, vorher „Export“ wählen.${groups} Jetzt abmelden?`
      : `Beim Abmelden werden deine Chats von diesem Gerät gelöscht. Wenn du sie behalten möchtest, vorher „Export“ wählen.${groups} Jetzt abmelden?`;
  }
  return mail && mail.total > 0 ? "Beim Abmelden wird dein Posteingang geleert. Jetzt abmelden?" : null;
}

/** Umschalter „Chat | Posteingang“ mit der Zahl ungelesener Mails. */
function ViewSwitch({ mail, onClose }: { mail: SidebarMail; onClose?: () => void }) {
  const tab = (view: "chat" | "mail", label: string, icon: React.ReactNode, badge?: number, dot?: boolean) => (
    <button
      type="button"
      aria-pressed={mail.view === view}
      aria-label={badge ? `${label}, ${badge} ungelesen` : dot ? `${label}, neue Nachrichten` : label}
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
      {dot ? <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-gradient" /> : null}
    </button>
  );
  return (
    <div role="group" aria-label="Ansicht wechseln" className="mx-3 mb-3 flex gap-1 rounded-full bg-white/7 p-1">
      {tab("chat", "Chat", <MessageSquare className="h-4 w-4" />, undefined, mail.view === "mail" && mail.chatUnread)}
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
      aria-label={count ? `${label}, ${count} ungelesen` : label}
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

function SideAction({
  children,
  onClick,
  label,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      title={title}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-white/70 hover:bg-white/8 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function filterConversations(list: Conversation[], query: string): Conversation[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => (c.title ?? "").toLowerCase().includes(q) || (c.messages ?? []).some((m) => (m.text ?? "").toLowerCase().includes(q)));
}

function filterGroupChats(list: GroupChatSummary[], query: string): GroupChatSummary[] {
  const q = query.trim().toLowerCase();
  return q ? list.filter((g) => g.title.toLowerCase().includes(q)) : list;
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
