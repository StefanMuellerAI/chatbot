import { request as playwrightRequest, type APIRequestContext, type Page } from "@playwright/test";
import { expect, inMinutes, ipFor, uniq, type AdminApi, type ChatPage, type Guest } from "./fixtures";

/**
 * Eigener Termin für Posteingang-Tests: eine Gruppe mit `count` Gästen und optional eine zweite Gruppe.
 * So bleiben die Adressbücher klein und unabhängig vom gemeinsamen Test-Termin.
 */
export async function mailGroup(admin: AdminApi, count = 2, otherGroup = 0, endsAt = inMinutes(180)) {
  const eventName = `Posteingang ${uniq()}`;
  const { id: eventId } = await admin.json<{ id: string }>("POST", "/api/admin/events", { name: eventName, startsAt: inMinutes(-5), endsAt });
  const a = await admin.createGroup(eventId, "Gruppe A", count);
  const b = otherGroup ? await admin.createGroup(eventId, "Gruppe B", otherGroup) : { id: "", guests: [] as Guest[] };
  return { eventId, eventName, groupA: a.id, groupB: b.id, guests: a.guests, others: b.guests };
}

/** Eigener API-Zugang als Gast (ohne Browser), z. B. nach dem Abmelden oder für weitere Gäste. */
export async function guestApi(baseURL: string, ip: string, guest: { username: string; password: string }) {
  const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-${guest.username}`) } });
  const res = await api.post("/api/auth/login", { data: { username: guest.username, password: guest.password } });
  expect(res.status(), await res.text()).toBe(200);
  return api;
}

export const address = (g: { username: string }) => `${g.username}@freebie.example`;

/** Mail über die API verschicken (mit den Cookies der Seite bzw. des Kontexts). */
export async function sendMail(api: APIRequestContext, mail: { to: string[]; cc?: string[]; subject: string; body?: string }) {
  const res = await api.post("/api/mail", { data: { to: mail.to, cc: mail.cc ?? [], subject: mail.subject, body: mail.body ?? "" } });
  expect(res.status(), await res.text()).toBe(200);
  return ((await res.json()) as { mail: { id: string } }).mail;
}

export async function inboxOf(api: APIRequestContext, folder: "inbox" | "sent" = "inbox") {
  const res = await api.get(`/api/mail?folder=${folder}`);
  expect(res.status()).toBe(200);
  return (await res.json()) as { mails: { id: string; from: string; to: string[]; subject: string; read: boolean; viaFreebie: boolean }[]; unread: number; total: number };
}

/** Seitenobjekt für den Posteingang (analog zu ChatPage). */
export class MailPage {
  constructor(public readonly page: Page) {}

  static of(chat: ChatPage) {
    return new MailPage(chat.page);
  }

  get switcher() {
    return this.page.getByRole("group", { name: "Ansicht wechseln" });
  }
  get postTab() {
    return this.switcher.getByRole("button", { name: /^Posteingang/ });
  }
  get chatTab() {
    return this.switcher.getByRole("button", { name: "Chat", exact: true });
  }
  get list() {
    return this.page.getByRole("list", { name: "E-Mails" });
  }
  get rows() {
    return this.list.getByRole("button");
  }
  row(subject: string | RegExp) {
    return this.list.getByRole("button", { name: subject });
  }
  get reader() {
    return this.page.getByRole("region", { name: "Lesebereich" });
  }
  /** Ordner in der Seitenleiste (der Posteingang heißt mit ungelesenen Mails „Posteingang, 2 ungelesen“). */
  folder(name: "Posteingang" | "Gesendet") {
    return this.page.getByRole("navigation", { name: "Ordner" }).getByRole("button", { name: new RegExp(`^${name}(, \\d+ ungelesen)?$`) });
  }
  dialog(title = "Neue E-Mail") {
    return this.page.getByRole("dialog", { name: title });
  }
  /** „Neue E-Mail“: auf dem Handy der runde Knopf unten rechts (die Leiste ist dann zu), sonst in der Leiste. */
  get newMail() {
    return this.page.getByRole("button", { name: "Neue E-Mail" }).filter({ visible: true }).last();
  }

  async open() {
    await this.postTab.click();
    await expect(this.page).toHaveURL(/\?ansicht=posteingang$/);
    await expect(this.page.getByRole("heading", { name: "Posteingang", level: 1 })).toBeVisible();
  }

  /** Empfänger ins Feld tippen und mit Enter übernehmen. */
  async addRecipient(name: string, field: "An" | "Cc" = "An", title = "Neue E-Mail") {
    const input = this.dialog(title).getByRole("textbox", { name: field, exact: true });
    await input.fill(name);
    await input.press("Enter");
  }

  /** Neue Mail über die Oberfläche schreiben und senden. */
  async compose(to: string[], subject: string, body: string) {
    await this.newMail.click();
    const d = this.dialog();
    await expect(d).toBeVisible();
    for (const t of to) await this.addRecipient(t);
    await d.getByRole("textbox", { name: "Betreff" }).fill(subject);
    await d.getByRole("textbox", { name: "Text der E-Mail" }).fill(body);
    await d.getByRole("button", { name: "Senden" }).click();
    await expect(d).toBeHidden();
  }
}

/** Verbindung „Posteingang“ im Chat ein- oder ausschalten. */
export async function setConnection(page: Page, on: boolean) {
  const trigger = page.getByRole("button", { name: /^Verbindungen/ });
  await trigger.click();
  const sw = page.getByRole("dialog", { name: "Verbindungen" }).getByRole("switch", { name: "Posteingang" });
  if ((await sw.getAttribute("aria-checked")) !== String(on)) await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", String(on));
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAccessibleName(on ? "Verbindungen: Posteingang verbunden" : "Verbindungen");
}
