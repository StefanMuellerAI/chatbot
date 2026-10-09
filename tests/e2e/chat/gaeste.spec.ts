import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { ChatPage, createGuest, expect, inMinutes, ipFor, openChat, test, uniq } from "../support/fixtures";
import { ADMIN } from "../support/servers.mjs";

// T11–T14: Gäste im Chat – Ablauf des Zugangs, Chats pro Konto auf dem Gerät, Login-Bremse pro Name.

/** „16:30“ in deutscher Ortszeit, wie es der Chat anzeigt. */
const hhmm = (iso: string) => new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
/** Namen der Browser-Datenbanken (je Konto eine). */
const databases = (page: Page) => page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name ?? ""));
const warning = (page: Page) => page.getByRole("status").filter({ hasText: "Dein Zugang endet um" });

/** Anmeldung über das Formular; der Hinweis kommt beim ersten Mal je Konto (auch am selben Gerät). */
async function loginViaForm(page: Page, user: { username: string; password: string }, expectNotice: boolean) {
  await page.goto("/login");
  await page.getByLabel("Benutzername").fill(user.username);
  await page.getByLabel("Passwort").fill(user.password);
  await page.getByLabel("Passwort").press("Enter");
  await expect(page).toHaveURL(/\/$/);
  const notice = page.getByRole("dialog", { name: "Wichtiger Hinweis" });
  if (expectNotice) await notice.getByRole("button", { name: "Verstanden" }).click();
  await expect(page.getByRole("textbox", { name: "Nachricht" })).toBeEditable();
  await expect(notice).toHaveCount(0);
}

