import type { Page } from "@playwright/test";
import { expect, ipFor, openAdmin, openChat, test, uniq } from "../support/fixtures";
import { guestApi, inboxOf, mailGroup, MailPage, sendMail } from "../support/mail";
import { GroupChatPage, groupChatOf, postMessage, startGroupChat } from "../support/groupchat";
import { CRON_SECRET } from "../support/servers.mjs";

// Q24, der Not-Aus-Teil von GC18 und der Aufräumjob (GC14): ändern Einstellungen bzw. brauchen Ruhe auf dem
// Server (sonst räumt eine parallele Abfrage vorher ab), laufen deshalb auf dem seriellen Server.

const settingSwitch = (page: Page, label: string) => page.getByRole("switch", { name: label, exact: true });

async function toggleAndSave(page: Page, label: string, to: boolean) {
  const sw = settingSwitch(page, label);
  if ((await sw.getAttribute("aria-checked")) !== String(to)) await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", String(to));
  await page.getByRole("button", { name: "Einstellungen speichern" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Gespeichert." })).toBeVisible();
}

test.describe("Q · Admin: Schalter „Gruppenchats“", () => {
  test("Q24 Schalter „Gruppenchats“ aus: Symbol, Abschnitt und API weg, offener Chat wechselt sauber; wieder an: alles da; Posteingang unberührt", async ({ page, browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chatA = await openChat(browser, baseURL!, ip, { guest: a });
    const g = GroupChatPage.of(chatA);
    const title = `Schalter ${uniq()}`;
    const { id } = await startGroupChat(chatA.page.request, title, [b.username]);
    await postMessage(chatA.page.request, id, "Bleibt erhalten");
    await chatA.page.reload();
    await g.open(title);

    await openAdmin(page, "Einstellungen");
    await expect(settingSwitch(page, "Gruppenchats")).toHaveAttribute("aria-checked", "true");
    await toggleAndSave(page, "Gruppenchats", false);

    // Der offene Gruppenchat merkt es bei der nächsten Abfrage und wechselt zum neuen Chat.
    await expect(chatA.page.getByRole("status").filter({ hasText: "Gruppenchats sind deaktiviert." })).toBeVisible({ timeout: 20_000 });
    await expect(chatA.composer).toHaveAttribute("placeholder", "Frag Freebie etwas …");
    await chatA.page.reload();
    await expect(chatA.composer).toBeVisible();
    await expect(g.newButton).toHaveCount(0);
    await expect(chatA.page.getByText("Gruppenchats", { exact: true })).toHaveCount(0);
    const api = chatA.page.request;
    for (const res of [
      await api.get("/api/groupchats"),
      await api.get("/api/groupchats/members"),
      await api.get(`/api/groupchats/${id}`),
      await api.post("/api/groupchats", { data: { title: "x", members: [b.username] } }),
      await api.post(`/api/groupchats/${id}/messages`, { data: { text: "x" } }),
      await api.post(`/api/groupchats/${id}/freebie`, { data: { modelId: "claude-sonnet-5-5" } }),
    ]) {
      expect(res.status()).toBe(403);
      expect((await res.json()).error).toBe("Gruppenchats sind deaktiviert.");
    }
    const status = (await (await api.get("/api/status")).json()) as { mail: unknown; groupChats: unknown };
    expect(status.groupChats).toBeNull();
    // Der Posteingang läuft davon unberührt weiter.
    expect(status.mail).not.toBeNull();
    await sendMail(api, { to: [b.username], subject: `Post geht ${uniq()}` });
    await expect(MailPage.of(chatA).switcher).toBeVisible();

    await toggleAndSave(page, "Gruppenchats", true);
    await chatA.page.reload();
    await expect(g.newButton).toBeVisible();
    await g.open(title);
    await expect(g.mine).toContainText("Bleibt erhalten");
    expect((await inboxOf(api, "sent")).total).toBe(1);
  });

  test("GC18 Not-Aus: Lesen geht weiter, Schreiben, Starten und Freebie sind mit der Pausen-Meldung gesperrt", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const apiA = await guestApi(baseURL!, ip, a);
    const title = `Pause ${uniq()}`;
    const { id } = await startGroupChat(apiA, title, [b.username]);
    await postMessage(apiA, id, "@Freebie vor der Pause");
    const message = `Kurze Mittagspause ${uniq()}`;
    await admin.updateSettings({ paused: true, pausedMessage: message });

    expect((await groupChatOf(apiA, id)).messages.some((m) => m.text === "@Freebie vor der Pause")).toBe(true);
    expect((await apiA.get("/api/groupchats")).status()).toBe(200);
    expect((await apiA.get("/api/status")).status()).toBe(200);
    for (const res of [
      await apiA.post("/api/groupchats", { data: { title: "x", members: [b.username] } }),
      await apiA.put(`/api/groupchats/${id}`, { data: { title: "Neu" } }),
      await apiA.post(`/api/groupchats/${id}/messages`, { data: { text: "x" } }),
      await apiA.post(`/api/groupchats/${id}/freebie`, { data: { modelId: "claude-sonnet-5-5" } }),
    ]) {
      expect(res.status()).toBe(503);
      expect((await res.json()).error).toBe(message);
    }

    // In der Oberfläche: Verlauf lesbar, Eingabe gesperrt.
    const chatB = await openChat(browser, baseURL!, ipFor(`${ip}-b`), { guest: b });
    const g = GroupChatPage.of(chatB);
    await g.open(title);
    await expect(g.from(a.username)).toContainText("@Freebie vor der Pause");
    await expect(g.composer).toBeDisabled();
    await expect(g.composer).toHaveAttribute("placeholder", "Freebie macht gerade Pause.");
    await apiA.dispose();
  });

  test("GC14 Termin-Ende: der Aufräumjob löscht die Gruppenchats beendeter Termine und meldet die Zahl", async ({ admin, playwright, baseURL, ip }) => {
    const end = Date.now() + 5_000;
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2, 0, new Date(end).toISOString());
    const apiA = await guestApi(baseURL!, ip, a);
    await startGroupChat(apiA, "Kurz vor Schluss", [b.username]);
    await startGroupChat(apiA, "Noch einer", [b.username]);
    await new Promise((r) => setTimeout(r, end - Date.now() + 500));
    const cron = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip } });
    const res = await cron.get("/api/cron/cleanup", { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    expect(res.status(), await res.text()).toBe(200);
    expect(((await res.json()) as { deletedGroupChats: number }).deletedGroupChats).toBeGreaterThanOrEqual(2);
    // Ein zweiter Lauf findet nichts mehr.
    const again = await cron.get("/api/cron/cleanup", { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    expect(((await again.json()) as { deletedGroupChats: number }).deletedGroupChats).toBe(0);
    await Promise.all([cron.dispose(), apiA.dispose()]);
  });
});
