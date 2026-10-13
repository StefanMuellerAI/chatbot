import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "@/lib/db/client";
import { createEvent, createGroup, deleteGuest, endEventNow, listEvents, purgeExpiredGuests } from "@/lib/events/store";
import {
  candidatesFor,
  createChat,
  deleteChat,
  finishAnswer,
  getChat,
  hideChat,
  leaveChat,
  listChats,
  postMessage,
  purgeGroupChats,
  startAnswer,
  updateChat,
  type Actor,
} from "@/lib/groupchat/store";
import { GROUPCHAT_LIMITS, mentionsFreebie, splitMentions, systemText } from "@/lib/shared/groupchat";

const inMinutes = (m: number) => new Date(Date.now() + m * 60_000);
const ADMIN: Actor = { account: "admin", name: "kursleitung", role: "admin", guestId: null, groupId: null };
const ask = { regenerate: false, modelId: "mock", effort: "medium" as const, webSearch: true };

/** Termin mit zwei Gruppen (A: 4 Gäste, B: 1 Gast). */
async function setup() {
  const eventId = await createEvent({ name: `Gruppenchat ${Math.random()}`, startsAt: inMinutes(-1), endsAt: inMinutes(120) });
  const a = await createGroup(eventId, "Gruppe A", 4);
  const b = await createGroup(eventId, "Gruppe B", 1);
  const event = (await listEvents()).find((e) => e.id === eventId)!;
  const actor = (groupId: string, i: number): Actor => {
    const g = event.groups.find((x) => x.id === groupId)!.guests[i];
    return { account: g.id, name: g.username, role: "guest", guestId: g.id, groupId };
  };
  return { eventId, groupA: a.id, groupB: b.id, a1: actor(a.id, 0), a2: actor(a.id, 1), a3: actor(a.id, 2), a4: actor(a.id, 3), b1: actor(b.id, 0) };
}

const texts = async (actor: Actor, id: string) => (await getChat(actor, id)).messages.filter((m) => m.kind === "person").map((m) => m.text);

