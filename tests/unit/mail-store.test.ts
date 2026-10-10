import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "@/lib/db/client";
import { createEvent, createGroup, deleteGroup, deleteGuest, endEventNow, listEvents } from "@/lib/events/store";
import {
  contactsFor,
  deleteMail,
  deleteMailbox,
  ensureWelcomeMail,
  getMail,
  listMails,
  markRead,
  mailStatus,
  purgeMail,
  sendMail,
  type Mailbox,
} from "@/lib/mail/store";
import { DEFAULT_SETTINGS } from "@/lib/shared/settings-defaults";
import { MAIL_LIMITS } from "@/lib/shared/mail";

const inMinutes = (m: number) => new Date(Date.now() + m * 60_000);
const ADMIN: Mailbox = { owner: "admin", local: "kursleitung", role: "admin", guestId: null, eventId: null, groupId: null };

/** Termin mit zwei Gruppen (A: 3 Gäste, B: 1 Gast); liefert die Postfächer. */
async function setup() {
  const eventId = await createEvent({ name: `Mailtest ${Math.random()}`, startsAt: inMinutes(-1), endsAt: inMinutes(120) });
  const a = await createGroup(eventId, "Gruppe A", 3);
  const b = await createGroup(eventId, "Gruppe B", 1);
  const event = (await listEvents()).find((e) => e.id === eventId)!;
  const box = (groupId: string, i: number): Mailbox => {
    const g = event.groups.find((x) => x.id === groupId)!.guests[i];
    return { owner: g.id, local: g.username, role: "guest", guestId: g.id, eventId, groupId };
  };
  return { eventId, groupA: a.id, groupB: b.id, a1: box(a.id, 0), a2: box(a.id, 1), a3: box(a.id, 2), b1: box(b.id, 0) };
}

const inbox = async (box: Mailbox) => (await listMails(box, { folder: "inbox" })).mails;
const sent = async (box: Mailbox) => (await listMails(box, { folder: "sent" })).mails;

