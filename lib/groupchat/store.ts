import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, gt, inArray, isNull, lte, sql, type SQL } from "drizzle-orm";
import type { UserSession } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { HttpError } from "@/lib/errors";
import { guestAccess, type EventTimes } from "@/lib/events/window";
import { formatContextDate } from "@/lib/shared/date";
import {
  GROUPCHAT_LIMITS,
  GROUPCHAT_STALE_MS,
  mentionsFreebie,
  type GroupAnswerStatus,
  type GroupChatCandidates,
  type GroupChatDetail,
  type GroupChatMessage,
  type GroupChatSummary,
  type GroupChatSystem,
} from "@/lib/shared/groupchat";
import { TEACHER } from "@/lib/shared/mail";
import type { Attachment, Citation, Effort, GeneratedImage, NativeTurn, UsageInfo } from "@/lib/shared/types";

/** Wer gerade handelt: Gast (eigene Gruppe) oder Kursleitung. */
export interface Actor {
  /** Gast-ID oder „admin“. */
  account: string;
  /** Benutzername bzw. „kursleitung“ – so steht die Person im Chat. */
  name: string;
  role: "admin" | "guest";
  guestId: string | null;
  groupId: string | null;
}

export function actorFor(session: UserSession): Actor {
  if (session.role === "admin") return { account: "admin", name: TEACHER, role: "admin", guestId: null, groupId: null };
  return { account: session.guestId!, name: session.username, role: "guest", guestId: session.guestId!, groupId: session.groupId ?? null };
}

type ChatRow = typeof schema.groupChats.$inferSelect;
type MemberRow = typeof schema.groupChatMembers.$inferSelect;
type MessageRow = typeof schema.groupChatMessages.$inferSelect;
export type GroupMessageRow = MessageRow;
type EventRow = typeof schema.events.$inferSelect;

/** Ergebnis einer Antwort von Freebie (ohne Text), gespeichert als JSON. */
export interface StoredAnswer {
  thinking?: string;
  citations?: Citation[];
  images?: GeneratedImage[];
  usage?: UsageInfo;
  stopReason?: string;
  error?: string;
  fallbackModel?: string;
}

const notFound = () => new HttpError(404, "Diesen Gruppenchat gibt es nicht (mehr).");
const times = (e: EventRow): EventTimes => ({ startsAt: e.startsAt, endsAt: e.endsAt, endedEarlyAt: e.endedEarlyAt });

function rowsOf<T>(res: unknown): T[] {
  return (Array.isArray(res) ? res : ((res as { rows?: T[] }).rows ?? [])) as T[];
}

/** Postgres-Fehlercode – Drizzle reicht den Fehler des Treibers teils als `cause` weiter. */
function pgCode(err: unknown): string | undefined {
  const e = err as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = e?.code ?? e?.cause?.code;
  return typeof code === "string" ? code : undefined;
}

/** Steuerzeichen entfernen (außer Zeilenumbruch und Tab), Zeilenenden vereinheitlichen. */
function cleanText(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

function cleanTitle(value: string): string {
  const title = cleanText(value).replace(/\s+/g, " ").trim();
  if (!title) throw new HttpError(400, "Bitte gib dem Gruppenchat einen Namen.");
  if (title.length > GROUPCHAT_LIMITS.title) throw new HttpError(400, `Der Name ist zu lang (höchstens ${GROUPCHAT_LIMITS.title} Zeichen).`);
  return title;
}

/** Benutzernamen aus der Auswahl: Groß-/Kleinschreibung, Leerzeichen und die Mail-Domain zählen nicht. */
function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/@freebie\.example$/, "");
}

const json = (value: unknown) => (value === undefined || value === null ? null : JSON.stringify(value));

/** Erhöht den Stand des Chats – Teil jeder ändernden Anweisung (die Zeilensperre ordnet gleichzeitige Änderungen). */
const bump = (chatId: string) => sql`UPDATE group_chats SET version = version + 1, updated_at = now() WHERE id = ${chatId} RETURNING version`;

// ---------------------------------------------------------------- Mitgliedschaft und Rechte

interface Membership {
  chat: ChatRow;
  member: MemberRow;
  groupName: string;
}

