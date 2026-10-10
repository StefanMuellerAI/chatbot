import { describe, expect, it } from "vitest";
import {
  addGuests,
  checkGuestLogin,
  createEvent,
  createGroup,
  deleteGuest,
  endEventNow,
  guestSessionValid,
  listEvents,
  resetGuestPassword,
  updateEvent,
} from "@/lib/events/store";

const inMinutes = (m: number) => new Date(Date.now() + m * 60_000);

async function eventWithGuests(count: number, start = inMinutes(-1)) {
  const id = await createEvent({ name: "Testtermin", startsAt: start, endsAt: inMinutes(120) });
  const { id: groupId } = await createGroup(id, "Gruppe A", count);
  const event = (await listEvents()).find((e) => e.id === id)!;
  return { id, groupId, event, guests: event.groups[0].guests };
}

describe("Termine, Gruppen und Gäste", () => {
  it("legt Gäste mit lesbaren Zugangsdaten an, die sich anmelden können", async () => {
    const { event, guests } = await eventWithGuests(3);
    expect(event.status).toBe("laeuft");
    expect(event.guestTotal).toBe(3);
    expect(guests).toHaveLength(3);
    for (const g of guests) {
      expect(g.username).toMatch(/^[a-z]+[2-9]{2,3}$/);
      expect(g.password).toMatch(/^[a-z]+[2-9]{3}$/);
    }
    const ok = await checkGuestLogin(` ${guests[0].username.toUpperCase()} `, guests[0].password!);
    expect(ok.ok).toBe(true);
    expect(await checkGuestLogin(guests[0].username, "falsch222")).toEqual({ ok: false, reason: "falsch" });
    expect(await checkGuestLogin("gibtsnicht22", "egal222")).toEqual({ ok: false, reason: "falsch" });
    expect((await listEvents()).find((e) => e.id === event.id)!.guestsLoggedIn).toBe(1);
  });

  it("vor Beginn: Anmeldung erst 30 Minuten vorher", async () => {
    const { guests } = await eventWithGuests(1, inMinutes(45));
    const early = await checkGuestLogin(guests[0].username, guests[0].password!);
    expect(early).toMatchObject({ ok: false, reason: "zu-frueh" });
  });

  it("„Jetzt beenden“ löscht die Zugänge und beendet Sitzungen sofort", async () => {
    const { id, guests } = await eventWithGuests(2);
    const login = await checkGuestLogin(guests[0].username, guests[0].password!);
    expect(login.ok).toBe(true);
    const guestId = (login as { guest: { id: string } }).guest.id;
    expect(await guestSessionValid(guestId)).toBe(true);
    await endEventNow(id);
    expect(await guestSessionValid(guestId)).toBe(false);
    expect(await checkGuestLogin(guests[0].username, guests[0].password!)).toEqual({ ok: false, reason: "falsch" });
    const ended = (await listEvents()).find((e) => e.id === id)!;
    expect(ended.status).toBe("vorbei");
    expect(ended.groups[0].guests).toEqual([]);
    expect(ended.guestTotal).toBe(2);
    await expect(updateEvent(id, { name: "x", startsAt: inMinutes(0), endsAt: inMinutes(60) })).rejects.toThrow("schon vorbei");
  });

  it("neues Passwort, Gast löschen und nachlegen", async () => {
    const { id, groupId, guests } = await eventWithGuests(2);
    const fresh = await resetGuestPassword(guests[0].id);
    expect(fresh).not.toBe(guests[0].password);
    expect((await checkGuestLogin(guests[0].username, guests[0].password!)).ok).toBe(false);
    expect((await checkGuestLogin(guests[0].username, fresh)).ok).toBe(true);
    await deleteGuest(guests[1].id);
    await addGuests(groupId, 5);
    const event = (await listEvents()).find((e) => e.id === id)!;
    expect(event.groups[0].guests).toHaveLength(6);
    expect(event.guestTotal).toBe(6);
    await expect(addGuests(groupId, 0)).rejects.toThrow("1 bis 200");
    await expect(addGuests(groupId, 201)).rejects.toThrow("1 bis 200");
  });

  it("Prüfregeln für Termine", async () => {
    await expect(createEvent({ name: "x", startsAt: inMinutes(60), endsAt: inMinutes(30) })).rejects.toThrow("Das Ende muss nach dem Beginn liegen.");
    await expect(createEvent({ name: "x", startsAt: inMinutes(0), endsAt: inMinutes(24 * 60 + 1) })).rejects.toThrow("höchstens 24 Stunden");
    await expect(createEvent({ name: "x", startsAt: inMinutes(-120), endsAt: inMinutes(-60) })).rejects.toThrow("Vergangenheit");
  });

  it("Benutzernamen bleiben über alle Termine eindeutig", async () => {
    const a = await eventWithGuests(40);
    const b = await eventWithGuests(40);
    const names = [...a.guests, ...b.guests].map((g) => g.username);
    expect(new Set(names).size).toBe(80);
  });
});
