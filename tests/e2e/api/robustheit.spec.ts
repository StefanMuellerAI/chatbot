import { randomUUID } from "node:crypto";
import { request as playwrightRequest, type APIRequestContext, type APIResponse } from "@playwright/test";
import { expect, test, uniq } from "../support/fixtures";
import { payload } from "../support/files";
import { CRON_SECRET, PASSWORDS } from "../support/servers.mjs";

// U: Alle Routen ohne Browser – Anmeldung, Methoden, kaputte Eingaben, Pfad-Tricks, Header.

type Method = "GET" | "POST" | "PUT" | "DELETE";
const USER_ROUTES: [Method, string][] = [
  ["GET", "/api/config"],
  ["POST", "/api/chat"],
  ["GET", "/api/files/uploads/abcdefgh-1234/notiz.txt"],
  ["POST", "/api/files/process"],
  ["POST", "/api/images"],
  ["POST", "/api/title"],
  ["POST", "/api/transcribe/start"],
  ["POST", "/api/transcribe/chunk"],
  ["POST", "/api/transcribe/finish"],
  ["POST", "/api/transcribe/dictate"],
  ["POST", "/api/upload/local"],
  ["POST", "/api/upload/token"],
  ["POST", "/api/auth/logout"],
];
const ADMIN_ROUTES: [Method, string][] = [
  ["POST", "/api/admin/logout"],
  ["POST", "/api/admin/models/discover"],
  ["GET", "/api/admin/models"],
  ["POST", "/api/admin/models"],
  ["PUT", "/api/admin/models"],
  ["DELETE", "/api/admin/models?id=x"],
  ["POST", "/api/admin/models/test"],
  ["GET", "/api/admin/overview"],
  ["GET", "/api/admin/presets"],
  ["POST", "/api/admin/presets"],
  ["PUT", "/api/admin/presets"],
  ["DELETE", "/api/admin/presets?id=x"],
  ["POST", "/api/admin/security"],
  ["GET", "/api/admin/settings"],
  ["PUT", "/api/admin/settings"],
];

async function client(baseURL: string, ip: string, login?: "user" | "admin"): Promise<APIRequestContext> {
  const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip } });
  if (login === "user") expect((await api.post("/api/auth/login", { data: { password: PASSWORDS.app } })).status()).toBe(200);
  if (login === "admin") expect((await api.post("/api/admin/login", { data: { password: PASSWORDS.admin } })).status()).toBe(200);
  return api;
}

const call = (api: APIRequestContext, method: Method, url: string, init: Parameters<APIRequestContext["fetch"]>[1] = {}) =>
  api.fetch(url, { method, ...init });