/** Eigene Mitgliedschaft in einem laufenden Gruppenchat – sonst 404 (verrät nicht, ob es den Chat gibt). */
async function membership(actor: Actor, chatId: string): Promise<Membership> {
  const db = await getDb();
  const rows = await db
    .select({ chat: schema.groupChats, member: schema.groupChatMembers, event: schema.events, groupName: schema.eventGroups.name })
    .from(schema.groupChatMembers)
    .innerJoin(schema.groupChats, eq(schema.groupChats.id, schema.groupChatMembers.chatId))
    .innerJoin(schema.events, eq(schema.events.id, schema.groupChats.eventId))
    .innerJoin(schema.eventGroups, eq(schema.eventGroups.id, schema.groupChats.groupId))
    .where(and(eq(schema.groupChatMembers.chatId, chatId), eq(schema.groupChatMembers.account, actor.account)))
    .limit(1);
  const r = rows[0];
  if (!r || r.member.hidden || !guestAccess(times(r.event)).ok) throw notFound();
  return { chat: r.chat, member: r.member, groupName: r.groupName };
}

function requireActive(m: Membership) {
  if (m.member.leftVersion !== null) throw new HttpError(403, "Du bist nicht mehr in diesem Gruppenchat und kannst nicht mehr schreiben.");
}

function requireOwner(m: Membership, actor: Actor) {
  if (m.chat.owner !== actor.account) throw new HttpError(403, "Das kann nur die Person, die den Gruppenchat gestartet hat.");
}

interface Candidate {
  account: string;
  guestId: string;
  name: string;
}

/**
 * Prüft, wen die Person in die Gruppe `groupId` einladen darf: nur Gäste genau dieser Gruppe mit gültigem
 * Zugang. Die Meldung verrät nicht, ob es einen Namen anderswo gibt.
 */
async function resolveInvitees(actor: Actor, groupId: string, raw: string[]): Promise<Candidate[]> {
  const names = [...new Set(raw.map(normalizeName).filter(Boolean))].filter((n) => n !== actor.name);
  if (names.length === 0) throw new HttpError(400, "Bitte wähle mindestens eine Person aus.");
  const hint = actor.role === "guest" ? "Du kannst nur Personen aus deiner Gruppe einladen." : "Ein Gruppenchat enthält nur Personen aus einer Gruppe.";
  const db = await getDb();
  const rows = await db
    .select({ guest: schema.guests, event: schema.events })
    .from(schema.guests)
    .innerJoin(schema.events, eq(schema.events.id, schema.guests.eventId))
    .where(inArray(schema.guests.username, names));
  return names.map((name) => {
    const r = rows.find((x) => x.guest.username === name);
    if (!r || r.guest.groupId !== groupId || !guestAccess(times(r.event)).ok) {
      throw new HttpError(400, `„${name}“ kann nicht eingeladen werden. ${hint}`);
    }
    return { account: r.guest.id, guestId: r.guest.id, name };
  });
}

// ---------------------------------------------------------------- Lesen