describe("Posteingang: Zustellung", () => {
  it("legt je Postfach eine Kopie an: Gesendet bei der Absenderin, Posteingang bei An und Cc", async () => {
    const { a1, a2, a3 } = await setup();
    const mail = await sendMail(a1, { to: [a2.local.toUpperCase()], cc: [`${a3.local}@freebie.example`], subject: "Raum am Dienstag", body: "Hallo zusammen,\r\nwie sieht's aus?" });
    expect(mail.folder).toBe("sent");
    expect(mail.to).toEqual([a2.local]);
    expect(mail.cc).toEqual([a3.local]);
    expect(mail.body).toBe("Hallo zusammen,\nwie sieht's aus?");
    expect(await sent(a1)).toHaveLength(1);
    const got = await inbox(a2);
    expect(got).toHaveLength(1);
    expect(got[0]).toMatchObject({ from: a1.local, subject: "Raum am Dienstag", read: false, viaFreebie: false });
    expect(await inbox(a3)).toHaveLength(1);
    expect(await mailStatus(a2)).toMatchObject({ unread: 1, latest: { from: a1.local, subject: "Raum am Dienstag" } });
    expect(await inbox(a1)).toHaveLength(0);
  });

  it("an sich selbst: Kopie in Gesendet und im Posteingang", async () => {
    const { a1 } = await setup();
    await sendMail(a1, { to: [a1.local], subject: "Notiz", body: "Für mich" });
    expect(await sent(a1)).toHaveLength(1);
    expect(await inbox(a1)).toHaveLength(1);
  });

  it("Gäste schreiben nur der eigenen Gruppe und der Kursleitung", async () => {
    const { eventId, a1, b1 } = await setup();
    const other = await setup();
    await expect(sendMail(a1, { to: [b1.local], subject: "x", body: "y" })).rejects.toThrow("Du kannst nur deiner Gruppe und der Kursleitung schreiben");
    await expect(sendMail(a1, { to: [other.a1.local], subject: "x", body: "y" })).rejects.toThrow("kann nicht zugestellt werden");
    await expect(sendMail(a1, { to: ["gibtsnicht99"], subject: "x", body: "y" })).rejects.toThrow("kann nicht zugestellt werden");
    await expect(sendMail(a1, { to: ["jemand@gmail.com"], subject: "x", body: "y" })).rejects.toThrow("keine Adresse in Freebie");
    // Nichts wurde verschickt, auch nicht an gültige Empfänger derselben Mail.
    await expect(sendMail(a1, { to: [a1.local, b1.local], subject: "x", body: "y" })).rejects.toThrow();
    expect(await sent(a1)).toHaveLength(0);

    await sendMail(a1, { to: ["Kursleitung"], subject: "Frage", body: "Wann ist Pause?" });
    const teacher = await listMails(ADMIN, { folder: "inbox", query: "Wann ist Pause" });
    expect(teacher.mails).toHaveLength(1);
    expect(teacher.mails[0].from).toBe(a1.local);
    // Die Kopie der Kursleitung gehört zum Termin der Absenderin (wird mit ihm gelöscht).
    const db = await getDb();
    const rows = (await db.execute(sql`SELECT event_id FROM mails WHERE owner = 'admin' AND subject = 'Frage'`)) as unknown as { rows?: { event_id: string }[] };
    expect((rows.rows ?? (rows as unknown as { event_id: string }[]))[0].event_id).toBe(eventId);
  });

  it("die Kursleitung schreibt an laufende Termine, aber nicht über Termine hinweg", async () => {
    const one = await setup();
    const two = await setup();
    await sendMail(ADMIN, { to: [one.a1.local, one.b1.local], subject: "Rundmail", body: "Bitte alle Aufgabe 2 lösen." });
    expect(await inbox(one.a1)).toHaveLength(1);
    expect(await inbox(one.b1)).toHaveLength(1);
    await expect(sendMail(ADMIN, { to: [one.a1.local, two.a1.local], subject: "x", body: "y" })).rejects.toThrow("nur an Personen eines Termins");
    await expect(sendMail(ADMIN, { to: ["gibtsnicht99"], subject: "x", body: "y" })).rejects.toThrow("keinen Gast mit diesem Namen");
  });

  it("Prüfungen und Grenzen", async () => {
    const { a1, a2 } = await setup();
    await expect(sendMail(a1, { to: [], subject: "x", body: "y" })).rejects.toThrow("mindestens einen Empfänger");
    await expect(sendMail(a1, { to: [a2.local], subject: "  ", body: "\n " })).rejects.toThrow("Betreff oder Text");
    await expect(sendMail(a1, { to: [a2.local], subject: "x".repeat(MAIL_LIMITS.subject + 1), body: "" })).rejects.toThrow("Betreff ist zu lang");
    await expect(sendMail(a1, { to: [a2.local], subject: "x", body: "y".repeat(MAIL_LIMITS.body + 1) })).rejects.toThrow("Text ist zu lang");
    const many = Array.from({ length: MAIL_LIMITS.recipients + 1 }, (_, i) => `name${i}`);
    await expect(sendMail(a1, { to: many, subject: "x", body: "y" })).rejects.toThrow(`Höchstens ${MAIL_LIMITS.recipients} Empfänger`);
    // Steuerzeichen raus, Betreff einzeilig.
    const mail = await sendMail(a1, { to: [a2.local], subject: "Zeile 1\nZeile 2", body: "a\u0000b\u0007c" });
    expect(mail.subject).toBe("Zeile 1 Zeile 2");
    expect(mail.body).toBe("abc");
  });

  it(`höchstens ${MAIL_LIMITS.perMinute} Mails pro Minute`, async () => {
    const { a1 } = await setup();
    for (let i = 0; i < MAIL_LIMITS.perMinute; i++) await sendMail(a1, { to: [a1.local], subject: `Nr. ${i}`, body: "" });
    await expect(sendMail(a1, { to: [a1.local], subject: "eine zu viel", body: "" })).rejects.toThrow("Bitte warte eine Minute");
  });
});