describe("Gruppenchat: starten und Rechte", () => {
  it("startet mit Personen der eigenen Gruppe; nur Mitglieder sehen den Chat", async () => {
    const { a1, a2, a3, a4 } = await setup();
    const chat = await createChat(a1, { title: "  Protokoll   Teamrunde ", members: [a2.name.toUpperCase(), ` ${a3.name}@freebie.example`] });
    expect(chat).toMatchObject({ title: "Protokoll Teamrunde", owner: a1.name, mine: true, members: 3 });
    const detail = await getChat(a2, chat.id);
    expect(detail.members).toEqual([a1.name, a2.name, a3.name].sort((x, y) => (x === a1.name ? -1 : y === a1.name ? 1 : x.localeCompare(y))));
    expect(detail.members[0]).toBe(a1.name);
    expect(detail.messages).toHaveLength(1);
    expect(detail.messages[0].system).toEqual({ action: "invite", actor: a1.name, targets: [a2.name, a3.name] });
    expect(systemText(detail.messages[0].system!, a2.name)).toBe(`${a1.name} hat dich und ${a3.name} eingeladen`);
    expect(systemText(detail.messages[0].system!, a1.name)).toBe(`Du hast ${a2.name} und ${a3.name} eingeladen`);
    expect((await listChats(a2)).map((c) => c.id)).toEqual([chat.id]);
    // Nicht eingeladen: weder Liste noch Zugriff.
    expect(await listChats(a4)).toEqual([]);
    await expect(getChat(a4, chat.id)).rejects.toThrow("gibt es nicht");
  });

  it("lehnt fremde Gruppen, fremde Termine, unbekannte Namen und die Kursleitung ab – nichts wird angelegt", async () => {
    const { a1, b1 } = await setup();
    const other = await setup();
    await expect(createChat(a1, { title: "X", members: [b1.name] })).rejects.toThrow("Du kannst nur Personen aus deiner Gruppe einladen");
    await expect(createChat(a1, { title: "X", members: [other.a2.name] })).rejects.toThrow("kann nicht eingeladen werden");
    await expect(createChat(a1, { title: "X", members: ["gibtsnicht99"] })).rejects.toThrow("kann nicht eingeladen werden");
    await expect(createChat(a1, { title: "X", members: ["Kursleitung"] })).rejects.toThrow("„kursleitung“ kann nicht eingeladen werden");
    await expect(createChat(a1, { title: "X", members: [] })).rejects.toThrow("mindestens eine Person");
    await expect(createChat(a1, { title: "X", members: [a1.name] })).rejects.toThrow("mindestens eine Person");
    await expect(createChat(a1, { title: "   ", members: [other.a1.name] })).rejects.toThrow("Namen");
    await expect(createChat(a1, { title: "x".repeat(61), members: [b1.name] })).rejects.toThrow("zu lang");
    expect(await listChats(a1)).toEqual([]);
  });

  it("Kursleitung: Personen genau einer Gruppe eines laufenden Termins", async () => {
    const { groupA, groupB, a1, a2, b1 } = await setup();
    await expect(createChat(ADMIN, { title: "Vorführung", members: [a1.name] })).rejects.toThrow("Gruppe");
    await expect(createChat(ADMIN, { title: "Vorführung", members: [a1.name, b1.name], groupId: groupA })).rejects.toThrow("nur Personen aus einer Gruppe");
    const chat = await createChat(ADMIN, { title: "Vorführung", members: [a1.name, a2.name], groupId: groupA });
    expect(chat.owner).toBe("kursleitung");
    const seen = await getChat(a1, chat.id);
    expect(seen.owner).toBe("kursleitung");
    expect(systemText(seen.messages[0].system!, a1.name)).toBe("Kursleitung hat dich und " + a2.name + " eingeladen");
    const candidates = await candidatesFor(ADMIN);
    expect(candidates.groups.find((g) => g.id === groupB)?.members).toEqual([b1.name]);
    const own = await candidatesFor(a1);
    expect(own.groups).toHaveLength(1);
    expect(own.groups[0].members).not.toContain(a1.name);
    expect(own.groups[0].members).toContain(a2.name);
  });

  it("Grenzen: höchstens 10 eigene Chats", async () => {
    const { a1, a2 } = await setup();
    for (let i = 0; i < GROUPCHAT_LIMITS.ownChats; i++) await createChat(a1, { title: `Chat ${i}`, members: [a2.name] });
    await expect(createChat(a1, { title: "Einer zu viel", members: [a2.name] })).rejects.toThrow("schon 10 Gruppenchats");
  });
});

describe("Gruppenchat: Beiträge, Stand und Gelesen", () => {
  it("liefert mit `since` nur Neues, ordnet nach Eingang und markiert gelesen", async () => {
    const { a1, a2 } = await setup();
    const chat = await createChat(a1, { title: "Notizen", members: [a2.name] });
    const start = await getChat(a2, chat.id);
    await postMessage(a1, chat.id, { text: "TOP 1\r\nRaumplanung\u0007" });
    expect((await listChats(a2))[0].unread).toBe(true);
    // Wer selbst postet, hat den Chat offen – das gilt als gelesen.
    await postMessage(a2, chat.id, { text: "TOP 2 Budget" });
    expect((await listChats(a2))[0].unread).toBe(false);
    const delta = await getChat(a2, chat.id, start.version);
    expect(delta.messages.map((m) => m.text)).toEqual(["TOP 1\nRaumplanung", "TOP 2 Budget"]);
    expect(delta.messages[0].author).toBe(a1.name);
    await postMessage(a1, chat.id, { text: "TOP 3" });
    expect((await listChats(a2))[0].unread).toBe(true);
    await getChat(a2, chat.id);
    expect((await listChats(a2))[0].unread).toBe(false);
    expect((await getChat(a2, chat.id, (await getChat(a2, chat.id)).version)).messages).toEqual([]);
    // Eigene Beiträge zählen nicht als „neu“.
    await postMessage(a1, chat.id, { text: "noch was" });
    expect((await listChats(a1))[0].unread).toBe(false);
  });

  it("prüft Text, Grenzen und Senderate", async () => {
    const { a1, a2 } = await setup();
    const chat = await createChat(a1, { title: "Grenzen", members: [a2.name] });
    await expect(postMessage(a1, chat.id, { text: "   " })).rejects.toThrow("Bitte einen Text eingeben");
    await expect(postMessage(a1, chat.id, { text: "x".repeat(GROUPCHAT_LIMITS.text + 1) })).rejects.toThrow("zu lang");
    for (let i = 0; i < GROUPCHAT_LIMITS.perMinute; i++) await postMessage(a2, chat.id, { text: `Beitrag ${i}` });
    await expect(postMessage(a2, chat.id, { text: "einer zu viel" })).rejects.toMatchObject({ status: 429 });
  });

  it("voll nach 1.000 Beiträgen", async () => {
    const { a1, a2 } = await setup();
    const chat = await createChat(a1, { title: "Voll", members: [a2.name] });
    const db = await getDb();
    await db.execute(sql`
      INSERT INTO group_chat_messages (id, chat_id, seq, version, kind, author, author_name, text)
      SELECT gen_random_uuid()::text, ${chat.id}, 100 + n, 100 + n, 'person', 'x', 'x', 'alt' FROM generate_series(1, ${GROUPCHAT_LIMITS.messages}) AS n
    `);
    await expect(postMessage(a1, chat.id, { text: "noch einer" })).rejects.toThrow("Der Gruppenchat ist voll");
  });
});