test.describe("T · Gäste im Chat", () => {
  test("T11 Termin endet während der Sitzung: zurück zur Anmeldung, Chats vom Gerät gelöscht, Zugang verfallen", async ({ browser, baseURL, ip, admin }) => {
    const name = `Kurztermin ${uniq()}`;
    const endsAt = new Date(Date.now() + 25_000).toISOString();
    const { id } = await admin.json<{ id: string }>("POST", "/api/admin/events", { name, startsAt: inMinutes(-10), endsAt });
    const { guests } = await admin.createGroup(id, "A", 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    // Kurz vor dem Ende: Warnung mit Uhrzeit
    await expect(warning(chat.page)).toContainText(`Dein Zugang endet um ${hhmm(endsAt)} Uhr.`);
    await chat.ask(`Kurz vor Schluss ${uniq()}`);
    expect(await databases(chat.page)).toContain(`freebie-g-${guests[0].id}`);

    // Ohne Zutun: zum Ende zur Anmeldung mit Hinweis, die Chats sind vom Gerät gelöscht.
    await expect(chat.page).toHaveURL(/\/login\?grund=abgelaufen$/, { timeout: 45_000 });
    await expect(chat.page.getByText("Dein Zugang ist abgelaufen.")).toBeVisible();
    await expect.poll(() => databases(chat.page)).not.toContain(`freebie-g-${guests[0].id}`);
    expect((await chat.page.request.get("/api/config")).status()).toBe(401);

    // Die Zugangsdaten gelten nicht mehr.
    await chat.page.getByLabel("Benutzername").fill(guests[0].username);
    await chat.page.getByLabel("Passwort").fill(guests[0].password);
    await chat.page.getByLabel("Passwort").press("Enter");
    await expect(chat.page.locator("form").getByRole("alert")).toHaveText("Benutzername oder Passwort stimmt nicht.");
  });

  test("T12 „gültig bis“ und Warnung 10 Minuten vor dem Ende mit Export; Verkürzen und Verlängern kommen ohne Neuladen an", async ({ browser, baseURL, ip, admin }) => {
    const name = `Warnung ${uniq()}`;
    const startsAt = inMinutes(-30);
    let endsAt = inMinutes(60);
    const { id } = await admin.json<{ id: string }>("POST", "/api/admin/events", { name, startsAt, endsAt });
    const { guests } = await admin.createGroup(id, "A", 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    // Uhr im Browser steuerbar machen (läuft normal weiter, bis die Tests vorspulen).
    await chat.page.clock.install();
    await chat.open();
    const account = chat.page.getByText(`Angemeldet als ${guests[0].username}`);
    await expect(account).toHaveText(`Angemeldet als ${guests[0].username} · gültig bis ${hhmm(endsAt)} Uhr`);
    await expect(chat.page.getByRole("link", { name: "Admin" })).toHaveCount(0);
    await expect(warning(chat.page)).toHaveCount(0);
    // Den Stand der Sitzung fragt der Chat hier ab.
    expect(await (await chat.page.request.get("/api/auth/session")).json()).toEqual({ role: "guest", username: guests[0].username, validUntil: endsAt });
    const question = `Zum Mitnehmen ${uniq()}`;
    await chat.ask(question);

    // Verkürzt auf 8 Minuten: spätestens nach 5 Minuten fragt der Chat nach und warnt.
    endsAt = inMinutes(8);
    await admin.json("PUT", "/api/admin/events", { id, name, startsAt, endsAt });
    await chat.page.clock.fastForward("05:00");
    await expect(warning(chat.page)).toContainText(
      `Dein Zugang endet um ${hhmm(endsAt)} Uhr. Danach werden deine Chats von diesem Gerät gelöscht – wenn du sie behalten möchtest, jetzt exportieren.`,
    );
    await expect(account).toContainText(`gültig bis ${hhmm(endsAt)} Uhr`);

    // Export direkt aus der Warnung
    const download = chat.page.waitForEvent("download");
    await warning(chat.page).getByRole("button", { name: "Chats exportieren" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^freebie-chats-\d{4}-\d{2}-\d{2}\.json$/);
    expect(readFileSync((await file.path())!, "utf8")).toContain(question);

    // Verlängert: bei der nächsten Prüfung verschwindet die Warnung.
    endsAt = inMinutes(90);
    await admin.json("PUT", "/api/admin/events", { id, name, startsAt, endsAt });
    await chat.page.clock.fastForward(30_000);
    await expect(warning(chat.page)).toHaveCount(0);
    await expect(account).toContainText(`gültig bis ${hhmm(endsAt)} Uhr`);
    await expect(chat.composer).toBeEnabled();
  });

  test("T13 zwei Gäste nacheinander am selben Gerät: keiner sieht die Chats des anderen", async ({ page, context, baseURL }) => {
    const [a, b] = [await createGuest(baseURL!), await createGuest(baseURL!)];
    const chat = new ChatPage(page);
    const history = page.getByRole("navigation", { name: "Chatverlauf" });

    await loginViaForm(page, a, true);
    const fromA = `Frage von A ${uniq()}`;
    await chat.ask(fromA);
    expect(await databases(page)).toContain(`freebie-g-${a.id}`);

    // A geht, ohne sich abzumelden (Browser zu); B meldet sich am selben Gerät an.
    await context.clearCookies();
    // Auch B bestätigt den Hinweis selbst – er gilt pro Konto, nicht pro Gerät.
    await loginViaForm(page, b, true);
    await expect(history).toContainText("Noch keine Chats.");
    await expect(page.getByText(fromA)).toHaveCount(0);
    expect(await databases(page)).not.toContain(`freebie-g-${a.id}`);
    const fromB = `Frage von B ${uniq()}`;
    await chat.ask(fromB);

    // Abmelden fragt nach; abbrechen lässt alles, wie es ist.
    page.once("dialog", (d) => void d.dismiss());
    await page.getByRole("button", { name: "Abmelden" }).click();
    await expect(chat.questions.filter({ hasText: fromB })).toBeVisible();
    page.once("dialog", (d) => void d.accept());
    await page.getByRole("button", { name: "Abmelden" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect.poll(() => databases(page)).not.toContain(`freebie-g-${b.id}`);

    // Die Kursleitung am selben Gerät: eigene Chats, die bleiben auch nach dem Abmelden.
    await loginViaForm(page, ADMIN, true);
    const fromAdmin = `Frage der Kursleitung ${uniq()}`;
    await chat.ask(fromAdmin);
    await page.getByRole("button", { name: "Abmelden" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(await databases(page)).toContain("freebie");

    // A kommt zurück: nichts von B, nichts von der Kursleitung – und die eigenen Chats sind vom Gerät gelöscht.
    await loginViaForm(page, a, false);
    await expect(history).toContainText("Noch keine Chats.");
    await expect(page.getByText(fromAdmin)).toHaveCount(0);
  });

  test("T14 Login-Bremse pro Benutzername: sperrt nur diesen Namen, auch unbekannte, ohne etwas zu verraten", async ({ page, playwright, baseURL, ip }) => {
    const guest = await createGuest(baseURL!);
    const other = await createGuest(baseURL!);
    // Jeder Versuch kommt von einer anderen IP – hier geht es um die Bremse pro Name.
    let n = 0;
    const attempt = async (username: string, password: string) => {
      const api = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-${n++}`) } });
      const res = await api.post("/api/auth/login", { data: { username, password } });
      const result = { status: res.status(), body: (await res.json()) as unknown };
      await api.dispose();
      return result;
    };
    const locked = { status: 429, body: { error: "Zu viele Fehlversuche für diesen Benutzernamen. Bitte warte ein paar Minuten." } };

    for (let i = 0; i < 10; i++) expect((await attempt(guest.username, "falsch222")).status).toBe(401);
    // Jetzt hilft auch das richtige Passwort nicht – in keiner Schreibweise.
    expect(await attempt(guest.username, guest.password)).toEqual(locked);
    expect(await attempt(` ${guest.username.toUpperCase()} `, guest.password)).toEqual(locked);
    // Andere Konten sind nicht betroffen.
    expect((await attempt(other.username, other.password)).status).toBe(200);

    // Unbekannte Namen verhalten sich genauso: an der Antwort ist nicht zu erkennen, ob es den Namen gibt.
    const unknown = `gibtsnicht${uniq()}`;
    for (let i = 0; i < 10; i++) expect(await attempt(unknown, "falsch222")).toEqual({ status: 401, body: { error: "Benutzername oder Passwort stimmt nicht." } });
    expect(await attempt(unknown, "falsch222")).toEqual(locked);

    // Im Formular erscheint die Meldung als Fehler.
    await page.goto("/login");
    await page.getByLabel("Benutzername").fill(guest.username);
    await page.getByLabel("Passwort").fill(guest.password);
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText(locked.body.error);
  });
});
