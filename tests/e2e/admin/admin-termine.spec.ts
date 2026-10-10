import { readFileSync } from "node:fs";
import type { Locator, Page } from "@playwright/test";
import { AdminApi, expect, inMinutes, loginUser, openAdmin, openChat, test, uniq } from "../support/fixtures";
import { CRON_SECRET } from "../support/servers.mjs";

// T01–T08: Termine, Gruppen und Gäste im Admin-Bereich.

/** Datum und Uhrzeit in deutscher Ortszeit (wie im Browser der Tests). */
function berlin(offsetMinutes: number): { date: string; time: string } {
  const d = new Date(Date.now() + offsetMinutes * 60_000);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

const iso = inMinutes;
const card = (page: Page, name: string) => page.getByRole("region", { name: `Termin „${name}“` });
const group = (scope: Page | Locator, name: string) => scope.getByRole("group", { name: `Gruppe „${name}“` });
const rows = (scope: Locator) => scope.getByRole("row").filter({ has: scope.page().getByRole("cell") });

const apiEvent = (admin: AdminApi, name: string, start = -5, end = 120) => admin.createEvent(name, start, end);
const apiGroup = (admin: AdminApi, eventId: string, name: string, count: number) => admin.createGroup(eventId, name, count);

test.describe("T · Termine im Admin", () => {
  test("T01 Termin anlegen mit Prüfungen auf Deutsch", async ({ page }) => {
    await openAdmin(page, "Termine");
    await page.getByRole("button", { name: "Termin anlegen" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Termin anlegen" })).toBeVisible();
    const save = dialog.getByRole("button", { name: "Speichern" });
    await expect(save).toBeDisabled();

    // Vergangenheit
    const yesterday = berlin(-24 * 60);
    await dialog.getByLabel("Name").fill("Gestern");
    await dialog.getByLabel("Datum").fill(yesterday.date);
    await dialog.getByLabel("von").fill("09:00");
    await dialog.getByLabel("bis").fill("10:00");
    await save.click();
    await expect(dialog.getByText("Das Ende liegt in der Vergangenheit.")).toBeVisible();

    // „bis“ vor „von“: Ende am Folgetag
    await dialog.getByLabel("von").fill("22:00");
    await dialog.getByLabel("bis").fill("02:00");
    await expect(dialog.getByText("Das Ende liegt am Folgetag.")).toBeVisible();

    // Läuft jetzt
    const name = `KI-Grundlagen ${uniq()}`;
    const start = berlin(-5);
    const end = berlin(120);
    await dialog.getByLabel("Name").fill(name);
    await dialog.getByLabel("Datum").fill(start.date);
    await dialog.getByLabel("von").fill(start.time);
    await dialog.getByLabel("bis").fill(end.time);
    await save.click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /^Läuft \(\d+\)$/ })).toHaveAttribute("aria-pressed", "true");
    const c = card(page, name);
    await expect(c).toContainText("läuft");
    await expect(c).toContainText(`${start.time}–${end.time} Uhr`);
    await expect(c).toContainText("0 Gruppen · 0 Gäste · 0 angemeldet");
    await expect(c.getByText("Noch keine Gruppen")).toBeVisible();
  });

  test("T01/T18 Termine über 24 Stunden und ohne Namen lehnt die API ab", async ({ admin }) => {
    const res = await admin.api.post("/api/admin/events", { data: { name: "Zu lang", startsAt: iso(0), endsAt: iso(24 * 60 + 5) } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Ein Termin dauert höchstens 24 Stunden.");
    const noName = await admin.api.post("/api/admin/events", { data: { name: " ", startsAt: iso(0), endsAt: iso(60) } });
    expect((await noName.json()).error).toBe("Name: darf nicht leer sein");
    const order = await admin.api.post("/api/admin/events", { data: { name: "Falsch rum", startsAt: iso(60), endsAt: iso(30) } });
    expect((await order.json()).error).toBe("Das Ende muss nach dem Beginn liegen.");
    for (const [method, url] of [
      ["DELETE", "/api/admin/events?id=gibtesnicht"],
      ["DELETE", "/api/admin/events/groups?id=gibtesnicht"],
      ["DELETE", "/api/admin/events/guests?id=gibtesnicht"],
    ] as const) {
      const r = await admin.api.fetch(url, { method });
      expect(r.status(), url).toBe(404);
    }
    const end = await admin.api.post("/api/admin/events/end", { data: { id: "gibtesnicht" } });
    expect(end.status()).toBe(404);
    expect((await end.json()).error).toBe("Termin nicht gefunden.");
    const pw = await admin.api.post("/api/admin/events/guests/password", { data: { id: "gibtesnicht" } });
    expect((await pw.json()).error).toBe("Gast nicht gefunden.");
    const many = await admin.api.post("/api/admin/events/guests", { data: { groupId: "x", count: 201 } });
    expect((await many.json()).error).toBe("Anzahl der Gäste: höchstens 200");
  });

  test("T02/T03 Gruppen und Gäste: anlegen, nachlegen, Passwort neu, löschen, umbenennen", async ({ page, admin }) => {
    const name = `Gruppentermin ${uniq()}`;
    await apiEvent(admin, name);
    await openAdmin(page, "Termine");
    const c = card(page, name);
    await c.getByRole("button", { name: `Gruppe zu „${name}“ hinzufügen` }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Name der Gruppe").fill("Gruppe A");
    await dialog.getByLabel("Anzahl der Gäste").fill("3");
    await dialog.getByRole("button", { name: "Anlegen" }).click();
    await expect(dialog).toBeHidden();
    const g = group(c, "Gruppe A");
    await expect(rows(g)).toHaveCount(3);
    await expect(c).toContainText("1 Gruppe · 3 Gäste");

    // Zugangsdaten sind einfach und zunächst verdeckt.
    for (const cell of await rows(g).locator("td:nth-child(1)").allInnerTexts()) expect(cell).toMatch(/^[a-z]+[2-9]{2,3}$/);
    await expect(rows(g).first().locator("td").nth(1)).toHaveText("••••••••");
    await g.getByRole("button", { name: "Passwörter in „Gruppe A“ zeigen" }).click();
    const passwords = await rows(g).locator("td:nth-child(2)").allInnerTexts();
    for (const pw of passwords) expect(pw).toMatch(/^[a-z]+[2-9]{3}$/);

    // Nachlegen
    await g.getByLabel("Weitere Gäste für „Gruppe A“").fill("2");
    await g.getByRole("button", { name: "Gäste zu „Gruppe A“ hinzufügen" }).click();
    await expect(rows(g)).toHaveCount(5);

    // Neues Passwort für den ersten Gast
    const first = (await rows(g).first().locator("td").first().innerText()).trim();
    const before = (await rows(g).first().locator("td").nth(1).innerText()).trim();
    page.once("dialog", (d) => {
      expect(d.message()).toBe(`Neues Passwort für ${first} erzeugen? Das alte gilt dann nicht mehr.`);
      void d.accept();
    });
    await g.getByRole("button", { name: `Neues Passwort für ${first}` }).click();
    await expect(rows(g).first().locator("td").nth(1)).not.toHaveText(before);

    // Einzelnen Gast löschen (abbrechen, dann bestätigen)
    page.once("dialog", (d) => void d.dismiss());
    await g.getByRole("button", { name: `${first} löschen` }).click();
    await expect(rows(g)).toHaveCount(5);
    page.once("dialog", (d) => void d.accept());
    await g.getByRole("button", { name: `${first} löschen` }).click();
    await expect(rows(g)).toHaveCount(4);
    await g.getByRole("button", { name: "Passwörter in „Gruppe A“ verbergen" }).click();
    await expect(rows(g).first().locator("td").nth(1)).toHaveText("••••••••");

    // Umbenennen
    page.once("dialog", (d) => void d.accept("Vormittag"));
    await g.getByRole("button", { name: "Gruppe „Gruppe A“ umbenennen" }).click();
    const renamed = group(c, "Vormittag");
    await expect(rows(renamed)).toHaveCount(4);

    // Gruppe löschen
    page.once("dialog", (d) => {
      expect(d.message()).toBe("Gruppe „Vormittag“ mit allen Gästen löschen? Ihre Sitzungen enden sofort.");
      void d.accept();
    });
    await renamed.getByRole("button", { name: "Gruppe „Vormittag“ löschen" }).click();
    await expect(renamed).toHaveCount(0);
    await expect(c).toContainText("0 Gruppen");
  });

  test("T02 Gruppe löschen beendet die Sitzungen ihrer Gäste sofort", async ({ page, admin, browser, baseURL, ip }) => {
    const eventId = await apiEvent(admin, `Löschtermin ${uniq()}`);
    const { id: groupId, guests } = await apiGroup(admin, eventId, "Weg damit", 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    await chat.ask(`Noch da ${uniq()}`);
    await admin.json("DELETE", `/api/admin/events/groups?id=${groupId}`);
    await chat.send(`Und jetzt? ${uniq()}`);
    await expect(chat.page).toHaveURL(/\/login$/);
    // Den Zugang gibt es nicht mehr: Hinweis, und die Chats verschwinden vom Gerät.
    await expect(chat.page.getByText("Dein Zugang ist abgelaufen.")).toBeVisible();
    await expect
      .poll(() => chat.page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name)))
      .not.toContain(`freebie-g-${guests[0].id}`);
    void page;
  });

  test("T04 Zugangsdaten als CSV und als Kärtchen zum Drucken", async ({ page, admin }) => {
    const name = `Drucktermin ${uniq()}`;
    const eventId = await apiEvent(admin, name);
    const a = await apiGroup(admin, eventId, "Gruppe A", 3);
    await apiGroup(admin, eventId, "Gruppe B", 2);
    await openAdmin(page, "Termine");
    const c = card(page, name);

    const download = page.waitForEvent("download");
    await group(c, "Gruppe A").getByRole("button", { name: "Zugangsdaten für „Gruppe A“ als CSV" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe(`zugangsdaten-drucktermin-${name.split(" ")[1]}-gruppe-a.csv`);
    const csv = readFileSync(await file.path(), "utf8");
    expect(csv.startsWith("﻿Benutzername;Passwort;Gruppe;Termin;Gültig bis\r\n")).toBe(true);
    const lines = csv.trim().split("\r\n").slice(1);
    expect(lines).toHaveLength(3);
    for (const guest of a.guests) expect(lines).toContainEqual(expect.stringMatching(new RegExp(`^${guest.username};${guest.password};Gruppe A;${name};`)));

    const all = page.waitForEvent("download");
    await c.getByRole("button", { name: `Zugangsdaten für „${name}“ als CSV` }).click();
    expect(readFileSync(await (await all).path(), "utf8").trim().split("\r\n")).toHaveLength(1 + 5);

    const popup = page.waitForEvent("popup");
    await group(c, "Gruppe A").getByRole("button", { name: "Zugangsdaten für „Gruppe A“ drucken" }).click();
    const print = await popup;
    await expect(print.getByRole("heading", { name: `Zugangsdaten: ${name}` })).toBeVisible();
    const cards = print.getByRole("list", { name: "Zugangskärtchen" }).getByRole("listitem");
    await expect(cards).toHaveCount(3);
    const first = cards.filter({ hasText: a.guests[0].username });
    await expect(first).toContainText(a.guests[0].password);
    await expect(first).toContainText("Gruppe A");
    await expect(first).toContainText(/Anmelden unter localhost:\d+ · gültig bis/);
    await expect(print.getByRole("button", { name: "Drucken" })).toBeVisible();

    // Ganzer Termin: alle Gruppen
    await print.goto(`/admin/druck?termin=${eventId}`);
    await expect(cards).toHaveCount(5);
    // Gäste kommen an die Druckansicht nicht heran.
    const guestPage = await page.context().browser()!.newPage({ baseURL: new URL(page.url()).origin });
    await loginUser(guestPage);
    await guestPage.goto(`/admin/druck?termin=${eventId}`);
    await expect(guestPage).toHaveURL(/\/login\?weiter=admin$/);
    await guestPage.close();
  });

  test("T05/T10 Termin verschieben wirkt sofort: Gast vor Beginn bekommt die Startzeit genannt", async ({ page, admin, browser, baseURL, ip }) => {
    const name = `Verschiebung ${uniq()}`;
    const eventId = await apiEvent(admin, name);
    const { guests } = await apiGroup(admin, eventId, "A", 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    await chat.ask(`Läuft noch ${uniq()}`);

    // Beginn in zwei Stunden: die laufende Sitzung endet, die Anmeldung nennt die Startzeit.
    await openAdmin(page, "Termine");
    await card(page, name).getByRole("button", { name: `Termin „${name}“ bearbeiten` }).click();
    const later = berlin(120);
    const end = berlin(180);
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Name")).toHaveValue(name);
    await dialog.getByLabel("Datum").fill(later.date);
    await dialog.getByLabel("von").fill(later.time);
    await dialog.getByLabel("bis").fill(end.time);
    await dialog.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByRole("button", { name: /^Geplant \(\d+\)$/ })).toHaveAttribute("aria-pressed", "true");
    await expect(card(page, name)).toContainText("geplant");

    await chat.send(`Und jetzt? ${uniq()}`);
    await expect(chat.page).toHaveURL(/\/login$/);
    // Der Zugang besteht weiter (die Chats bleiben auf dem Gerät), nur die Sitzung ist beendet.
    await expect(chat.page.getByText("Deine Sitzung ist beendet. Bitte melde dich erneut an.")).toBeVisible();
    await chat.page.getByLabel("Benutzername").fill(guests[0].username);
    await chat.page.getByLabel("Passwort").fill(guests[0].password);
    await chat.page.getByLabel("Passwort").press("Enter");
    await expect(chat.page.locator("form").getByRole("alert")).toHaveText(/^Dein Termin beginnt am \d{1,2}\. \p{L}+ um \d{1,2}:\d{2} Uhr\. Die Anmeldung ist ab 30 Minuten vorher möglich\.$/u);

    // 20 Minuten vor Beginn ist die Anmeldung schon möglich.
    await admin.json("PUT", "/api/admin/events", { id: eventId, name, startsAt: iso(20), endsAt: iso(80) });
    await chat.page.getByLabel("Passwort").press("Enter");
    await expect(chat.page).toHaveURL(/\/$/);
  });

  test("T06 „Jetzt beenden“: Gäste sofort raus, Zugänge gelöscht, Termin unter „Vorbei“", async ({ page, admin, browser, baseURL, ip }) => {
    const name = `Beenden ${uniq()}`;
    const eventId = await apiEvent(admin, name);
    const { guests } = await apiGroup(admin, eventId, "A", 2);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    await chat.ask(`Kurz vor Schluss ${uniq()}`);

    await openAdmin(page, "Termine");
    const c = card(page, name);
    page.once("dialog", (d) => void d.dismiss());
    await c.getByRole("button", { name: `Termin „${name}“ jetzt beenden` }).click();
    await expect(c).toContainText("läuft");
    page.once("dialog", (d) => {
      expect(d.message()).toBe(`Termin „${name}“ jetzt beenden? Alle Gäste werden sofort abgemeldet und ihre Zugänge gelöscht.`);
      void d.accept();
    });
    await c.getByRole("button", { name: `Termin „${name}“ jetzt beenden` }).click();
    await page.getByRole("button", { name: /^Vorbei \(\d+\)$/ }).click();
    await expect(c).toContainText("vorbei (vorzeitig beendet)");
    await expect(c).toContainText("die Zugänge sind gelöscht");
    await expect(c).toContainText("2 Gäste");

    // Nächste Aktion des Gastes: Login mit Hinweis; die Zugangsdaten gelten nicht mehr.
    await chat.page.reload();
    await expect(chat.page).toHaveURL(/\/login\?grund=abgelaufen$/);
    await expect(chat.page.getByText("Dein Zugang ist abgelaufen.")).toBeVisible();
    await chat.page.getByLabel("Benutzername").fill(guests[1].username);
    await chat.page.getByLabel("Passwort").fill(guests[1].password);
    await chat.page.getByLabel("Passwort").press("Enter");
    await expect(chat.page.locator("form").getByRole("alert")).toHaveText("Benutzername oder Passwort stimmt nicht.");
  });

  test("T07 Termin löschen: Gäste sofort weg; vorbei: nur noch aus der Statistik entfernen", async ({ page, admin, browser, baseURL, ip }) => {
    const name = `Löschen ${uniq()}`;
    const eventId = await apiEvent(admin, name);
    const { guests } = await apiGroup(admin, eventId, "A", 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    await openAdmin(page, "Termine");
    page.once("dialog", (d) => {
      expect(d.message()).toBe(`Termin „${name}“ löschen? Alle Gäste werden sofort abgemeldet.`);
      void d.accept();
    });
    await card(page, name).getByRole("button", { name: `Termin „${name}“ löschen` }).click();
    await expect(card(page, name)).toHaveCount(0);
    await chat.send(`Noch jemand da? ${uniq()}`);
    await expect(chat.page).toHaveURL(/\/login$/);

    // Ein vergangener Termin wird nur noch aus der Statistik entfernt.
    const old = `Alt ${uniq()}`;
    const oldId = await apiEvent(admin, old);
    await admin.json("POST", "/api/admin/events/end", { id: oldId });
    await page.getByRole("tab", { name: "Termine" }).click();
    await page.getByRole("button", { name: /^Vorbei \(\d+\)$/ }).click();
    page.once("dialog", (d) => {
      expect(d.message()).toBe(`Termin „${old}“ aus der Statistik löschen?`);
      void d.accept();
    });
    await card(page, old).getByRole("button", { name: `Termin „${old}“ löschen` }).click();
    await expect(card(page, old)).toHaveCount(0);
  });

  test("T08 mehrere Termine: Läuft, Geplant und Vorbei richtig zugeordnet und sortiert", async ({ page, admin }) => {
    const id = uniq();
    await apiEvent(admin, `Jetzt ${id}`, -10, 60);
    await apiEvent(admin, `Morgen ${id}`, 24 * 60, 25 * 60);
    await apiEvent(admin, `Übermorgen ${id}`, 48 * 60, 49 * 60);
    const ended = await apiEvent(admin, `Beendet ${id}`, -30, 60);
    await admin.json("POST", "/api/admin/events/end", { id: ended });

    await openAdmin(page, "Termine");
    // Läuft: der Test-Termin der Suite und „Jetzt“.
    await expect(page.getByRole("button", { name: /^Läuft \(\d+\)$/ })).toHaveAttribute("aria-pressed", "true");
    await expect(card(page, `Jetzt ${id}`)).toBeVisible();
    await expect(card(page, `Morgen ${id}`)).toHaveCount(0);
    await page.getByRole("button", { name: "Geplant (2)" }).click();
    const planned = page.getByRole("region", { name: new RegExp(`^Termin „(Morgen|Übermorgen) ${id}“$`) });
    await expect(planned).toHaveCount(2);
    await expect(planned.first()).toHaveAccessibleName(`Termin „Morgen ${id}“`);
    await page.getByRole("button", { name: "Vorbei (1)" }).click();
    await expect(card(page, `Beendet ${id}`)).toContainText("vorbei");
  });

  test("T16 Übersicht „Nach Termin“: Gast-Anfragen je Termin und Gruppe – auch nach dem Löschen", async ({ page, admin, browser, baseURL, ip }) => {
    interface Overview {
      byRole: { role: string; requests: number }[];
      byEvent: { id: string; name: string | null; requests: number; sessions: number; groups: { name: string | null; requests: number }[] }[];
    }
    const name = `Statistik ${uniq()}`;
    const eventId = await apiEvent(admin, name);
    const morning = await apiGroup(admin, eventId, "Vormittag", 1);
    const afternoon = await apiGroup(admin, eventId, "Nachmittag", 1);
    const before = await admin.json<Overview>("GET", "/api/admin/overview");
    const guestRequests = (o: Overview) => o.byRole.find((r) => r.role === "guest")?.requests ?? 0;

    const a = await openChat(browser, baseURL!, ip, { guest: morning.guests[0] });
    await a.ask(`Erste Frage ${uniq()}`);
    await a.ask(`Zweite Frage ${uniq()}`);
    const b = await openChat(browser, baseURL!, ip, { guest: afternoon.guests[0] });
    await b.ask(`Frage am Nachmittag ${uniq()}`);

    await openAdmin(page);
    const card = page.getByRole("heading", { name: "Nach Termin" }).locator("xpath=ancestor::section[1]");
    const cells = (row: Locator) => row.getByRole("cell");
    const eventRow = card.getByRole("row").filter({ hasText: name });
    await expect(cells(eventRow).nth(1)).toHaveText("3");
    await expect(cells(eventRow).nth(4)).toHaveText("2");
    await expect(card.getByText("Gäste (30 Tage)").locator("xpath=following-sibling::dd[1]")).toHaveText(new RegExp(`^${guestRequests(before) + 3} Anfragen · `));

    // Aufklappen: je Gruppe
    await card.getByRole("button", { name: `Gruppen von „${name}“ anzeigen` }).click();
    await expect(card.getByRole("button", { name: `Gruppen von „${name}“ ausblenden` })).toHaveAttribute("aria-expanded", "true");
    await expect(cells(card.getByRole("row").filter({ hasText: "Gruppe „Vormittag“" })).nth(1)).toHaveText("2");
    await expect(cells(card.getByRole("row").filter({ hasText: "Gruppe „Nachmittag“" })).nth(1)).toHaveText("1");
    await card.getByRole("button", { name: `Gruppen von „${name}“ ausblenden` }).click();
    await expect(card.getByRole("row").filter({ hasText: "Gruppe „Vormittag“" })).toHaveCount(0);

    // Gelöschte Gruppen und Termine bleiben in der Statistik.
    await admin.json("DELETE", `/api/admin/events/groups?id=${afternoon.id}`);
    await page.reload();
    await card.getByRole("button", { name: `Gruppen von „${name}“ anzeigen` }).click();
    await expect(cells(card.getByRole("row").filter({ hasText: "Gelöschte Gruppe" })).nth(1)).toHaveText("1");
    await admin.json("DELETE", `/api/admin/events?id=${eventId}`);
    const after = await admin.json<Overview>("GET", "/api/admin/overview");
    const gone = after.byEvent.find((e) => e.id === eventId)!;
    expect(gone).toMatchObject({ name: null, requests: 3, sessions: 2 });
    expect(guestRequests(after)).toBe(guestRequests(before) + 3);
  });

  test("T17 Aufräumjob löscht die Zugänge beendeter Termine; der Termin bleibt in der Statistik", async ({ admin, playwright, baseURL, ip }) => {
    const name = `Aufräumen ${uniq()}`;
    const { id } = await admin.json<{ id: string }>("POST", "/api/admin/events", { name, startsAt: inMinutes(-30), endsAt: new Date(Date.now() + 3_000).toISOString() });
    const { guests } = await apiGroup(admin, id, "A", 2);
    await new Promise((r) => setTimeout(r, 3_500));

    const api = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip } });
    const res = await api.get("/api/cron/cleanup", { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    expect(res.status(), await res.text()).toBe(200);
    const body = (await res.json()) as { deletedGuests: number; deletedEvents: number };
    expect(body.deletedGuests).toBeGreaterThanOrEqual(2);
    expect(typeof body.deletedEvents).toBe("number");

    const { events } = await admin.json<{ events: { id: string; status: string; groups: { guests: unknown[] }[] }[] }>("GET", "/api/admin/events");
    const event = events.find((e) => e.id === id)!;
    expect(event.status).toBe("vorbei");
    expect(event.groups[0].guests).toEqual([]);
    const login = await api.post("/api/auth/login", { data: { username: guests[0].username, password: guests[0].password } });
    expect(login.status()).toBe(401);
    await api.dispose();
  });
});