describe("Posteingang: Lesen und Löschen", () => {
  it("gelesen/ungelesen, fremde IDs ergeben „nicht gefunden“, Löschen trifft nur die eigene Kopie", async () => {
    const { a1, a2, a3 } = await setup();
    await sendMail(a1, { to: [a2.local, a3.local], subject: "Protokoll", body: "Punkt 1" });
    const [mailA2] = await inbox(a2);
    await markRead(a2, mailA2.id, true);
    expect((await mailStatus(a2)).unread).toBe(0);
    await markRead(a2, mailA2.id, false);
    expect((await mailStatus(a2)).unread).toBe(1);
    expect((await getMail(a2, mailA2.id)).body).toBe("Punkt 1");
    await expect(getMail(a3, mailA2.id)).rejects.toThrow("gibt es nicht");
    await expect(markRead(a3, mailA2.id, true)).rejects.toThrow("gibt es nicht");
    await expect(deleteMail(a3, mailA2.id)).rejects.toThrow("gibt es nicht");
    await deleteMail(a2, mailA2.id);
    expect(await inbox(a2)).toHaveLength(0);
    expect(await inbox(a3)).toHaveLength(1);
    expect(await sent(a1)).toHaveLength(1);
  });

  it("Suche in Betreff, Text und Adressen; Platzhalter gelten als Text", async () => {
    const { a1, a2 } = await setup();
    await sendMail(a1, { to: [a2.local], subject: "Angebot Schulungsraum", body: "890 € netto" });
    await sendMail(a1, { to: [a2.local], subject: "Mittag", body: "100% Kantine" });
    expect((await listMails(a2, { folder: "inbox", query: "schulungsraum" })).mails).toHaveLength(1);
    expect((await listMails(a2, { folder: "inbox", query: "890 €" })).mails).toHaveLength(1);
    expect((await listMails(a2, { folder: "inbox", query: a1.local })).mails).toHaveLength(2);
    expect((await listMails(a2, { folder: "inbox", query: "100%" })).mails).toHaveLength(1);
    expect((await listMails(a2, { folder: "inbox", query: "%" })).mails).toHaveLength(1);
    expect((await listMails(a1, { folder: "sent", query: a2.local })).mails).toHaveLength(2);
  });
});

