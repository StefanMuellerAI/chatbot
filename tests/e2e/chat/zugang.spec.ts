import type { Page } from "@playwright/test";
import { SignJWT } from "jose";
import { createGuest, expect, ipFor, loginUser, test } from "../support/fixtures";
import { ADMIN, SESSION_SECRET } from "../support/servers.mjs";

const key = new TextEncoder().encode(SESSION_SECRET);
const sign = (claims: Record<string, unknown>, audience: string, exp: string | number, secret = key) =>
  new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setAudience(audience).setExpirationTime(exp).sign(secret);

async function fillLogin(page: Page, username: string, password: string) {
  await page.getByLabel("Benutzername").fill(username);
  await page.getByLabel("Passwort").fill(password);
}

const loginAlert = (page: Page) => page.locator("form").getByRole("alert");

test.describe("A · Zugang und Sitzung", () => {
  test("A01 ohne Anmeldung: Seiten leiten auf /login, APIs antworten mit 401", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    const api = await page.request.get("/api/config");
    expect(api.status()).toBe(401);
    expect(await api.json()).toEqual({ error: "Bitte melde dich erneut an." });
    expect((await page.request.get("/api/admin/overview")).status()).toBe(401);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?weiter=admin$/);
  });

  test("A02 Login-Seite zeigt Titel, Spielumgebungs-Hinweis und Link zu StefanAI", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle("Anmelden – Freebie");
    await expect(page.getByRole("heading", { name: "Willkommen bei Freebie" })).toBeVisible();
    await expect(page.getByText(/mit Benutzername und Passwort an/)).toBeVisible();
    await expect(page.getByText("Spielumgebung", { exact: true })).toBeVisible();
    await expect(page.getByText(/Spiel- und Übungsumgebung für unsere Schulungen/)).toBeVisible();
    await expect(page.getByLabel("Benutzername")).toHaveAttribute("autocomplete", "username");
    await expect(page.getByLabel("Passwort")).toHaveAttribute("autocomplete", "current-password");
    const link = page.getByRole("link", { name: /StefanAI – Research & Development/ });
    await expect(link).toHaveAttribute("href", /^https:\/\/stefanai\.de/);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("A03 leere Felder: Button gesperrt, Enter schickt nichts ab", async ({ page }) => {
    await page.goto("/login");
    const button = page.getByRole("button", { name: "Los geht's" });
    await expect(button).toBeDisabled();
    let posted = false;
    page.on("request", (r) => {
      if (r.url().endsWith("/api/auth/login")) posted = true;
    });
    await page.getByLabel("Passwort").press("Enter");
    await page.getByLabel("Benutzername").fill("   ");
    await page.getByLabel("Passwort").fill("geheim");
    await expect(button).toBeDisabled();
    await page.getByLabel("Passwort").press("Enter");
    await page.getByLabel("Benutzername").fill("fuchs27");
    await page.getByLabel("Passwort").fill("");
    await expect(button).toBeDisabled();
    await page.waitForTimeout(300);
    expect(posted).toBe(false);
  });

  test("A04 vor dem Laden getippte oder automatisch ausgefüllte Zugangsdaten werden übernommen", async ({ page, baseURL }) => {
    const guest = await createGuest(baseURL!);
    // Langsames Netz: das Skript kommt erst, nachdem schon getippt wurde (wie Safari-Autofill).
    let release!: () => void;
    const loaded = new Promise<void>((r) => (release = r));
    await page.route(/\/_next\/static\/chunks\/.*\.js$/, async (route) => {
      await loaded;
      await route.continue();
    });
    await page.goto("/login", { waitUntil: "commit" });
    await fillLogin(page, guest.username, guest.password);
    release();
    await expect(page.getByRole("button", { name: "Los geht's" })).toBeEnabled();
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("A04 falsche Zugangsdaten werden abgelehnt, ohne zu verraten, was falsch war", async ({ page, baseURL }) => {
    const guest = await createGuest(baseURL!);
    await page.goto("/login");
    await fillLogin(page, guest.username, "falsch222");
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(loginAlert(page)).toHaveText("Benutzername oder Passwort stimmt nicht.");
    await fillLogin(page, "gibtesnicht99", guest.password);
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(loginAlert(page)).toHaveText("Benutzername oder Passwort stimmt nicht.");
    await expect(page.getByLabel("Passwort")).toBeEditable();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("A05 Gast meldet sich per Enter an: Chat öffnet, Sitzungs-Cookie läuft mit dem Termin ab", async ({ page, context, baseURL }) => {
    const guest = await createGuest(baseURL!);
    await page.goto("/login");
    // Groß-/Kleinschreibung und Leerzeichen im Benutzernamen spielen keine Rolle.
    await fillLogin(page, ` ${guest.username.toUpperCase()} `, guest.password);
    await page.getByLabel("Passwort").press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("dialog", { name: "Wichtiger Hinweis" })).toBeVisible();
    const cookie = (await context.cookies()).find((c) => c.name === "freebie_session");
    expect(cookie).toBeDefined();
    expect(cookie!.httpOnly).toBe(true);
    // Über http://localhost ohne Secure (sonst lehnt Safari das Cookie ab); über HTTPS mit Secure (U01).
    expect(cookie!.secure).toBe(false);
    expect(cookie!.sameSite).toBe("Lax");
    // Höchstens 12 Stunden (der Test-Termin läuft länger).
    const hours = (cookie!.expires * 1000 - Date.now()) / 3_600_000;
    expect(hours).toBeGreaterThan(11.9);
    expect(hours).toBeLessThan(12.1);
  });

  test("A06 sehr lange Eingaben gelten einfach als falsch", async ({ page }) => {
    await page.goto("/login");
    await fillLogin(page, "fuchs27", "x".repeat(250));
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(loginAlert(page)).toHaveText("Benutzername oder Passwort stimmt nicht.");
    await fillLogin(page, "x".repeat(500), "geheim");
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(loginAlert(page)).toHaveText("Benutzername oder Passwort stimmt nicht.");
  });

  test("A07 nach 50 Fehlversuchen greift die Login-Bremse – nur für diese IP und nicht für den Admin", async ({ page, playwright, baseURL, ip }) => {
    const guest = await createGuest(baseURL!);
    const login = (username: string, password: string) => page.request.post("/api/auth/login", { data: { username, password } });
    // Verschiedene Namen: hier geht es um die Bremse pro IP (die pro Name prüft T14).
    for (let i = 0; i < 49; i++) expect((await login(`raten${i}`, "falsch222")).status()).toBe(401);
    // Eine erfolgreiche Anmeldung zählt ihren Versuch zurück.
    expect((await login(guest.username, guest.password)).status()).toBe(200);
    expect((await login("raten50", "falsch222")).status()).toBe(401);
    expect((await login(guest.username, guest.password)).status()).toBe(429);

    // Die erfolgreiche Anmeldung oben hat ein Cookie gesetzt – für den UI-Test wieder abmelden.
    await page.context().clearCookies();
    await page.goto("/login");
    await fillLogin(page, guest.username, guest.password);
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(loginAlert(page)).toHaveText("Zu viele Anmeldeversuche. Bitte warte ein paar Minuten.");

    const other = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-andere`) } });
    expect((await other.post("/api/auth/login", { data: guest })).status()).toBe(200);
    await other.dispose();
    // Die Kursleitung an derselben IP hat einen eigenen Zähler.
    expect((await page.request.post("/api/auth/login", { data: ADMIN })).status()).toBe(200);
  });

  test("A08 abgelaufene, gefälschte, veraltete und Tokens unbekannter Gäste öffnen den Chat nicht", async ({ page, context, baseURL }) => {
    const domain = new URL(baseURL!).hostname;
    const guestClaims = { sid: "s", v: 1, role: "guest", name: "fuchs27", gid: "unbekannt", eid: "e", grp: "g" };
    const tokens = [
      await sign({ ...guestClaims, gid: "abgelaufen" }, "freebie-session", Math.floor(Date.now() / 1000) - 60),
      (await sign({ sid: "s", v: 1, role: "admin", name: "admin" }, "freebie-session", "1h")).slice(0, -3) + "abc",
      // Altes Format von vor den Gast-Zugängen
      await sign({ sid: "alt", v: 1 }, "freebie-user", "1h"),
      await sign({ sid: "s", v: 1, role: "admin", name: "admin" }, "freebie-session", "1h", new TextEncoder().encode("anderes-geheimnis-0123456789")),
      // Gültig signiert, aber den Gast gibt es nicht (mehr)
      await sign(guestClaims, "freebie-session", "1h"),
    ];
    for (const value of tokens) {
      await context.clearCookies();
      await context.addCookies([{ name: "freebie_session", value, domain, path: "/" }]);
      await page.goto("/");
      await expect(page).toHaveURL(/\/login(\?grund=abgelaufen)?$/);
      expect((await page.request.get("/api/config")).status()).toBe(401);
    }
  });

  test("A09 wer angemeldet ist, landet von /login direkt im Chat", async ({ page }) => {
    await loginUser(page);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("textbox", { name: "Nachricht" })).toBeVisible();
  });

  test("A10 Abmelden beendet die Sitzung", async ({ chat, page, context }) => {
    page.once("dialog", (d) => {
      expect(d.message()).toMatch(/^Beim Abmelden werden deine Chats von diesem Gerät gelöscht\./);
      void d.accept();
    });
    await page.getByRole("button", { name: "Abmelden" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await context.cookies()).some((c) => c.name === "freebie_session")).toBe(false);
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    expect((await page.request.get("/api/config")).status()).toBe(401);
    void chat;
  });
});
