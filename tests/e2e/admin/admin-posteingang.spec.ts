import type { Page } from "@playwright/test";
import { expect, openAdmin, openChat, test, uniq } from "../support/fixtures";
import { address, guestApi, inboxOf, MailPage, mailGroup, sendMail } from "../support/mail";
import { CRON_SECRET } from "../support/servers.mjs";

// Posteingang aus Sicht der Kursleitung: Schalter, Begrüßungs-E-Mail, eigenes Postfach, Aufräumen.
// Läuft auf dem seriellen Server – die Einstellungen werden nach jedem Test zurückgesetzt.

const settingSwitch = (page: Page, label: string) => page.getByRole("switch", { name: label, exact: true });
const saveButton = (page: Page) => page.getByRole("button", { name: "Einstellungen speichern" });
const welcomeCard = (page: Page) => page.locator("section").filter({ has: page.getByRole("heading", { name: "Begrüßungs-E-Mail", level: 2 }) });

async function toggleAndSave(page: Page, label: string, to: boolean) {
  const sw = settingSwitch(page, label);
  if ((await sw.getAttribute("aria-checked")) !== String(to)) await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", String(to));
  await saveButton(page).click();
  await expect(page.getByRole("status").filter({ hasText: "Gespeichert." })).toBeVisible();
}

/** Chat als Kursleitung öffnen (Admin ist schon angemeldet). */
async function openTeacherChat(page: Page) {
  await page.goto("/");
  await page.getByRole("dialog", { name: "Wichtiger Hinweis" }).getByRole("button", { name: "Verstanden" }).click();
  await expect(page.getByRole("textbox", { name: "Nachricht" })).toBeVisible();
  return new MailPage(page);
}