function toMessage(row: MessageRow): GroupChatMessage {
  const base: GroupChatMessage = {
    id: row.id,
    seq: row.seq,
    version: row.version,
    kind: row.kind as GroupChatMessage["kind"],
    author: row.authorName,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
  if (row.kind === "person" && Array.isArray(row.attachments) && row.attachments.length) base.attachments = row.attachments as Attachment[];
  if (row.kind === "system" && row.system) base.system = row.system as GroupChatSystem;
  if (row.kind === "freebie") {
    const a = (row.answer ?? {}) as StoredAnswer;
    Object.assign(base, {
      status: row.status as GroupAnswerStatus,
      askedBy: row.askedBy ?? undefined,
      modelId: row.modelId ?? undefined,
      thinking: a.thinking || undefined,
      citations: a.citations?.length ? a.citations : undefined,
      images: a.images?.length ? a.images : undefined,
      usage: a.usage,
      stopReason: a.stopReason,
      error: a.error,
      fallbackModel: a.fallbackModel,
    });
  }
  return base;
}

function visibleVersion(chat: ChatRow, member: MemberRow): number {
  return member.leftVersion === null ? chat.version : Math.min(chat.version, member.leftVersion);
}

/** Eigene Gruppenchats (ohne ausgeblendete) laufender Termine, zuletzt aktive zuerst. */
export async function listChats(actor: Actor): Promise<GroupChatSummary[]> {
  const db = await getDb();
  const rows = (
    await db
      .select({ chat: schema.groupChats, member: schema.groupChatMembers, event: schema.events })
      .from(schema.groupChatMembers)
      .innerJoin(schema.groupChats, eq(schema.groupChats.id, schema.groupChatMembers.chatId))
      .innerJoin(schema.events, eq(schema.events.id, schema.groupChats.eventId))
      .where(and(eq(schema.groupChatMembers.account, actor.account), eq(schema.groupChatMembers.hidden, false)))
      .orderBy(desc(schema.groupChats.updatedAt))
  ).filter((r) => guestAccess(times(r.event)).ok);
  if (rows.length === 0) return [];
  const counts = (await db
    .select({ chatId: schema.groupChatMembers.chatId, n: count() })
    .from(schema.groupChatMembers)
    .where(and(inArray(schema.groupChatMembers.chatId, rows.map((r) => r.chat.id)), isNull(schema.groupChatMembers.leftVersion)))
    .groupBy(schema.groupChatMembers.chatId)) as { chatId: string; n: number }[];
  const summaries = rows.map(({ chat, member }) => {
    const left = member.leftVersion !== null;
    return {
      id: chat.id,
      title: chat.title,
      owner: chat.ownerName,
      mine: chat.owner === actor.account,
      left,
      unread: visibleVersion(chat, member) > member.readVersion,
      members: Number(counts.find((c) => c.chatId === chat.id)?.n ?? 0),
      // Verlassene Chats verraten nicht, wann darin zuletzt etwas passiert ist.
      updatedAt: (left ? chat.createdAt : chat.updatedAt).toISOString(),
    };
  });
  return [...summaries.filter((s) => !s.left), ...summaries.filter((s) => s.left)];
}

/**
 * Ein Gruppenchat mit seinen Beiträgen – mit `since` nur das seitdem Geänderte. Wer den Chat verlassen hat,
 * sieht nur, was bis dahin feststand. Lesen markiert alles bis zum gelieferten Stand als gelesen.
 */
export async function getChat(actor: Actor, chatId: string, since = 0): Promise<GroupChatDetail> {
  const m = await membership(actor, chatId);
  const db = await getDb();
  const msg = schema.groupChatMessages;
  const where: SQL[] = [eq(msg.chatId, chatId), gt(msg.version, since)];
  if (m.member.leftVersion !== null) where.push(lte(msg.version, m.member.leftVersion));
  let rows = await db.select().from(msg).where(and(...where)).orderBy(asc(msg.seq));
  if (m.member.leftVersion !== null) rows = rows.filter((r) => r.status !== "pending");
  const members = await db
    .select({ account: schema.groupChatMembers.account, name: schema.groupChatMembers.name })
    .from(schema.groupChatMembers)
    .where(and(eq(schema.groupChatMembers.chatId, chatId), isNull(schema.groupChatMembers.leftVersion)))
    .orderBy(asc(schema.groupChatMembers.joinedAt), asc(schema.groupChatMembers.name));
  const visible = visibleVersion(m.chat, m.member);
  if (visible > m.member.readVersion) {
    await db
      .update(schema.groupChatMembers)
      .set({ readVersion: sql`greatest(${schema.groupChatMembers.readVersion}, ${visible})` })
      .where(and(eq(schema.groupChatMembers.chatId, chatId), eq(schema.groupChatMembers.account, actor.account)));
  }
  let leftAt: string | null = null;
  if (m.member.leftVersion !== null) {
    const at = await db.select({ createdAt: msg.createdAt }).from(msg).where(and(eq(msg.chatId, chatId), eq(msg.version, m.member.leftVersion))).limit(1);
    leftAt = at[0]?.createdAt.toISOString() ?? null;
  }
  const ownerFirst = [...members.filter((x) => x.account === m.chat.owner), ...members.filter((x) => x.account !== m.chat.owner)];
  return {
    id: m.chat.id,
    title: m.chat.title,
    owner: m.chat.ownerName,
    mine: m.chat.owner === actor.account,
    members: ownerFirst.map((x) => x.name),
    groupId: m.chat.groupId,
    groupName: m.groupName,
    left: m.member.leftVersion !== null,
    leftAt,
    version: visible,
    messages: rows.map(toMessage),
  };
}

/** Wen man einladen kann: Gäste ihre Gruppe, die Kursleitung die Gruppen laufender Termine. */
export async function candidatesFor(actor: Actor): Promise<GroupChatCandidates> {
  const db = await getDb();
  if (actor.role === "guest") {
    if (!actor.groupId) return { groups: [] };
    const group = (await db.select().from(schema.eventGroups).where(eq(schema.eventGroups.id, actor.groupId)).limit(1))[0];
    const members = await db
      .select({ username: schema.guests.username })
      .from(schema.guests)
      .where(eq(schema.guests.groupId, actor.groupId))
      .orderBy(asc(schema.guests.username));
    return { groups: [{ id: actor.groupId, name: group?.name ?? "Meine Gruppe", eventName: null, members: members.map((g) => g.username).filter((u) => u !== actor.name) }] };
  }
  const events = (await db.select().from(schema.events).orderBy(asc(schema.events.startsAt))).filter((e) => guestAccess(times(e)).ok);
  if (events.length === 0) return { groups: [] };
  const ids = events.map((e) => e.id);
  const groups = await db.select().from(schema.eventGroups).where(inArray(schema.eventGroups.eventId, ids)).orderBy(asc(schema.eventGroups.sortOrder));
  const guests = await db
    .select({ username: schema.guests.username, groupId: schema.guests.groupId })
    .from(schema.guests)
    .where(inArray(schema.guests.eventId, ids))
    .orderBy(asc(schema.guests.username));
  return {
    groups: events.flatMap((e) =>
      groups
        .filter((g) => g.eventId === e.id)
        .map((g) => ({ id: g.id, name: g.name, eventName: e.name, members: guests.filter((x) => x.groupId === g.id).map((x) => x.username) }))
        .filter((g) => g.members.length > 0),
    ),
  };
}

// ---------------------------------------------------------------- Starten und verwalten

export interface CreateInput {
  title: string;
  members: string[];
  /** Nur für die Kursleitung: die Gruppe, aus der sie einlädt. Gäste laden immer aus ihrer eigenen ein. */
  groupId?: string | null;
}

/** Startet einen Gruppenchat mit Personen genau einer Gruppe eines laufenden Termins. */
export async function createChat(actor: Actor, input: CreateInput): Promise<GroupChatSummary> {
  const title = cleanTitle(input.title);
  const groupId = actor.role === "guest" ? actor.groupId : (input.groupId ?? null);
  if (!groupId) throw new HttpError(400, "Bitte wähle eine Gruppe aus.");
  const db = await getDb();
  const group = (
    await db
      .select({ group: schema.eventGroups, event: schema.events })
      .from(schema.eventGroups)
      .innerJoin(schema.events, eq(schema.events.id, schema.eventGroups.eventId))
      .where(eq(schema.eventGroups.id, groupId))
      .limit(1)
  )[0];
  if (!group || !guestAccess(times(group.event)).ok) throw new HttpError(400, "Diese Gruppe gehört zu keinem laufenden Termin.");
  if (input.members.map(normalizeName).includes(TEACHER)) {
    throw new HttpError(400, "„kursleitung“ kann nicht eingeladen werden. Gruppenchats sind für die Teilnehmenden einer Gruppe.");
  }
  const invitees = await resolveInvitees(actor, groupId, input.members);
  if (invitees.length + 1 > GROUPCHAT_LIMITS.members) throw new HttpError(400, `Höchstens ${GROUPCHAT_LIMITS.members} Personen je Gruppenchat.`);
  const own = await db
    .select({ id: schema.groupChats.id, event: schema.events })
    .from(schema.groupChats)
    .innerJoin(schema.events, eq(schema.events.id, schema.groupChats.eventId))
    .where(eq(schema.groupChats.owner, actor.account));
  if (own.filter((r) => guestAccess(times(r.event)).ok).length >= GROUPCHAT_LIMITS.ownChats) {
    throw new HttpError(400, `Du hast schon ${GROUPCHAT_LIMITS.ownChats} Gruppenchats gestartet. Bitte lösche erst einen davon.`);
  }

  const id = randomUUID();
  const system: GroupChatSystem = { action: "invite", actor: actor.name, targets: invitees.map((i) => i.name) };
  const members = [
    sql`(${id}, ${actor.account}, ${actor.guestId}, ${actor.name}, 1)`,
    ...invitees.map((i) => sql`(${id}, ${i.account}, ${i.guestId}, ${i.name}, 0)`),
  ];
  // Chat, Mitglieder und Systemzeile in einer Anweisung: alles oder nichts.
  await db.execute(sql`
    WITH c AS (
      INSERT INTO group_chats (id, event_id, group_id, title, owner, owner_guest_id, owner_name, version)
      VALUES (${id}, ${group.event.id}, ${groupId}, ${title}, ${actor.account}, ${actor.guestId}, ${actor.name}, 1)
      RETURNING id
    ), m AS (
      INSERT INTO group_chat_members (chat_id, account, guest_id, name, read_version) VALUES ${sql.join(members, sql`, `)}
      RETURNING 1
    )
    INSERT INTO group_chat_messages (id, chat_id, seq, version, kind, author, author_name, system)
    VALUES (${randomUUID()}, ${id}, 1, 1, 'system', ${actor.account}, ${actor.name}, ${json(system)}::jsonb)
  `);
  const now = new Date().toISOString();
  return { id, title, owner: actor.name, mine: true, left: false, unread: false, members: invitees.length + 1, updatedAt: now };
}

/** Systemzeile schreiben (mit optionaler weiterer Änderung in derselben Anweisung). */
async function writeSystem(chatId: string, actor: Actor, system: GroupChatSystem, extra: SQL | null, opts: { title?: string } = {}) {
  const db = await getDb();
  const v = opts.title
    ? sql`UPDATE group_chats SET version = version + 1, updated_at = now(), title = ${opts.title} WHERE id = ${chatId} RETURNING version`
    : bump(chatId);
  await db.execute(sql`
    WITH v AS (${v}),
    r AS (
      UPDATE group_chat_members SET read_version = coalesce((SELECT version FROM v), read_version)
      WHERE chat_id = ${chatId} AND account = ${actor.account} AND left_version IS NULL
      RETURNING 1
    )${extra ? sql`, x AS (${extra})` : sql``}
    INSERT INTO group_chat_messages (id, chat_id, seq, version, kind, author, author_name, system)
    SELECT ${randomUUID()}, ${chatId}, v.version, v.version, 'system', ${actor.account}, ${actor.name}, ${json(system)}::jsonb FROM v
  `);
}

export type UpdateInput = { title: string } | { invite: string[] } | { remove: string };

/** Umbenennen, einladen, entfernen – nur die Person, die den Chat gestartet hat. */
export async function updateChat(actor: Actor, chatId: string, input: UpdateInput): Promise<void> {
  const m = await membership(actor, chatId);
  requireOwner(m, actor);
  const db = await getDb();
  if ("title" in input) {
    const title = cleanTitle(input.title);
    if (title === m.chat.title) return;
    await writeSystem(chatId, actor, { action: "rename", actor: actor.name, title }, null, { title });
    return;
  }
  const active = await db
    .select({ account: schema.groupChatMembers.account, name: schema.groupChatMembers.name })
    .from(schema.groupChatMembers)
    .where(and(eq(schema.groupChatMembers.chatId, chatId), isNull(schema.groupChatMembers.leftVersion)));
  if ("invite" in input) {
    const invitees = await resolveInvitees(actor, m.chat.groupId, input.invite);
    const already = invitees.find((i) => active.some((a) => a.account === i.account));
    if (already) throw new HttpError(400, `„${already.name}“ ist schon im Gruppenchat.`);
    if (active.length + invitees.length > GROUPCHAT_LIMITS.members) throw new HttpError(400, `Höchstens ${GROUPCHAT_LIMITS.members} Personen je Gruppenchat.`);
    // Wer erneut eingeladen wird, ist wieder Mitglied und sieht den ganzen Verlauf.
    const values = invitees.map((i) => sql`(${chatId}, ${i.account}, ${i.guestId}, ${i.name})`);
    const extra = sql`
      INSERT INTO group_chat_members (chat_id, account, guest_id, name) VALUES ${sql.join(values, sql`, `)}
      ON CONFLICT (chat_id, account) DO UPDATE SET left_version = NULL, hidden = false, joined_at = now()
      RETURNING 1`;
    await writeSystem(chatId, actor, { action: "invite", actor: actor.name, targets: invitees.map((i) => i.name) }, extra);
    return;
  }
  const name = normalizeName(input.remove);
  const target = active.find((a) => a.name === name);
  if (!target) throw new HttpError(400, `„${name}“ ist nicht (mehr) im Gruppenchat.`);
  if (target.account === m.chat.owner) throw new HttpError(400, "Du hast den Chat gestartet und kannst dich nicht selbst entfernen.");
  const extra = sql`
    UPDATE group_chat_members SET left_version = (SELECT version FROM v)
    WHERE chat_id = ${chatId} AND account = ${target.account} AND left_version IS NULL
    RETURNING 1`;
  await writeSystem(chatId, actor, { action: "remove", actor: actor.name, targets: [target.name] }, extra);
}

/** Verlassen: danach nur noch Lesen bis zu diesem Zeitpunkt. Wer den Chat gestartet hat, kann nicht verlassen. */
export async function leaveChat(actor: Actor, chatId: string): Promise<void> {
  const m = await membership(actor, chatId);
  if (m.chat.owner === actor.account) throw new HttpError(403, "Du hast den Gruppenchat gestartet und kannst ihn nicht verlassen – nur für alle löschen.");
  requireActive(m);
  const db = await getDb();
  await db.execute(sql`
    WITH v AS (${bump(chatId)}),
    m AS (
      UPDATE group_chat_members SET left_version = (SELECT version FROM v), read_version = (SELECT version FROM v)
      WHERE chat_id = ${chatId} AND account = ${actor.account} AND left_version IS NULL
      RETURNING 1
    )
    INSERT INTO group_chat_messages (id, chat_id, seq, version, kind, author, author_name, system)
    SELECT ${randomUUID()}, ${chatId}, v.version, v.version, 'system', ${actor.account}, ${actor.name}, ${json({ action: "leave", actor: actor.name })}::jsonb FROM v
  `);
}

/** Einen verlassenen Chat aus der eigenen Liste entfernen. */
export async function hideChat(actor: Actor, chatId: string): Promise<void> {
  const m = await membership(actor, chatId);
  if (m.member.leftVersion === null) throw new HttpError(400, "Nur verlassene Gruppenchats lassen sich aus der Liste entfernen.");
  const db = await getDb();
  await db
    .update(schema.groupChatMembers)
    .set({ hidden: true })
    .where(and(eq(schema.groupChatMembers.chatId, chatId), eq(schema.groupChatMembers.account, actor.account)));
}

/** Für alle löschen – nur die Person, die den Chat gestartet hat. */
export async function deleteChat(actor: Actor, chatId: string): Promise<void> {
  const m = await membership(actor, chatId);
  requireOwner(m, actor);
  const db = await getDb();
  await db.delete(schema.groupChats).where(eq(schema.groupChats.id, chatId));
}

// ---------------------------------------------------------------- Beiträge

export interface PostInput {
  text: string;
  attachments?: Attachment[];
}

/** Beitrag posten. Das Datum wird beim Posten festgehalten (byte-gleiche Aufbereitung für Freebie). */
export async function postMessage(actor: Actor, chatId: string, input: PostInput): Promise<GroupChatMessage> {
  const m = await membership(actor, chatId);
  requireActive(m);
  const text = cleanText(input.text).replace(/\s+$/, "");
  const attachments = input.attachments ?? [];
  if (!text.trim() && attachments.length === 0) throw new HttpError(400, "Bitte einen Text eingeben oder eine Datei anhängen.");
  if (text.length > GROUPCHAT_LIMITS.text) {
    throw new HttpError(400, `Der Beitrag ist zu lang (höchstens ${GROUPCHAT_LIMITS.text.toLocaleString("de-DE")} Zeichen). Längere Texte bitte als Datei anhängen.`);
  }
  const db = await getDb();
  const msg = schema.groupChatMessages;
  const [{ total }] = (await db
    .select({ total: count() })
    .from(msg)
    .where(and(eq(msg.chatId, chatId), inArray(msg.kind, ["person", "freebie"])))) as { total: number }[];
  if (Number(total) >= GROUPCHAT_LIMITS.messages) throw new HttpError(400, "Der Gruppenchat ist voll. Bitte einen neuen starten.");
  const [{ recent }] = (await db
    .select({ recent: count() })
    .from(msg)
    .where(and(eq(msg.author, actor.account), eq(msg.kind, "person"), gt(msg.createdAt, new Date(Date.now() - 60_000))))) as { recent: number }[];
  if (Number(recent) >= GROUPCHAT_LIMITS.perMinute) throw new HttpError(429, "Du hast gerade sehr viele Beiträge geschrieben. Bitte warte eine Minute.");

  const id = randomUUID();
  const res = await db.execute(sql`
    WITH v AS (${bump(chatId)}),
    r AS (
      UPDATE group_chat_members SET read_version = coalesce((SELECT version FROM v), read_version)
      WHERE chat_id = ${chatId} AND account = ${actor.account}
      RETURNING 1
    )
    INSERT INTO group_chat_messages (id, chat_id, seq, version, kind, author, author_name, text, attachments, context_date)
    SELECT ${id}, ${chatId}, v.version, v.version, 'person', ${actor.account}, ${actor.name}, ${text}, ${json(attachments.length ? attachments : null)}::jsonb, ${formatContextDate(new Date())} FROM v
    RETURNING id
  `);
  if (rowsOf(res).length === 0) throw notFound();
  const row = (await db.select().from(msg).where(eq(msg.id, id)).limit(1))[0];
  return toMessage(row);
}

// ---------------------------------------------------------------- Antworten von Freebie

export interface AnswerJob {
  chatId: string;
  answerId: string;
  /** Beiträge und frühere Antworten vor der neuen Antwort, nach Reihenfolge. */
  history: MessageRow[];
  effort: Effort;
  webSearch: boolean;
  /** Modell der ursprünglichen Antwort (beim Neu-Generieren). */
  previousModelId: string | null;
}

/** Antworten, die zu lange „pending“ sind (Funktion abgebrochen), gelten als unterbrochen – der Chat ist wieder frei. */
async function expireStale(chatId: string): Promise<void> {
  const db = await getDb();
  const error = json({ error: "Die Antwort wurde unterbrochen. Bitte „Neu generieren“ verwenden.", stopReason: "incomplete" } satisfies StoredAnswer);
  await db.execute(sql`
    WITH s AS (
      SELECT id FROM group_chat_messages
      WHERE chat_id = ${chatId} AND status = 'pending' AND updated_at < now() - (${GROUPCHAT_STALE_MS} * interval '1 millisecond')
    ), v AS (
      UPDATE group_chats SET version = version + 1, updated_at = now() WHERE id = ${chatId} AND EXISTS (SELECT 1 FROM s) RETURNING version
    )
    UPDATE group_chat_messages SET status = 'error', answer = ${error}::jsonb, version = (SELECT version FROM v), updated_at = now()
    WHERE id IN (SELECT id FROM s) AND EXISTS (SELECT 1 FROM v)
  `);
}

const BUSY = "Freebie antwortet gerade – bitte kurz warten und dann noch einmal fragen.";

/**
 * Legt den Platzhalter „Freebie antwortet …“ an (höchstens einer je Chat, sonst 409) und liefert den Verlauf.
 * Freebie antwortet nur auf einen eigenen, noch unbeantworteten Beitrag mit „@Freebie“ – oder beim
 * Neu-Generieren auf die letzte Antwort, solange danach nichts geschrieben wurde.
 */
export async function startAnswer(
  actor: Actor,
  chatId: string,
  opts: { regenerate: boolean; modelId: string; effort: Effort; webSearch: boolean },
): Promise<AnswerJob> {
  const m = await membership(actor, chatId);
  requireActive(m);
  await expireStale(chatId);
  const db = await getDb();
  const msg = schema.groupChatMessages;
  const all = await db.select().from(msg).where(eq(msg.chatId, chatId)).orderBy(asc(msg.seq));
  if (all.some((r) => r.status === "pending")) throw new HttpError(409, BUSY);

  let answerId: string;
  let previousModelId: string | null = null;
  let history: MessageRow[];
  try {
    if (opts.regenerate) {
      const last = all[all.length - 1];
      if (!last || last.kind !== "freebie") throw new HttpError(400, "„Neu generieren“ geht nur bei der letzten Antwort, solange danach niemand geschrieben hat.");
      answerId = last.id;
      previousModelId = last.modelId;
      history = all.filter((r) => r.seq < last.seq && r.kind !== "system");
      // Nur, wenn die Antwort nicht inzwischen schon neu generiert wird (zwei Klicks gleichzeitig): sonst 409.
      const res = await db.execute(sql`
        WITH v AS (
          UPDATE group_chats SET version = version + 1, updated_at = now()
          WHERE id = ${chatId} AND EXISTS (SELECT 1 FROM group_chat_messages WHERE id = ${answerId} AND status <> 'pending')
          RETURNING version
        )
        UPDATE group_chat_messages SET status = 'pending', text = '', answer = NULL, native = NULL, asked_by = ${actor.name},
          model_id = ${opts.modelId}, effort = ${opts.effort}, web_search = ${opts.webSearch}, version = (SELECT version FROM v), updated_at = now()
        WHERE id = ${answerId} AND chat_id = ${chatId} AND status <> 'pending' AND EXISTS (SELECT 1 FROM v)
        RETURNING id
      `);
      if (!rowsOf(res).length) throw new HttpError(409, BUSY);
    } else {
      const lastAnswer = [...all].reverse().find((r) => r.kind === "freebie");
      const trigger = [...all]
        .reverse()
        .find((r) => r.kind === "person" && r.author === actor.account && r.seq > (lastAnswer?.seq ?? 0) && mentionsFreebie(r.text));
      if (!trigger) throw new HttpError(400, "Es gibt keine offene Frage an Freebie. Schreib „@Freebie“ in deinen Beitrag.");
      if (all.filter((r) => r.kind !== "system").length >= GROUPCHAT_LIMITS.messages) throw new HttpError(400, "Der Gruppenchat ist voll. Bitte einen neuen starten.");
      answerId = randomUUID();
      history = all.filter((r) => r.kind !== "system");
      await db.execute(sql`
        WITH v AS (${bump(chatId)})
        INSERT INTO group_chat_messages (id, chat_id, seq, version, kind, author, author_name, status, asked_by, model_id, effort, web_search)
        SELECT ${answerId}, ${chatId}, v.version, v.version, 'freebie', NULL, NULL, 'pending', ${actor.name}, ${opts.modelId}, ${opts.effort}, ${opts.webSearch} FROM v
      `);
    }
  } catch (err) {
    if (pgCode(err) === "23505") throw new HttpError(409, BUSY);
    throw err;
  }
  return { chatId, answerId, history, effort: opts.effort, webSearch: opts.webSearch, previousModelId };
}

/** Speichert die fertige (oder abgebrochene) Antwort – für alle sichtbar beim nächsten Abruf. */
export async function finishAnswer(
  chatId: string,
  answerId: string,
  result: { status: Exclude<GroupAnswerStatus, "pending">; text: string; modelId: string; answer: StoredAnswer; native?: NativeTurn },
): Promise<void> {
  const db = await getDb();
  await db.execute(sql`
    WITH v AS (${bump(chatId)})
    UPDATE group_chat_messages SET status = ${result.status}, text = ${result.text}, model_id = ${result.modelId},
      answer = ${json(result.answer)}::jsonb, native = ${json(result.native)}::jsonb, version = (SELECT version FROM v), updated_at = now()
    WHERE id = ${answerId} AND chat_id = ${chatId} AND status = 'pending' AND EXISTS (SELECT 1 FROM v)
  `);
}

// ---------------------------------------------------------------- Aufräumen

/** „Jetzt beenden“ oder Termin löschen: alle Gruppenchats des Termins (auch die der Kursleitung). */
export async function deleteEventGroupChats(eventId: string): Promise<void> {
  const db = await getDb();
  await db.delete(schema.groupChats).where(eq(schema.groupChats.eventId, eventId));
}

/** Gruppenchats beendeter Termine. */
export async function purgeGroupChats(): Promise<number> {
  const db = await getDb();
  const res = await db.execute(sql`
    DELETE FROM group_chats WHERE event_id IN (
      SELECT id FROM events WHERE LEAST(ends_at, coalesce(ended_early_at, ends_at)) <= now()
    ) RETURNING id
  `);
  return rowsOf(res).length;
}

const purgeState = globalThis as unknown as { freebieGroupChatPurgeAt?: number };

/** Nebenbei aufräumen – höchstens einmal pro Minute und Instanz. */
export async function maybePurgeGroupChats(): Promise<void> {
  const now = Date.now();
  if (purgeState.freebieGroupChatPurgeAt && now - purgeState.freebieGroupChatPurgeAt < 60_000) return;
  purgeState.freebieGroupChatPurgeAt = now;
  await purgeGroupChats();
}