describe("Posteingang: Löschregeln", () => {
  it("Abmelden löscht das eigene Postfach; Mails an andere bleiben bei ihnen", async () => {
    const { a1, a2 } = await setup();
    await sendMail(a1, { to: [a2.local], subject: "Hallo", body: "x" });
    await sendMail(a2, { to: [a1.local], subject: "Hallo zurück", body: "y" });
    expect(await deleteMailbox(a1.owner)).toBe(2);
    expect(await inbox(a1)).toHaveLength(0);
    expect(await sent(a1)).toHaveLength(0);
    expect(await inbox(a2)).toHaveLength(1);
    expect(await sent(a2)).toHaveLength(1);
  });

  it("„Jetzt beenden“ löscht alle Mails des Termins, auch bei der Kursleitung", async () => {
    const { eventId, a1, a2 } = await setup();
    await sendMail(a1, { to: [a2.local, "kursleitung"], subject: `Ende ${eventId}`, body: "x" });
    expect((await listMails(ADMIN, { folder: "inbox", query: eventId })).mails).toHaveLength(1);
    await endEventNow(eventId);
    expect((await listMails(ADMIN, { folder: "inbox", query: eventId })).mails).toHaveLength(0);
    expect(await inbox(a2)).toHaveLength(0);
  });

  it("Gast oder Gruppe löschen entfernt deren Postfächer", async () => {
    const { groupB, a1, a2, b1 } = await setup();
    await sendMail(a1, { to: [a2.local], subject: "x", body: "y" });
    await sendMail(b1, { to: [b1.local], subject: "Notiz", body: "y" });
    await deleteGuest(a2.owner);
    expect(await inbox(a2)).toHaveLength(0);
    expect(await sent(a1)).toHaveLength(1);
    await deleteGroup(groupB);
    expect(await inbox(b1)).toHaveLength(0);
  });

  it("Aufräumen: beendete Termine und alte Notizen der Kursleitung an sich selbst", async () => {
    // Ein Termin, der gleich als abgelaufen gilt (Ende wird in die Vergangenheit gesetzt).
    const { eventId, a1 } = await setup();
    await sendMail(a1, { to: [a1.local], subject: "Vorbei", body: "z" });
    await sendMail(ADMIN, { to: ["kursleitung"], subject: "Notiz alt", body: "x" });
    await sendMail(ADMIN, { to: ["kursleitung"], subject: "Notiz neu", body: "y" });
    const db = await getDb();
    await db.execute(sql`UPDATE mails SET sent_at = now() - interval '25 hours' WHERE owner = 'admin' AND subject = 'Notiz alt'`);
    await db.execute(sql`UPDATE events SET ends_at = now() - interval '1 minute' WHERE id = ${eventId}`);
    expect(await purgeMail()).toBe(4);
    expect((await listMails(ADMIN, { folder: "inbox", query: "Notiz" })).mails.map((m) => m.subject)).toEqual(["Notiz neu"]);
    expect(await inbox(a1)).toHaveLength(0);
  });
});

describe("Posteingang: Begrüßung und Adressbuch", () => {
  it("Begrüßungs-E-Mail einmal je Postfach, auch wenn schon andere geschrieben haben; leer eingestellt: keine", async () => {
    const { a1, a2, a3 } = await setup();
    await sendMail(a3, { to: [a1.local], subject: "Schon vor dir da", body: "x" });
    await ensureWelcomeMail(a1, DEFAULT_SETTINGS);
    await ensureWelcomeMail(a1, DEFAULT_SETTINGS);
    const mails = await inbox(a1);
    expect(mails).toHaveLength(2);
    expect(mails.filter((m) => m.from === "kursleitung")).toEqual([expect.objectContaining({ subject: DEFAULT_SETTINGS.mailWelcomeSubject, read: false })]);
    await ensureWelcomeMail(a2, { ...DEFAULT_SETTINGS, mailWelcomeSubject: "", mailWelcomeText: " " });
    await ensureWelcomeMail(a2, { ...DEFAULT_SETTINGS, features: { ...DEFAULT_SETTINGS.features, mailbox: false } });
    expect(await inbox(a2)).toHaveLength(0);
    await ensureWelcomeMail(ADMIN, DEFAULT_SETTINGS);
    expect((await listMails(ADMIN, { folder: "inbox", query: DEFAULT_SETTINGS.mailWelcomeSubject })).mails).toHaveLength(0);
  });

  it("Gäste sehen ihre Gruppe und die Kursleitung, die Kursleitung alle laufenden Gruppen", async () => {
    const { a1, a2, a3, b1 } = await setup();
    const own = await contactsFor(a1);
    expect(own.me.address).toBe(`${a1.local}@freebie.example`);
    expect(own.teacher?.name).toBe("Kursleitung");
    expect(own.groups).toHaveLength(1);
    expect(own.groups[0].name).toBe("Gruppe A");
    expect(own.groups[0].members.map((m) => m.local).sort()).toEqual([a2.local, a3.local].sort());
    const teacher = await contactsFor(ADMIN);
    expect(teacher.teacher).toBeNull();
    const locals = teacher.groups.flatMap((g) => g.members.map((m) => m.local));
    expect(locals).toEqual(expect.arrayContaining([a1.local, b1.local]));
  });
});
