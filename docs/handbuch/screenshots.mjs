// Screenshots für das Handbuch – gegen einen Freebie-Server im Testmodus (siehe erstellen.mjs).
// Legt Beispieltermine an, lädt Beispiel-Chats über den Import und fotografiert jede Ansicht.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { request } from "@playwright/test";
import { patchEvents, patchOverview, sampleChats } from "./beispieldaten.mjs";

const iso = (min) => new Date(Date.now() + min * 60_000).toISOString();
let ipCounter = 10;
const ip = () => `10.77.0.${ipCounter++}`;

export async function takeScreenshots({ browser, baseURL, admin, outDir, filesDir }) {
  const failures = [];

  async function shot(target, name) {
    await target.screenshot({ path: path.join(outDir, `${name}.jpg`), type: "jpeg", quality: 86, animations: "disabled" });
    console.log("  ✓", name);
  }

  /** Ganze Seite ohne Scrollen: Fenster so hoch wie der Inhalt (die fixierte Kopfzeile bleibt oben). */
  async function fullShot(page, name) {
    for (let i = 0; i < 2; i++) {
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width: 1280, height: Math.min(Math.max(h, 800), 8000) });
      await page.waitForTimeout(400);
    }
    await shot(page, name);
    await page.setViewportSize({ width: 1280, height: 800 });
  }

  async function step(name, fn) {
    try {
      await fn();
    } catch (err) {
      failures.push(`${name}: ${err.message.split("\n")[0]}`);
      console.error("  ✗", name, err.message.split("\n")[0]);
    }
  }

  const newContext = (extra = {}) =>
    browser.newContext({
      baseURL,
      viewport: { width: 1280, height: 800 },
      // 1280 px breit, 1,4-fach aufgelöst: scharf im PDF, ohne es aufzublähen.
      deviceScaleFactor: 1.4,
      locale: "de-DE",
      timezoneId: "Europe/Berlin",
      colorScheme: "light",
      extraHTTPHeaders: { "x-forwarded-for": ip() },
      ...extra,
    });

  async function loginForm(page, user) {
    await page.goto("/login");
    await page.getByLabel("Benutzername").fill(user.username);
    await page.getByLabel("Passwort").fill(user.password);
    await page.getByLabel("Passwort").press("Enter");
    await page.waitForURL(/\/$/);
    const dialog = page.getByRole("dialog", { name: "Wichtiger Hinweis" });
    await dialog.waitFor();
    return dialog;
  }

  async function ask(page, text) {
    const answers = page.getByRole("article", { name: "Antwort von Freebie" });
    const before = await answers.count();
    await page.getByRole("textbox", { name: "Nachricht" }).fill(text);
    await page.getByRole("button", { name: "Senden", exact: true }).click();
    await answers.nth(before).waitFor();
    await page.waitForFunction((n) => document.querySelectorAll('article[aria-label="Antwort von Freebie"][aria-busy="false"]').length > n, before);
  }

  // ---------------------------------------------------------------- Beispieldaten anlegen

  const api = await request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip() } });
  const login = await api.post("/api/auth/login", { data: admin });
  if (!login.ok()) throw new Error(`Admin-Login fehlgeschlagen: ${await login.text()}`);
  const json = async (method, url, data) => {
    const res = await api.fetch(url, { method, data });
    const body = await res.json();
    if (!res.ok()) throw new Error(`${method} ${url}: ${JSON.stringify(body)}`);
    return body;
  };
  const today = await json("POST", "/api/admin/events", { name: "KI-Grundlagen – Team Bürgerservice", startsAt: iso(-90), endsAt: iso(300) });
  const vormittag = await json("POST", "/api/admin/events/groups", { eventId: today.id, name: "Vormittag", count: 8 });
  const nachmittag = await json("POST", "/api/admin/events/groups", { eventId: today.id, name: "Nachmittag", count: 6 });
  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setHours(16, 0, 0, 0);
  const later = await json("POST", "/api/admin/events", { name: "Prompting-Werkstatt", startsAt: start.toISOString(), endsAt: end.toISOString() });
  await json("POST", "/api/admin/events/groups", { eventId: later.id, name: "Gruppe 1", count: 10 });
  const short = await json("POST", "/api/admin/events", { name: "Kurzschulung Datenschutz", startsAt: iso(-60), endsAt: iso(9) });
  const shortGroup = await json("POST", "/api/admin/events/groups", { eventId: short.id, name: "Teilnehmende", count: 3 });
  await api.dispose();
  const state = { today: today.id, vormittag, nachmittag };

  // Etwas echte Nutzung für die Statistik: drei Gäste und die Kursleitung fragen.
  for (const [i, user] of [vormittag.guests[0], vormittag.guests[1], nachmittag.guests[0], admin].entries()) {
    const ctx = await newContext();
    const page = await ctx.newPage();
    await (await loginForm(page, user)).getByRole("button", { name: "Verstanden" }).click();
    for (let q = 0; q <= i % 2; q++) await ask(page, `Frage ${q + 1} von Person ${i + 1} zur Statistik`);
    await ctx.close();
  }

  // Beispieldateien für die Anhänge: kleines PDF, CSV und Foto.
  const files = await browser.newPage();
  await files.setContent(
    `<main style="font-family:sans-serif;padding:40px"><h1>Quartalsbericht Bürgerservice</h1><p>Die Zahl der Online-Anträge stieg um 18 Prozent. Wartezeiten sanken auf durchschnittlich 9 Minuten.</p></main>`,
  );
  await files.pdf({ path: path.join(filesDir, "bericht.pdf"), format: "A4" });
  await files.setViewportSize({ width: 640, height: 480 });
  await files.setContent(`<div style="width:100vw;height:100vh;margin:-8px;background:linear-gradient(135deg,#ff6900,#e41c68)"></div>`);
  await files.screenshot({ path: path.join(filesDir, "foto.jpg"), type: "jpeg" });
  await files.close();
  writeFileSync(path.join(filesDir, "umsatz.csv"), "Monat;Anträge;Online\nJanuar;1240;61 %\nFebruar;1185;64 %\nMärz;1310;68 %\n");

  // ---------------------------------------------------------------- Chat

  const ctx = await newContext();
  const page = await ctx.newPage();
  const guest = vormittag.guests[3];

  await step("Anmeldeseite", async () => {
    await page.goto("/login");
    await page.getByLabel("Benutzername").fill(guest.username);
    await page.getByLabel("Passwort").fill("••••••••");
    await shot(page, "c01-login");
    await page.getByLabel("Passwort").fill("");
  });

  const notice = await loginForm(page, guest);
  await step("Hinweis", () => shot(page, "c02-hinweis"));
  await notice.getByRole("button", { name: "Verstanden" }).click();
  await page.getByRole("textbox", { name: "Nachricht" }).waitFor();
  await page.waitForTimeout(500);
  await step("Startseite", () => shot(page, "c03-start"));

  await step("Modellauswahl", async () => {
    await page.getByRole("button", { name: /^Modell:/ }).click();
    await page.getByRole("listbox", { name: "Modell wählen" }).waitFor();
    await shot(page, "c04-modelle");
    await page.keyboard.press("Escape");
  });

  await step("Denktiefe", async () => {
    await page.getByRole("button", { name: /^Denktiefe:/ }).click();
    await page.getByRole("menu", { name: "Denktiefe" }).waitFor();
    await shot(page, "c05-denktiefe");
    await page.keyboard.press("Escape");
  });

  // Beispiel-Chats über den eingebauten Import laden.
  page.once("dialog", (d) => void d.accept());
  await page.getByLabel("Export-Datei für den Import").setInputFiles({
    name: "freebie-chats.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(sampleChats())),
  });
  const nav = page.getByRole("navigation", { name: "Chatverlauf" });
  await nav.getByRole("button", { name: "E-Mail zur Terminverschiebung", exact: true }).waitFor();
  const answer = () => page.getByRole("article", { name: "Antwort von Freebie" }).last();
  const panel = () => page.getByRole("region", { name: /^Artefakt:/ });
  const open = async (title) => {
    await nav.getByRole("button", { name: title, exact: true }).click();
    await page.getByRole("article", { name: "Antwort von Freebie" }).first().waitFor();
    await page.waitForTimeout(400);
  };

  await step("Antwort", async () => {
    await open("E-Mail zur Terminverschiebung");
    await answer().hover();
    await shot(page, "c06-antwort");
  });

  await step("Gedankengang", async () => {
    const toggle = answer().getByRole("button", { name: /Gedankengang/ }).first();
    await toggle.click();
    await page.waitForTimeout(300);
    await shot(answer(), "c07-gedankengang");
    await toggle.click();
  });

  await step("Quellen", async () => {
    await open("Was ist die KI-Verordnung?");
    await answer().hover();
    await shot(page, "c08-quellen");
  });

  await step("Artefakt", async () => {
    await open("Landingpage Tag der offenen Tür");
    await answer().getByRole("button", { name: /Tag der offenen Tür/ }).click();
    await panel().waitFor();
    await page.waitForTimeout(1200);
    await shot(page, "c09-artefakt");
    await panel().getByRole("tab", { name: "Code" }).click();
    await page.waitForTimeout(300);
    await shot(page, "c10-artefakt-code");
    await panel().getByRole("button", { name: "Panel schließen" }).click();
  });

  await step("Diagramm", async () => {
    await open("Ablauf Urlaubsantrag");
    await answer().getByRole("button", { name: /Ablauf Urlaubsantrag/ }).click();
    await panel().waitFor();
    await page.waitForTimeout(1500);
    await shot(page, "c11-diagramm");
    await panel().getByRole("button", { name: "Panel schließen" }).click();
  });

  await step("Antwort-Cache", async () => {
    await open("Excel: SVERWEIS erklärt");
    await answer().hover();
    await shot(page, "c12-cache");
  });

  await step("Suche", async () => {
    await page.getByLabel("Chats durchsuchen").fill("Excel");
    await page.waitForTimeout(300);
    await shot(page.locator("aside").first(), "c13-suche");
    await page.getByLabel("Chats durchsuchen").fill("");
  });

  await step("Anhänge", async () => {
    await page.getByRole("button", { name: "Neuer Chat" }).first().click();
    await page.getByLabel("Dateien zum Anhängen").setInputFiles(["bericht.pdf", "umsatz.csv", "foto.jpg"].map((f) => path.join(filesDir, f)));
    await page.getByRole("group", { name: "Anhänge" }).waitFor();
    // „Senden“ wird erst aktiv, wenn alle Anhänge fertig verarbeitet sind.
    await page.waitForFunction(() => document.querySelector('button[aria-label="Senden"]')?.disabled === false, null, { timeout: 60_000 });
    await page.waitForTimeout(500);
    await page.getByRole("textbox", { name: "Nachricht" }).fill("Fasse den Bericht in drei Punkten zusammen und vergleiche ihn mit den Umsatzzahlen.");
    await shot(page, "c14-anhaenge");
  });

  await step("Bild-Modus", async () => {
    await page.getByRole("button", { name: "Neuer Chat" }).first().click();
    await page.getByRole("button", { name: "Bild-Modus" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Bildbeschreibung").fill("Freundliche Illustration: Ein Team im Rathaus probiert gemeinsam einen KI-Assistenten am Laptop aus, helle Farben");
    await shot(page, "c15-bildmodus");
    await dialog.getByRole("button", { name: "Bild erzeugen" }).click();
    await answer().getByRole("img").first().waitFor({ timeout: 60_000 });
    await page.waitForTimeout(800);
    await shot(page, "c16-bild");
  });

  await step("Dunkles Farbschema", async () => {
    await open("E-Mail zur Terminverschiebung");
    await page.getByRole("button", { name: /Dunkel/ }).click();
    await page.waitForTimeout(500);
    await shot(page, "c17-dunkel");
    await page.getByRole("button", { name: /Hell/ }).click();
  });

  const storageState = await ctx.storageState();
  await ctx.close();

  await step("Handy", async () => {
    const mobile = await newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, storageState });
    const p = await mobile.newPage();
    await p.goto("/");
    await p.getByRole("textbox", { name: "Nachricht" }).waitFor();
    await p.waitForTimeout(600);
    await shot(p, "c18-mobil");
    await p.getByRole("button", { name: "Menü öffnen" }).click();
    await p.waitForTimeout(500);
    await shot(p, "c19-mobil-menue");
    await mobile.close();
  });

  await step("Warnung vor dem Ende", async () => {
    const c = await newContext();
    const p = await c.newPage();
    await (await loginForm(p, shortGroup.guests[0])).getByRole("button", { name: "Verstanden" }).click();
    await p.getByRole("status").filter({ hasText: "Dein Zugang endet um" }).waitFor();
    await p.waitForTimeout(400);
    await shot(p, "c20-warnung");
    await c.close();
  });

  await step("Zugang abgelaufen", async () => {
    const c = await newContext();
    const p = await c.newPage();
    await p.goto("/login?grund=abgelaufen");
    await shot(p, "c21-abgelaufen");
    await c.close();
  });

  // ---------------------------------------------------------------- Admin-Bereich

  const actx = await newContext();
  await actx.route("**/api/admin/overview", async (route) => {
    const res = await route.fetch();
    await route.fulfill({ response: res, json: patchOverview(await res.json(), state) });
  });
  await actx.route(/\/api\/admin\/events(\?.*)?$/, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    const res = await route.fetch();
    await route.fulfill({ response: res, json: patchEvents(await res.json(), state) });
  });
  const adminPage = await actx.newPage();
  const res = await adminPage.request.post("/api/auth/login", { data: admin });
  if (!res.ok()) throw new Error("Admin-Login fehlgeschlagen");
  await adminPage.goto("/admin");
  await adminPage.getByRole("tablist", { name: "Admin-Bereiche" }).waitFor();
  await adminPage.waitForTimeout(800);
  const tab = async (name) => {
    await adminPage.getByRole("tab", { name }).click();
    await adminPage.waitForTimeout(700);
  };
  const card = (heading) => adminPage.getByRole("heading", { name: heading }).locator("xpath=ancestor::section[1]");

  await step("Übersicht", () => fullShot(adminPage, "a01-uebersicht"));
  await step("Nach Termin", async () => {
    await card("Nach Termin").getByRole("button", { name: /Gruppen von „KI-Grundlagen/ }).click();
    await adminPage.waitForTimeout(300);
    await shot(card("Nach Termin"), "a02-nach-termin");
  });

  await step("Termine", async () => {
    await tab("Termine");
    await fullShot(adminPage, "a04-termine");
  });
  await step("Termin anlegen", async () => {
    await adminPage.getByRole("button", { name: "Termin anlegen" }).click();
    await adminPage.getByRole("dialog").getByLabel("Name").fill("Excel für Einsteiger");
    await shot(adminPage, "a05-termin-dialog");
    await adminPage.keyboard.press("Escape");
  });
  await step("Gruppe hinzufügen", async () => {
    await adminPage.getByRole("button", { name: /^Gruppe zu „KI-Grundlagen/ }).click();
    const dialog = adminPage.getByRole("dialog");
    await dialog.getByLabel("Name der Gruppe").fill("Abendgruppe");
    await dialog.getByLabel("Anzahl der Gäste").fill("12");
    await shot(adminPage, "a06-gruppe-dialog");
    await adminPage.keyboard.press("Escape");
  });
  await step("Gruppe", async () => {
    const group = adminPage.getByRole("group", { name: "Gruppe „Vormittag“" }).first();
    await group.getByRole("button", { name: "Passwörter in „Vormittag“ zeigen" }).click();
    await adminPage.waitForTimeout(300);
    await shot(group, "a07-gruppe");
    await group.getByRole("button", { name: "Passwörter in „Vormittag“ verbergen" }).click();
  });
  await step("Geplant", async () => {
    await adminPage.getByRole("button", { name: /^Geplant/ }).click();
    await adminPage.waitForTimeout(400);
    await shot(adminPage, "a08-geplant");
    await adminPage.getByRole("button", { name: /^Läuft/ }).click();
  });
  await step("Druckansicht", async () => {
    // Adresse auf den Kärtchen wie in der Live-Installation.
    const printCtx = await newContext({ storageState: await actx.storageState(), extraHTTPHeaders: { "x-forwarded-for": ip(), "x-forwarded-host": "freebie.stefanai.de" } });
    const p = await printCtx.newPage();
    await p.goto(`/admin/druck?termin=${today.id}&gruppe=${vormittag.id}`);
    await p.getByRole("list", { name: "Zugangskärtchen" }).waitFor();
    await p.waitForTimeout(500);
    await shot(p, "a09-druck");
    await printCtx.close();
  });

  await step("Modelle", async () => {
    await tab("Modelle");
    await fullShot(adminPage, "a10-modelle");
    await adminPage.setViewportSize({ width: 1280, height: 1700 });
    await adminPage.getByRole("button", { name: "Claude Sonnet 5.5 bearbeiten" }).click();
    await adminPage.getByRole("dialog").waitFor();
    await adminPage.waitForTimeout(300);
    await shot(adminPage.getByRole("dialog"), "a11-modell-dialog");
    await adminPage.keyboard.press("Escape");
    await adminPage.setViewportSize({ width: 1280, height: 800 });
  });

  await step("Einstellungen", async () => {
    await tab("Einstellungen");
    await fullShot(adminPage, "a12-einstellungen");
  });

  await step("Vorlagen", async () => {
    await tab("Vorlagen");
    await fullShot(adminPage, "a13-vorlagen");
    await adminPage.setViewportSize({ width: 1280, height: 1500 });
    await adminPage.getByRole("button", { name: "Vorlage „E-Mail-Profi“ bearbeiten" }).click();
    await adminPage.getByRole("dialog").waitFor();
    await adminPage.waitForTimeout(300);
    await shot(adminPage.getByRole("dialog"), "a14-vorlage-dialog");
    await adminPage.keyboard.press("Escape");
    await adminPage.setViewportSize({ width: 1280, height: 800 });
  });

  await step("Sicherheit", async () => {
    await tab("Sicherheit");
    await fullShot(adminPage, "a15-sicherheit");
  });
  await actx.close();

  if (failures.length) throw new Error(`${failures.length} Screenshot(s) fehlgeschlagen:\n- ${failures.join("\n- ")}`);
}