describe("Gruppenchat: verwalten, verlassen, löschen", () => {
  it("nur die startende Person lädt ein, entfernt und benennt um", async () => {
    const { a1, a2, a3, a4 } = await setup();
    const chat = await createChat(a1, { title: "Team", members: [a2.name] });
    await expect(updateChat(a2, chat.id, { invite: [a3.name] })).rejects.toThrow("nur die Person, die den Gruppenchat gestartet hat");
    await updateChat(a1, chat.id, { invite: [a3.name, a4.name] });
    await expect(updateChat(a1, chat.id, { invite: [a3.name] })).rejects.toThrow("schon im Gruppenchat");
    await updateChat(a1, chat.id, { title: "Team Bürgerbüro" });
    expect((await getChat(a3, chat.id)).title).toBe("Team Bürgerbüro");
    await expect(updateChat(a1, chat.id, { remove: a1.name })).rejects.toThrow("nicht selbst entfernen");
    await updateChat(a1, chat.id, { remove: a4.name });
    const seen = await getChat(a1, chat.id);
    expect(seen.members).not.toContain(a4.name);
    expect(seen.messages.map((m) => m.system && systemText(m.system, a1.name)).filter(Boolean)).toEqual([
      `Du hast ${a2.name} eingeladen`,
      `Du hast ${a3.name} und ${a4.name} eingeladen`,
      "Du hast den Chat in „Team Bürgerbüro“ umbenannt",
      `Du hast ${a4.name} entfernt`,
    ]);
  });

  it("wer verlässt oder entfernt wird, liest nur bis dahin und schreibt nicht mehr; erneut eingeladen sieht er alles", async () => {
    const { a1, a2, a3 } = await setup();
    const chat = await createChat(a1, { title: "Lesen bis", members: [a2.name, a3.name] });
    await postMessage(a1, chat.id, { text: "vorher" });
    await leaveChat(a2, chat.id);
    await updateChat(a1, chat.id, { remove: a3.name });
    await postMessage(a1, chat.id, { text: "nachher" });
    await updateChat(a1, chat.id, { title: "Neuer Name" });

    const left = await getChat(a2, chat.id);
    expect(left.left).toBe(true);
    expect(left.leftAt).not.toBeNull();
    expect(await texts(a2, chat.id)).toEqual(["vorher"]);
    expect(left.messages.at(-1)?.system).toEqual({ action: "leave", actor: a2.name });
    await expect(postMessage(a2, chat.id, { text: "darf ich?" })).rejects.toMatchObject({ status: 403 });
    await expect(startAnswer(a2, chat.id, ask)).rejects.toMatchObject({ status: 403 });
    const summary = (await listChats(a2))[0];
    expect(summary).toMatchObject({ left: true, unread: false });
    expect(await texts(a3, chat.id)).toEqual(["vorher"]);
    expect((await getChat(a1, chat.id)).members).toEqual([a1.name]);

    await updateChat(a1, chat.id, { invite: [a2.name] });
    expect(await texts(a2, chat.id)).toEqual(["vorher", "nachher"]);
    expect((await getChat(a2, chat.id)).left).toBe(false);
  });

  it("die startende Person kann nicht verlassen; Ausblenden nur nach dem Verlassen; für alle löschen", async () => {
    const { a1, a2 } = await setup();
    const chat = await createChat(a1, { title: "Weg damit", members: [a2.name] });
    await expect(leaveChat(a1, chat.id)).rejects.toMatchObject({ status: 403 });
    await expect(hideChat(a2, chat.id)).rejects.toThrow("Nur verlassene");
    await expect(deleteChat(a2, chat.id)).rejects.toMatchObject({ status: 403 });
    await leaveChat(a2, chat.id);
    await hideChat(a2, chat.id);
    expect(await listChats(a2)).toEqual([]);
    await expect(getChat(a2, chat.id)).rejects.toMatchObject({ status: 404 });
    await deleteChat(a1, chat.id);
    expect(await listChats(a1)).toEqual([]);
  });

  it("verschwindet mit dem Gast, der ihn gestartet hat, mit „Jetzt beenden“ und nach dem Termin-Ende", async () => {
    const { eventId, groupA, a1, a2, a3 } = await setup();
    const byGuest = await createChat(a1, { title: "Von a1", members: [a2.name] });
    const byA2 = await createChat(a2, { title: "Von a2", members: [a1.name, a3.name] });
    await postMessage(a1, byA2.id, { text: "von a1" });
    const byTeacher = await createChat(ADMIN, { title: "Von der Kursleitung", members: [a2.name], groupId: groupA });
    await deleteGuest(a1.account);
    expect((await listChats(a2)).map((c) => c.id).sort()).toEqual([byA2.id, byTeacher.id].sort());
    // Beiträge gelöschter Gäste bleiben mit Namen stehen.
    expect((await getChat(a2, byA2.id)).messages.find((m) => m.kind === "person")?.author).toBe(a1.name);
    expect((await getChat(a2, byA2.id)).members).not.toContain(a1.name);
    void byGuest;
    await endEventNow(eventId);
    const db = await getDb();
    const left = await db.execute(sql`SELECT id FROM group_chats WHERE event_id = ${eventId}`);
    expect((Array.isArray(left) ? left : (left as { rows: unknown[] }).rows)).toHaveLength(0);
    await purgeExpiredGuests();
  });

  it("Aufräumen löscht die Gruppenchats beendeter Termine", async () => {
    const { eventId, a1, a2 } = await setup();
    await createChat(a1, { title: "Bald vorbei", members: [a2.name] });
    const db = await getDb();
    await db.execute(sql`UPDATE events SET ends_at = now() - interval '1 minute', starts_at = now() - interval '2 hours' WHERE id = ${eventId}`);
    expect(await purgeGroupChats()).toBeGreaterThanOrEqual(1);
    const rest = await db.execute(sql`SELECT id FROM group_chats WHERE event_id = ${eventId}`);
    expect((Array.isArray(rest) ? rest : (rest as { rows: unknown[] }).rows)).toHaveLength(0);
  });
});