/** Fehlermeldungen sind deutsch und verraten keine Interna. */
async function expectGermanError(res: APIResponse, status: number, message?: string | RegExp) {
  const text = await res.text();
  expect(res.status(), `${res.url()}: ${text.slice(0, 300)}`).toBe(status);
  const body = JSON.parse(text) as { error?: string };
  expect(body.error).toBeTruthy();
  expect(body.error).not.toMatch(/Expected|Required|Invalid input|Unexpected token|stack|at \w+ \(/);
  expect(body.error).not.toBe("Es ist ein interner Fehler aufgetreten. Bitte erneut versuchen.");
  if (message) expect(body.error).toMatch(message);
}

test.describe("U · API-Robustheit", () => {
  test("U01 ohne Anmeldung: jede Route antwortet mit 401 und deutscher Meldung", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip);
    for (const [method, url] of USER_ROUTES) {
      await expectGermanError(await call(api, method, url, { data: {} }), 401, "Bitte melde dich erneut an.");
    }
    for (const [method, url] of ADMIN_ROUTES) {
      await expectGermanError(await call(api, method, url, { data: {} }), 401, "Admin-Anmeldung erforderlich.");
    }
    await api.dispose();
  });

  test("U01 gefälschte, fremde und Teilnehmer-Sitzungen öffnen nichts", async ({ baseURL, ip }) => {
    const host = new URL(baseURL!).hostname;
    const forged = await client(baseURL!, ip);
    await forged.storageState();
    const headers = { cookie: "freebie_session=eyJhbGciOiJIUzI1NiJ9.eyJ2IjoxfQ.ungueltig; freebie_admin=abc" };
    expect((await forged.get("/api/config", { headers })).status()).toBe(401);
    expect((await forged.get("/api/admin/settings", { headers })).status()).toBe(401);

    // Ein gültiges Teilnehmer-Cookie unter dem Admin-Namen wird nicht akzeptiert.
    const user = await client(baseURL!, `${ip}-u`, "user");
    const cookie = (await user.storageState()).cookies.find((c) => c.name === "freebie_session" && c.domain.includes(host));
    expect(cookie).toBeTruthy();
    expect((await forged.get("/api/admin/settings", { headers: { cookie: `freebie_admin=${cookie!.value}` } })).status()).toBe(401);
    expect((await user.get("/api/admin/overview")).status()).toBe(401);
    await Promise.all([forged.dispose(), user.dispose()]);
  });

  test("U01 Cookies: httpOnly, SameSite, Secure hinter HTTPS und begrenzte Laufzeit", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip);
    const res = await api.post("/api/auth/login", { data: { password: PASSWORDS.app } });
    const setCookie = res.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value).join("\n");
    expect(setCookie).toMatch(/freebie_session=[^;]+;/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Path=\//);
    expect(setCookie).toMatch(/Max-Age=\d+|Expires=/i);
    expect(setCookie).not.toMatch(/;\s*Secure/i);
    // Hinter HTTPS (wie auf Vercel) ist das Cookie immer Secure.
    const https = await api.post("/api/auth/login", { data: { password: PASSWORDS.app }, headers: { "x-forwarded-proto": "https" } });
    const secure = https.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value).join("\n");
    expect(secure).toMatch(/freebie_session=[^;]+;.*Secure/i);
    const admin = await api.post("/api/admin/login", { data: { password: PASSWORDS.admin }, headers: { "x-forwarded-proto": "https" } });
    const adminCookie = admin.headersArray().find((h) => h.name.toLowerCase() === "set-cookie")?.value ?? "";
    expect(adminCookie).toMatch(/^freebie_admin=[^;]+;/);
    expect(adminCookie).toMatch(/;\s*Secure/i);
    expect(adminCookie).toMatch(/SameSite=Strict/i);
    const logout = await api.post("/api/auth/logout");
    expect(logout.status()).toBe(200);
    expect((await api.get("/api/config")).status()).toBe(401);
    await api.dispose();
  });

  test("U02 falsche Methode ergibt 405", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip, "user");
    const admin = await client(baseURL!, `${ip}-a`, "admin");
    const wrong: [APIRequestContext, Method, string][] = [
      [api, "GET", "/api/chat"],
      [api, "PUT", "/api/config"],
      [api, "DELETE", "/api/auth/login"],
      [api, "GET", "/api/images"],
      [api, "GET", "/api/title"],
      [api, "GET", "/api/transcribe/start"],
      [api, "GET", "/api/upload/token"],
      [api, "POST", "/api/files/uploads/abcdefgh-1234/notiz.txt"],
      [api, "POST", "/api/cron/cleanup"],
      [admin, "GET", "/api/admin/security"],
      [admin, "DELETE", "/api/admin/settings"],
      [admin, "GET", "/api/admin/models/test"],
    ];
    for (const [ctx, method, url] of wrong) {
      expect((await call(ctx, method, url)).status(), `${method} ${url}`).toBe(405);
    }
    await Promise.all([api.dispose(), admin.dispose()]);
  });

  test("U03 kaputtes JSON und Schemafehler ergeben 400 mit deutscher Meldung", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip, "user");
    const admin = await client(baseURL!, `${ip}-a`, "admin");
    const routes: [APIRequestContext, Method, string][] = [
      [api, "POST", "/api/chat"],
      [api, "POST", "/api/files/process"],
      [api, "POST", "/api/images"],
      [api, "POST", "/api/title"],
      [api, "POST", "/api/transcribe/start"],
      [api, "POST", "/api/transcribe/chunk"],
      [api, "POST", "/api/transcribe/finish"],
      [api, "POST", "/api/upload/token"],
      [admin, "POST", "/api/admin/models"],
      [admin, "PUT", "/api/admin/models"],
      [admin, "POST", "/api/admin/models/test"],
      [admin, "POST", "/api/admin/models/discover"],
      [admin, "POST", "/api/admin/presets"],
      [admin, "PUT", "/api/admin/settings"],
      [admin, "POST", "/api/admin/security"],
    ];
    for (const [ctx, method, url] of routes) {
      const broken = await call(ctx, method, url, { headers: { "content-type": "application/json" }, data: "{kaputt" });
      await expectGermanError(broken, 400);
      const wrongShape = await call(ctx, method, url, { data: { unerwartet: [1, 2, 3] } });
      await expectGermanError(wrongShape, 400);
    }
    // Anmeldung: kaputtes JSON zählt nicht als Passwort, liefert aber keinen 500er.
    const login = await client(baseURL!, `${ip}-l`);
    await expectGermanError(await login.post("/api/auth/login", { headers: { "content-type": "application/json" }, data: "{kaputt" }), 400);
    await Promise.all([api.dispose(), admin.dispose(), login.dispose()]);
  });

  test("U03 Grenzwerte: zu lange Nachricht, zu viele Anhänge, zu langer Bild-Prompt, überlanges Passwort", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip, "user");
    const message = (text: string, extra: Record<string, unknown> = {}) => ({
      conversationId: randomUUID(),
      modelId: "claude-sonnet-5-5",
      presetId: null,
      messages: [{ id: randomUUID(), role: "user", text, createdAt: Date.now(), effort: "medium", webSearch: false, ...extra }],
    });
    await expectGermanError(await api.post("/api/chat", { data: message("x".repeat(400_001)) }), 400, "Die Nachricht ist zu lang (höchstens 400.000 Zeichen).");
    const attachment = (i: number) => ({ id: `a${i}`, kind: "document", name: `d${i}.txt`, mime: "text/plain", size: 1, sha256: "0".repeat(64), storageKey: `uploads/abcdefgh-${i}/d.txt` });
    const attachments = Array.from({ length: 21 }, (_, i) => attachment(i));
    await expectGermanError(await api.post("/api/chat", { data: message("Hallo", { attachments }) }), 400, "Zu viele Anhänge (höchstens 20 pro Nachricht).");
    await expectGermanError(await api.post("/api/images", { data: { prompt: "x".repeat(4001), size: "1024x1024", quality: "low" } }), 400);
    await expectGermanError(await api.post("/api/images", { data: { prompt: "Bild", size: "999x999", quality: "low" } }), 400);
    const login = await client(baseURL!, `${ip}-l`);
    await expectGermanError(await login.post("/api/auth/login", { data: { password: "x".repeat(5000) } }), 401, "Das Passwort stimmt nicht.");
    await Promise.all([api.dispose(), login.dispose()]);
  });

  test("U04 Pfad-Tricks bei Dateien werden abgewiesen", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip, "user");
    for (const path of ["..%2F..%2F.env", "uploads/abcdefgh-1234/..%2F..%2Fsecret", "etc/passwd", "uploads/kurz/notiz.txt", "uploads/abcdefgh-1234/%00.txt"]) {
      await expectGermanError(await api.get(`/api/files/${path}`), 400, "Ungültiger Dateipfad.");
    }
    // Kodierte Punkte löst schon der Router auf: die Route wird gar nicht erreicht.
    const dotted = await api.get("/api/files/uploads/%2E%2E/%2E%2E/package.json");
    expect([400, 404]).toContain(dotted.status());
    expect(await dotted.text()).not.toContain('"dependencies"');
    expect((await api.get("/api/files/uploads/abcdefgh-1234/gibt-es-nicht.txt")).status()).toBe(404);

    const file = payload("notiz.txt");
    for (const key of ["../notiz.txt", "images/abcdefgh-1234/notiz.txt", "uploads/abcdefgh-1234/../x.txt"]) {
      const res = await api.post("/api/upload/local", { multipart: { key, file } });
      await expectGermanError(res, 400);
    }
    await expectGermanError(await api.post("/api/files/process", { data: { key: "uploads/../../package.json", name: "x.txt" } }), 400);
    await expectGermanError(await api.post("/api/upload/token", { data: { type: "blob.generate-client-token", payload: { pathname: "images/abcdefgh-1234/x.png", clientPayload: null, multipart: false } } }), 400);
    await api.dispose();
  });

  test("U04 hochgeladene Dateien laufen nie als Seite: Sandbox-CSP und Download", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip, "user");
    // HTML darf als Dokument hochgeladen werden (zum Auslesen), wird aber nie als Seite ausgeliefert.
    const html = `uploads/${uniq()}${uniq()}/seite.html`;
    const page = await api.post("/api/upload/local", { multipart: { key: html, file: { name: "seite.html", mimeType: "text/html", buffer: Buffer.from("<script>alert(1)</script>") } } });
    expect(page.status(), await page.text()).toBe(200);
    const served = await api.get(`/api/files/${html}`);
    expect(served.headers()["content-security-policy"]).toMatch(/^sandbox;/);
    expect(served.headers()["content-disposition"]).toMatch(/^attachment;/);
    // Auch eine als .txt getarnte Seite wird als Download ausgeliefert.
    const txt = `uploads/${uniq()}${uniq()}/seite.txt`;
    const up = await api.post("/api/upload/local", { multipart: { key: txt, file: { name: "seite.txt", mimeType: "text/html", buffer: Buffer.from("<script>alert(1)</script>") } } });
    expect(up.status(), await up.text()).toBe(200);
    const res = await api.get(`/api/files/${txt}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-security-policy"]).toContain("sandbox");
    expect(res.headers()["content-disposition"]).toMatch(/^attachment;/);
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    await api.dispose();
  });

  test("U05 Aufräumjob nur mit dem richtigen Secret", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip);
    await expectGermanError(await api.get("/api/cron/cleanup"), 401, "Nicht erlaubt.");
    await expectGermanError(await api.get("/api/cron/cleanup", { headers: { authorization: "Bearer falsch" } }), 401);
    await expectGermanError(await api.get("/api/cron/cleanup", { headers: { authorization: CRON_SECRET } }), 401);
    const ok = await api.get("/api/cron/cleanup", { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    expect(ok.status(), await ok.text()).toBe(200);
    const body = await ok.json();
    for (const key of ["deletedFiles", "deletedTexts", "deletedTranscripts"]) expect(typeof body[key]).toBe("number");
    await api.dispose();
  });

  test("U06 Sicherheits-Header auf Seiten, API-Antworten und Fehlern", async ({ baseURL, ip }) => {
    const api = await client(baseURL!, ip);
    const user = await client(baseURL!, `${ip}-u`, "user");
    const responses = [
      await api.get("/login"),
      await api.get("/admin"),
      await api.get("/api/config"), // 401 aus dem Proxy
      await user.get("/api/config"),
      await user.get("/"),
      await user.post("/api/chat", { data: {} }), // 400
    ];
    for (const res of responses) {
      const h = res.headers();
      expect(h["x-content-type-options"], res.url()).toBe("nosniff");
      expect(h["x-frame-options"], res.url()).toBe("DENY");
      expect(h["referrer-policy"], res.url()).toBe("strict-origin-when-cross-origin");
      expect(h["strict-transport-security"], res.url()).toContain("max-age=");
      expect(h["permissions-policy"], res.url()).toContain("microphone=(self)");
    }
    await Promise.all([api.dispose(), user.dispose()]);
  });
});
