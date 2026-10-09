import { SignJWT } from "jose";
import { expect, ipFor, loginUser, test } from "../support/fixtures";
import { PASSWORDS, SESSION_SECRET } from "../support/servers.mjs";

const key = new TextEncoder().encode(SESSION_SECRET);
const sign = (claims: Record<string, unknown>, audience: string, exp: string | number) =>
  new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setAudience(audience).setExpirationTime(exp).sign(key);

test.describe("A · Zugang und Sitzung", () => {
  test("A01 ohne Anmeldung: Seiten leiten auf /login, APIs antworten mit 401", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    const api = await page.request.get("/api/config");
    expect(api.status()).toBe(401);
    expect(await api.json()).toEqual({ error: "Bitte melde dich erneut an." });
    const admin = await page.request.get("/api/admin/overview");
    expect(admin.status()).toBe(401);
  });

  test("A02 Login-Seite zeigt Titel, Spielumgebungs-Hinweis und Link zu StefanAI", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle("Anmelden – Freebie");
    await expect(page.getByRole("heading", { name: "Willkommen bei Freebie" })).toBeVisible();
    await expect(page.getByText("Spielumgebung", { exact: true })).toBeVisible();
    await expect(page.getByText(/Spiel- und Übungsumgebung für unsere Schulungen/)).toBeVisible();
    const link = page.getByRole("link", { name: /StefanAI – Research & Development/ });
    await expect(link).toHaveAttribute("href", /^https:\/\/stefanai\.de/);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("A03 leeres Passwort: Button gesperrt, Enter schickt nichts ab", async ({ page }) => {
    await page.goto("/login");
    const button = page.getByRole("button", { name: "Los geht's" });
    await expect(button).toBeDisabled();
    let posted = false;
    page.on("request", (r) => {
      if (r.url().endsWith("/api/auth/login")) posted = true;
    });
    await page.getByLabel("Passwort").press("Enter");
    await page.getByLabel("Passwort").fill("   ");
    await page.waitForTimeout(300);
    expect(posted).toBe(false);
  });

  test("A04 falsches Passwort wird abgelehnt, das Feld bleibt nutzbar", async ({ page }) => {
    await page.goto("/login");
    const field = page.getByLabel("Passwort");
    await field.fill("falsch");
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Das Passwort stimmt nicht.");
    await expect(field).toBeEditable();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("A05 richtiges Passwort per Enter: Chat öffnet, Sitzungs-Cookie ist sicher gesetzt", async ({ page, context }) => {
    await page.goto("/login");
    await page.getByLabel("Passwort").fill(PASSWORDS.app);
    await page.getByLabel("Passwort").press("Enter");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("dialog", { name: "Wichtiger Hinweis" })).toBeVisible();
    const cookie = (await context.cookies()).find((c) => c.name === "freebie_session");
    expect(cookie).toBeDefined();
    expect(cookie!.httpOnly).toBe(true);
    expect(cookie!.secure).toBe(true);
    expect(cookie!.sameSite).toBe("Lax");
    const hours = (cookie!.expires * 1000 - Date.now()) / 3_600_000;
    expect(hours).toBeGreaterThan(11.9);
    expect(hours).toBeLessThan(12.1);
  });

  test("A06 sehr langes Passwort gilt einfach als falsch", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Passwort").fill("x".repeat(250));
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Das Passwort stimmt nicht.");
  });

  test("A07 nach 50 Fehlversuchen greift die Login-Bremse – nur für diese IP und nicht für den Admin", async ({ page, playwright, baseURL, ip }) => {
    for (let i = 0; i < 49; i++) {
      expect((await page.request.post("/api/auth/login", { data: { password: `falsch-${i}` } })).status()).toBe(401);
    }
    // Eine erfolgreiche Anmeldung zählt ihren Versuch zurück.
    expect((await page.request.post("/api/auth/login", { data: { password: PASSWORDS.app } })).status()).toBe(200);
    expect((await page.request.post("/api/auth/login", { data: { password: "falsch-50" } })).status()).toBe(401);
    const locked = await page.request.post("/api/auth/login", { data: { password: PASSWORDS.app } });
    expect(locked.status()).toBe(429);

    // Die erfolgreiche Anmeldung oben hat ein Cookie gesetzt – für den UI-Test wieder abmelden.
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Passwort").fill(PASSWORDS.app);
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Zu viele Anmeldeversuche. Bitte warte ein paar Minuten.");

    const other = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-andere`) } });
    expect((await other.post("/api/auth/login", { data: { password: PASSWORDS.app } })).status()).toBe(200);
    await other.dispose();
    // Der Admin-Zugang hat einen eigenen Zähler.
    expect((await page.request.post("/api/admin/login", { data: { password: PASSWORDS.admin } })).status()).toBe(200);
  });

  test("A08 abgelaufene, gefälschte und Admin-Tokens öffnen den Chat nicht", async ({ page, context, baseURL }) => {
    const domain = new URL(baseURL!).hostname;
    const tokens = [
      await sign({ sid: "abgelaufen", v: 1 }, "freebie-user", Math.floor(Date.now() / 1000) - 60),
      (await sign({ sid: "gefaelscht", v: 1 }, "freebie-user", "1h")).slice(0, -3) + "abc",
      await sign({ adm: true, v: 1 }, "freebie-admin", "1h"),
      await new SignJWT({ sid: "fremd", v: 1 }).setProtectedHeader({ alg: "HS256" }).setAudience("freebie-user").setExpirationTime("1h").sign(new TextEncoder().encode("anderes-geheimnis-0123456789")),
    ];
    for (const value of tokens) {
      await context.clearCookies();
      await context.addCookies([{ name: "freebie_session", value, domain, path: "/" }]);
      await page.goto("/");
      await expect(page).toHaveURL(/\/login$/);
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
    await page.getByRole("button", { name: "Abmelden" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await context.cookies()).some((c) => c.name === "freebie_session")).toBe(false);
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    expect((await page.request.get("/api/config")).status()).toBe(401);
    void chat;
  });
});