describe("Gruppenchat: Antworten von Freebie", () => {
  it("antwortet nur auf eine eigene, offene Frage mit @Freebie; eine Antwort zur Zeit", async () => {
    const { a1, a2 } = await setup();
    const chat = await createChat(a1, { title: "Fragen", members: [a2.name] });
    await postMessage(a1, chat.id, { text: "Notizen ohne Frage" });
    await expect(startAnswer(a1, chat.id, ask)).rejects.toThrow("keine offene Frage");
    await postMessage(a2, chat.id, { text: "@Freebie fasse zusammen" });
    // Die Frage von a2 kann a1 nicht auslösen.
    await expect(startAnswer(a1, chat.id, ask)).rejects.toThrow("keine offene Frage");
    const job = await startAnswer(a2, chat.id, ask);
    expect(job.history.map((r) => r.text)).toEqual(["Notizen ohne Frage", "@Freebie fasse zusammen"]);
    await postMessage(a1, chat.id, { text: "@freebie und ich?" });
    await expect(startAnswer(a1, chat.id, ask)).rejects.toMatchObject({ status: 409 });
    const pending = (await getChat(a1, chat.id)).messages.find((m) => m.kind === "freebie");
    expect(pending).toMatchObject({ status: "pending", askedBy: a2.name });

    await finishAnswer(chat.id, job.answerId, { status: "done", text: "Zusammenfassung", modelId: "mock", answer: { stopReason: "end_turn" } });
    const done = (await getChat(a2, chat.id)).messages.find((m) => m.kind === "freebie");
    expect(done).toMatchObject({ status: "done", text: "Zusammenfassung", modelId: "mock" });
    // Der Beitrag während der Antwort gehört zur nächsten Runde – jetzt darf a1 fragen.
    const next = await startAnswer(a1, chat.id, ask);
    expect(next.history.map((r) => r.kind)).toEqual(["person", "person", "freebie", "person"]);
  });

  it("Neu generieren nur bei der letzten Antwort, solange danach nichts kam", async () => {
    const { a1, a2 } = await setup();
    const chat = await createChat(a1, { title: "Nochmal", members: [a2.name] });
    await postMessage(a1, chat.id, { text: "@Freebie hallo" });
    const job = await startAnswer(a1, chat.id, ask);
    await finishAnswer(chat.id, job.answerId, { status: "error", text: "", modelId: "mock", answer: { error: "kaputt" } });
    const again = await startAnswer(a2, chat.id, { ...ask, regenerate: true });
    expect(again.answerId).toBe(job.answerId);
    expect(again.history.map((r) => r.text)).toEqual(["@Freebie hallo"]);
    await finishAnswer(chat.id, again.answerId, { status: "done", text: "Hallo!", modelId: "mock", answer: {} });
    await postMessage(a2, chat.id, { text: "danke" });
    await expect(startAnswer(a1, chat.id, { ...ask, regenerate: true })).rejects.toThrow("nur bei der letzten Antwort");
  });

  it("gibt eine hängengebliebene Antwort nach der Frist frei", async () => {
    const { a1, a2 } = await setup();
    const chat = await createChat(a1, { title: "Hängt", members: [a2.name] });
    await postMessage(a1, chat.id, { text: "@Freebie eins" });
    await startAnswer(a1, chat.id, ask);
    await postMessage(a2, chat.id, { text: "@Freebie zwei" });
    await expect(startAnswer(a2, chat.id, ask)).rejects.toMatchObject({ status: 409 });
    const db = await getDb();
    await db.execute(sql`UPDATE group_chat_messages SET updated_at = now() - interval '7 minutes' WHERE chat_id = ${chat.id} AND status = 'pending'`);
    await startAnswer(a2, chat.id, ask);
    const first = (await getChat(a1, chat.id)).messages.filter((m) => m.kind === "freebie");
    expect(first[0]).toMatchObject({ status: "error" });
    expect(first[0].error).toContain("unterbrochen");
    expect(first[1]).toMatchObject({ status: "pending", askedBy: a2.name });
  });

  it("wer verlassen hat, sieht laufende und spätere Antworten nicht", async () => {
    const { a1, a2 } = await setup();
    const chat = await createChat(a1, { title: "Antwort danach", members: [a2.name] });
    await postMessage(a1, chat.id, { text: "@Freebie los" });
    const job = await startAnswer(a1, chat.id, ask);
    await leaveChat(a2, chat.id);
    await finishAnswer(chat.id, job.answerId, { status: "done", text: "fertig", modelId: "mock", answer: {} });
    expect((await getChat(a2, chat.id)).messages.filter((m) => m.kind === "freebie")).toEqual([]);
  });
});

describe("Gruppenchat: Erwähnungen", () => {
  it("erkennt @Freebie nur als eigenes Wort", () => {
    expect(mentionsFreebie("@Freebie fasse zusammen")).toBe(true);
    expect(mentionsFreebie("Hallo @freebie, bitte")).toBe(true);
    expect(mentionsFreebie("Frage an\n@FREEBIE")).toBe(true);
    expect(mentionsFreebie("freebie@freebie.example")).toBe(false);
    expect(mentionsFreebie("@Freebies Antwort")).toBe(false);
    expect(mentionsFreebie("Ohne Erwähnung")).toBe(false);
    expect(splitMentions("Hi @Freebie, und @freebie!")).toEqual([
      { text: "Hi ", mention: false },
      { text: "@Freebie", mention: true },
      { text: ", und ", mention: false },
      { text: "@freebie", mention: true },
      { text: "!", mention: false },
    ]);
  });
});