test.describe("Q · Admin: Posteingang", () => {
  test("Q22 Schalter „Posteingang“ aus: Umschalter, Verbindung, Werkzeuge und API weg; wieder an: alles da, Mails bleiben", async ({ page, browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chat = await openChat(browser, baseURL!, ip, { guest: a });
    const subject = `Bleibt erhalten ${uniq()}`;
    await sendMail(chat.page.request, { to: [b.username], subject });
    const mail = MailPage.of(chat);
    await expect(mail.switcher).toBeVisible();

    await openAdmin(page, "Einstellungen");
    await expect(settingSwitch(page, "Posteingang")).toHaveAttribute("aria-checked", "true");
    await toggleAndSave(page, "Posteingang", false);
    await chat.page.reload();
    await expect(chat.composer).toBeVisible();
    await expect(mail.switcher).toHaveCount(0);
    await expect(chat.page.getByRole("button", { name: /^Verbindungen/ })).toHaveCount(0);
    const off = await chat.ask(`Was steht in meinem Posteingang? ${uniq()}`);
    expect(await chat.diagnosis(off, "Posteingang")).toBe("aus");
    await expect(off).not.toContainText("nicht verbunden");
    // Auch an der Oberfläche vorbei ist der Posteingang zu.
    const api = chat.page.request;
    for (const res of [
      await api.get("/api/mail?folder=inbox"),
      await api.get("/api/mail/status"),
      await api.get("/api/mail/contacts"),
      await api.post("/api/mail", { data: { to: [b.username], cc: [], subject: "x", body: "" } }),
    ]) {
      expect(res.status()).toBe(403);
      expect((await res.json()).error).toBe("Der Posteingang ist deaktiviert.");
    }
    // Ein alter Link auf den Posteingang führt zum Chat.
    await chat.page.goto("/?ansicht=posteingang");
    await expect(chat.composer).toBeVisible();
    await expect(chat.page).toHaveURL(/\/$/);

    await toggleAndSave(page, "Posteingang", true);
    await chat.page.reload();
    await expect(mail.switcher).toBeVisible();
    await expect(chat.page.getByRole("button", { name: "Verbindungen" })).toBeVisible();
    expect((await inboxOf(api, "sent")).mails.map((m) => m.subject)).toContain(subject);
    const on = await chat.ask(`Diagnose ${uniq()}`);
    expect(await chat.diagnosis(on, "Posteingang")).toBe("nicht verbunden");
  });

  test("Q23 Begrüßungs-E-Mail ändern: neue Postfächer bekommen den neuen Text; leer: keine Begrüßung", async ({ page, admin, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    const card = welcomeCard(page);
    const subject = `Hallo Gruppe ${uniq()}`;
    await card.getByLabel("Betreff", { exact: true }).fill(subject);
    await card.getByLabel(/^Text/).fill("Erste Aufgabe: Schreib deiner Nachbarin eine E-Mail.");
    await saveButton(page).click();
    await expect(page.getByRole("status").filter({ hasText: "Gespeichert." })).toBeVisible();

    const { guests } = await mailGroup(admin, 2);
    const first = await guestApi(baseURL!, ip, guests[0]);
    const inbox = await inboxOf(first);
    expect(inbox.mails.map((m) => [m.from, m.subject])).toEqual([["kursleitung", subject]]);
    const full = await (await first.get(`/api/mail?id=${inbox.mails[0].id}`)).json();
    expect(full.mail.body).toBe("Erste Aufgabe: Schreib deiner Nachbarin eine E-Mail.");
    // Eine zweite Anmeldung legt keine zweite Begrüßung an.
    expect((await inboxOf(await guestApi(baseURL!, `${ip}-2`, guests[0]))).total).toBe(1);

    await card.getByLabel("Betreff", { exact: true }).fill("");
    await card.getByLabel(/^Text/).fill("");
    await saveButton(page).click();
    await expect(page.getByRole("status").filter({ hasText: "Gespeichert." })).toBeVisible();
    expect((await inboxOf(await guestApi(baseURL!, ip, guests[1]))).total).toBe(0);

    // Zu lang: deutsche Meldung, nichts gespeichert.
    await card.getByLabel("Betreff", { exact: true }).fill("x".repeat(201));
    await saveButton(page).click();
    await expect(page.getByRole("status")).toHaveText("Begrüßungs-E-Mail: Betreff: höchstens 200 Zeichen");
    expect((await admin.settings()).mailWelcomeSubject).toBe("");
  });
});

test.describe("Z · Posteingang der Kursleitung und Aufräumen", () => {
  test("Z13 Kursleitung: eigenes Postfach, Antwort an einen Gast, Rundmail an eine Gruppe, nur ein Termin pro Mail; Abmelden leert das Postfach", async ({ page, admin, browser, baseURL, ip }) => {
    const {
      eventName,
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const other = await mailGroup(admin, 1);
    const chatA = await openChat(browser, baseURL!, ip, { guest: a });
    const question = `Frage zur Pause ${uniq()}`;
    await sendMail(chatA.page.request, { to: ["Kursleitung"], subject: question, body: "Wann geht es weiter?" });

    await openAdmin(page);
    const mail = await openTeacherChat(page);
    await mail.open();
    await expect(page.getByText("kursleitung@freebie.example", { exact: true })).toBeVisible();
    // Die Kursleitung bekommt keine Begrüßung.
    await expect(mail.row(/Willkommen in deinem Posteingang/)).toHaveCount(0);
    await mail.row(new RegExp(`^Ungelesen: ${a.username}, ${question}`)).click();
    await expect(mail.reader).toContainText("Wann geht es weiter?");
    await mail.reader.getByRole("button", { name: "Antworten", exact: true }).click();
    let d = mail.dialog("Antworten");
    await expect(d).toContainText("VonKursleitung <kursleitung@freebie.example>");
    await d.getByRole("textbox", { name: "Text der E-Mail" }).press("Control+Home");
    await d.getByRole("textbox", { name: "Text der E-Mail" }).pressSequentially("Um 13:30 Uhr.");
    await d.getByRole("button", { name: "Senden" }).click();
    await expect(d).toBeHidden();
    const replies = await inboxOf(chatA.page.request);
    expect(replies.mails.find((m) => m.subject === `AW: ${question}`)?.from).toBe("kursleitung");

    // Rundmail: das Adressbuch zeigt Termine und Gruppen; „Alle in …“ übernimmt die ganze Gruppe.
    await mail.newMail.click();
    d = mail.dialog();
    const to = d.getByRole("textbox", { name: "An", exact: true });
    await to.fill(eventName);
    const book = d.getByRole("list", { name: "Adressbuch für „An“" });
    await expect(book.getByRole("button")).toHaveCount(3);
    await book.getByRole("button", { name: /^Alle in „Gruppe A“/ }).click();
    await expect(d.getByRole("button", { name: `${a.username} entfernen` })).toBeVisible();
    await expect(d.getByRole("button", { name: `${b.username} entfernen` })).toBeVisible();
    // Gäste aus zwei Terminen in einer Mail: Meldung, nichts verschickt.
    await mail.addRecipient(other.guests[0].username);
    const round = `Rundmail ${uniq()}`;
    await d.getByRole("textbox", { name: "Betreff" }).fill(round);
    await d.getByRole("button", { name: "Senden" }).click();
    await expect(d.getByRole("alert")).toHaveText("Eine E-Mail kann nur an Personen eines Termins gehen. Bitte für jeden Termin eine eigene E-Mail schreiben.");
    await d.getByRole("button", { name: `${other.guests[0].username} entfernen` }).click();
    await d.getByRole("button", { name: "Senden" }).click();
    await expect(d).toBeHidden();
    expect((await inboxOf(chatA.page.request)).mails.map((m) => m.subject)).toContain(round);
    expect((await inboxOf(await guestApi(baseURL!, ip, b))).mails.map((m) => m.subject)).toContain(round);
    await mail.folder("Gesendet").click();
    for (const g of [a, b]) await expect(mail.row(new RegExp(round))).toContainText(g.username);

    // Abmelden fragt nach und leert das Postfach der Kursleitung; die Gäste behalten ihre Mails.
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Beim Abmelden wird dein Posteingang geleert. Jetzt abmelden?");
      void dialog.accept();
    });
    await page.getByRole("complementary").getByRole("button", { name: "Abmelden" }).click();
    await expect(page).toHaveURL(/\/login$/);
    const fresh = await openAdmin(page).then(() => page.request);
    expect((await inboxOf(fresh)).total).toBe(0);
    expect((await inboxOf(fresh, "sent")).total).toBe(0);
    expect((await inboxOf(chatA.page.request)).mails.map((m) => m.subject)).toContain(round);
  });

  test("Z09 „Jetzt beenden“ und Termin löschen: alle Postfächer des Termins weg – auch die Kopien bei der Kursleitung", async ({ admin, baseURL, ip }) => {
    const {
      eventId,
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const apiA = await guestApi(baseURL!, ip, a);
    const subject = `Vor dem Ende ${uniq()}`;
    await sendMail(apiA, { to: [b.username, "kursleitung"], subject });
    const round = `Von der Kursleitung ${uniq()}`;
    await sendMail(admin.api, { to: [a.username, b.username], subject: round });
    expect((await inboxOf(admin.api)).mails.map((m) => m.subject)).toContain(subject);
    expect((await inboxOf(admin.api, "sent")).mails.map((m) => m.subject)).toContain(round);

    await admin.json("POST", "/api/admin/events/end", { id: eventId });
    expect((await inboxOf(admin.api)).mails.map((m) => m.subject)).not.toContain(subject);
    expect((await inboxOf(admin.api, "sent")).mails.map((m) => m.subject)).not.toContain(round);
    expect((await apiA.get("/api/mail/status")).status()).toBe(401);

    const second = await mailGroup(admin, 1);
    const late = `Nach dem Löschen weg ${uniq()}`;
    await sendMail(await guestApi(baseURL!, ip, second.guests[0]), { to: ["kursleitung"], subject: late });
    expect((await inboxOf(admin.api)).mails.map((m) => m.subject)).toContain(late);
    await admin.json("DELETE", `/api/admin/events?id=${second.eventId}`);
    expect((await inboxOf(admin.api)).mails.map((m) => m.subject)).not.toContain(late);
  });

  test("Z09 Gast oder Gruppe löschen: Zugang weg, die Mail bei den anderen bleibt; an Gelöschte geht nichts mehr", async ({ admin, baseURL, ip }) => {
    const {
      groupA,
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const apiA = await guestApi(baseURL!, ip, a);
    const subject = `Bevor ich gehe ${uniq()}`;
    await sendMail(apiA, { to: [b.username], subject });
    await admin.json("DELETE", `/api/admin/events/guests?id=${a.id}`);
    expect((await apiA.get("/api/mail/status")).status()).toBe(401);

    const apiB = await guestApi(baseURL!, ip, b);
    expect((await inboxOf(apiB)).mails.map((m) => m.subject)).toContain(subject);
    const res = await apiB.post("/api/mail", { data: { to: [a.username], cc: [], subject: "Noch da?", body: "" } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe(`„${address(a)}“ kann nicht zugestellt werden. Du kannst nur deiner Gruppe und der Kursleitung schreiben.`);

    await admin.json("DELETE", `/api/admin/events/groups?id=${groupA}`);
    expect((await apiB.get("/api/mail/status")).status()).toBe(401);
  });

  test("Z09 „Alle abmelden“ lässt die Postfächer stehen; nach der Anmeldung keine zweite Begrüßung", async ({ admin, baseURL, ip }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const apiA = await guestApi(baseURL!, ip, a);
    const subject = `Vor dem Abmelden ${uniq()}`;
    await sendMail(apiA, { to: [b.username, "kursleitung"], subject });
    await admin.security("revoke-sessions");
    expect((await apiA.get("/api/mail/status")).status()).toBe(401);

    const again = await guestApi(baseURL!, `${ip}-neu`, a);
    expect((await inboxOf(again, "sent")).mails.map((m) => m.subject)).toEqual([subject]);
    expect((await inboxOf(again)).mails.map((m) => m.subject)).toEqual(["Willkommen in deinem Posteingang"]);
    // Die Sitzung, die „Alle abmelden“ ausgelöst hat, bleibt – und mit ihr das Postfach der Kursleitung.
    expect((await inboxOf(admin.api)).mails.map((m) => m.subject)).toContain(subject);
  });

  test("Z09 Aufräumjob löscht die Postfächer beendeter Termine und meldet die Zahl", async ({ admin, playwright, baseURL, ip }) => {
    const end = Date.now() + 5_000;
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2, 0, new Date(end).toISOString());
    const apiA = await guestApi(baseURL!, ip, a);
    await guestApi(baseURL!, ip, b);
    await sendMail(apiA, { to: [b.username, "kursleitung"], subject: `Kurz vor Schluss ${uniq()}` });
    await new Promise((r) => setTimeout(r, end - Date.now() + 500));

    const cron = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip } });
    const res = await cron.get("/api/cron/cleanup", { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    expect(res.status(), await res.text()).toBe(200);
    // Zwei Begrüßungen, „Gesendet“ bei A, die Kopien bei B und bei der Kursleitung
    expect(((await res.json()) as { deletedMails: number }).deletedMails).toBeGreaterThanOrEqual(5);
    await cron.dispose();
  });

  test("Z16 Not-Aus: Lesen geht weiter, Senden ist mit der Pausen-Meldung gesperrt", async ({ admin, browser, baseURL, ip }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chat = await openChat(browser, baseURL!, ip, { guest: a });
    const message = `Kurze Mittagspause ${uniq()}`;
    await admin.updateSettings({ paused: true, pausedMessage: message });
    const api = chat.page.request;
    expect((await api.get("/api/mail?folder=inbox")).status()).toBe(200);
    expect((await api.get("/api/mail/status")).status()).toBe(200);
    const res = await api.post("/api/mail", { data: { to: [b.username], cc: [], subject: "Pause?", body: "" } });
    expect(res.status()).toBe(503);
    expect((await res.json()).error).toBe(message);

    await chat.page.reload();
    const mail = MailPage.of(chat);
    await mail.open();
    await mail.row(/Willkommen in deinem Posteingang/).click();
    await expect(mail.reader.getByRole("heading", { name: "Willkommen in deinem Posteingang" })).toBeVisible();
    await mail.newMail.click();
    await mail.addRecipient(b.username);
    await mail.dialog().getByRole("textbox", { name: "Betreff" }).fill("Während der Pause");
    await mail.dialog().getByRole("button", { name: "Senden" }).click();
    await expect(mail.dialog().getByRole("alert")).toHaveText(message);
    expect((await inboxOf(api, "sent")).total).toBe(0);
  });
});
