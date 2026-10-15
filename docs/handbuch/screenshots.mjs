// Screenshots für das Handbuch – gegen einen Freebie-Server im Testmodus (siehe erstellen.mjs).
// Legt Beispieltermine an, lädt Beispiel-Chats über den Import und fotografiert jede Ansicht.
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { request } from "@playwright/test";
import {
  EXERCISE_BODY,
  EXERCISE_SUBJECT,
  GROUP_QUESTION,
  GROUP_TITLE,
  groupAnswer,
  groupNotes,
  OWN_DOC,
  ownDocx,
  ownThreadMails,
  patchEvents,
  patchOverview,
  sampleChats,
} from "./beispieldaten.mjs";

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

  /** Im Testmodus antwortet Freebie mit einer Diagnose – im Bild steht stattdessen das Beispielprotokoll. */
  async function patchGroupAnswers(context, text) {
    await context.route(/\/api\/groupchats\/[^/?]+\?since=/, async (route) => {
      const res = await route.fetch();
      const body = await res.json();
      for (const m of body.chat?.messages ?? []) {
        if (m.kind !== "freebie" || m.status !== "done") continue;
        m.text = text;
        delete m.thinking;
      }
      await route.fulfill({ response: res, json: body });
    });
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
  // Fundus pflegen: ein eigenes Dokument, ein eigener Verlauf, ein ausgeblendeter mitgelieferter Eintrag.
  const upload = async (name, buffer) => {
    const key = `fundus/${randomUUID()}/${name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "_")}`;
    const res = await api.post("/api/admin/fundus/local", { multipart: { key, file: { name, mimeType: "application/octet-stream", buffer } } });
    if (!res.ok()) throw new Error(`Fundus-Upload ${name}: ${await res.text()}`);
    return { key, name };
  };
  const ownDoc = await upload(OWN_DOC.name, ownDocx(OWN_DOC.paragraphs));
  await json("POST", "/api/admin/fundus/documents", {
    confirmed: true,
    files: [{ ...ownDoc, title: OWN_DOC.title, summary: OWN_DOC.summary, date: iso(-24 * 60).slice(0, 10), tags: ["personendaten"], keywords: OWN_DOC.keywords }],
  });
  const threadFiles = [];
  for (const m of ownThreadMails()) threadFiles.push(await upload(m.name, Buffer.from(m.text)));
  await json("POST", "/api/admin/fundus/threads", {
    confirmed: true,
    files: threadFiles,
    title: "Sondernutzung Marktplatz – Herbstfest",
    summary: "Heimatverein fragt nach Genehmigung, Ordnungsamt fordert Unterlagen nach.",
    tags: ["unstrukturiert"],
    keywords: ["Sondernutzung", "Marktplatz"],
  });
  await json("PUT", "/api/admin/fundus/hidden", { id: "bh-beschwerde-laerm-dgh", hidden: true });
  for (const m of ownThreadMails("-neu")) writeFileSync(path.join(filesDir, m.name), m.text);
  writeFileSync(path.join(filesDir, OWN_DOC.name), ownDocx(OWN_DOC.paragraphs.slice(0, 3)));
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
    buffer: Buffer.from(JSON.stringify(sampleChats(guest.username))),
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

  // ---------------------------------------------------------------- Fundus

  const fundus = page.getByRole("dialog", { name: "Fundus" });
  const vorschau = fundus.getByRole("region", { name: "Vorschau" });
  const fundusItem = (list, id) => fundus.getByRole("listbox", { name: list }).locator(`[data-id="${id}"]`);
  const pending = page.getByRole("group", { name: "Anhänge" }).getByRole("button", { name: /entfernen$/ });
  const clearAttachments = async () => {
    while (await pending.count()) await pending.first().click();
  };

  /** Nur den grauen Rahmen um die Datei aufnehmen – so weit er im Vorschaubereich zu sehen ist. */
  async function previewShot(id, testId, name) {
    await fundusItem("Dokumente", id).click();
    const frame = vorschau.getByTestId(testId).locator("xpath=..");
    await frame.waitFor();
    await frame.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(400);
    const region = await vorschau.boundingBox();
    const box = await frame.boundingBox();
    const top = Math.max(region.y, box.y);
    const bottom = Math.min(region.y + region.height, box.y + box.height);
    const clip = { x: box.x, y: top, width: box.width, height: bottom - top };
    await page.screenshot({ path: path.join(outDir, `${name}.jpg`), type: "jpeg", quality: 86, animations: "disabled", clip });
    console.log("  ✓", name);
  }

  await step("Fundus", async () => {
    await page.getByRole("button", { name: "Neuer Chat" }).first().click();
    await clearAttachments();
    // Etwas höher, damit unter den Angaben zur Datei auch der Briefkopf zu sehen ist.
    await page.setViewportSize({ width: 1280, height: 1050 });
    await page.getByRole("button", { name: "Fundus öffnen" }).click();
    await fundusItem("Dokumente", "fb-budgetueberwachung-th51").waitFor();
    // Zwei Dateien vormerken; die zuletzt angeklickte steht in der Vorschau.
    for (const id of ["fb-budgetueberwachung-th51", "fb-beschlussvorlage-kita-nordstadt"]) {
      await fundusItem("Dokumente", id).locator('[data-role="auswahl"]').click();
    }
    await vorschau.getByTestId("vorschau-word").waitFor();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    await shot(page, "c27-fundus");
  });

  await step("Fundus-Vorschauen", async () => {
    await fundus.getByRole("button", { name: "Auswahl aufheben" }).click();
    await previewShot("fb-budgetueberwachung-th51", "vorschau-excel", "c28-fundus-excel");
    await previewShot("fb-buergeramt-2030", "vorschau-powerpoint", "c29-fundus-folien");
  });

  await step("Fundus-E-Mails", async () => {
    await fundus.getByRole("tab", { name: /^E-Mails/ }).click();
    await fundusItem("E-Mail-Verläufe", "fb-mitzeichnung-kita-nordstadt").click();
    await fundus.getByRole("region", { name: "Verlauf" }).getByRole("article").first().waitFor();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    await shot(page, "c30-fundus-mails");
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  await step("Fundus im Chat", async () => {
    // Ganzer Verlauf mit „Anhänge mitnehmen“: die jüngste Mail und die Beschlussvorlage aus der ersten.
    await fundus.getByRole("button", { name: "Ganzen Verlauf anhängen" }).click();
    await fundus.waitFor({ state: "hidden" });
    await page.waitForFunction(() => document.querySelector('button[aria-label="Senden"]')?.disabled === false, null, { timeout: 60_000 });
    await page.getByRole("textbox", { name: "Nachricht" }).fill("Was muss in der Beschlussvorlage nach den Rückmeldungen aus der Mitzeichnung geändert werden?");
    await page.waitForTimeout(500);
    // Nur das Eingabefeld – die ganze Seite zeigt schon „Anhänge“ in Kapitel 2.8.
    await shot(page.getByRole("group", { name: "Anhänge" }).locator("xpath=.."), "c31-fundus-chat");
    await page.getByRole("textbox", { name: "Nachricht" }).fill("");
    await clearAttachments();
  });

  // ---------------------------------------------------------------- Prompts

  const mask = page.getByRole("dialog", { name: "Prompt ausfüllen" });
  await step("Fundus-Prompts", async () => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole("button", { name: "Fundus öffnen" }).click();
    await fundus.getByRole("tab", { name: /^Prompts/ }).click();
    await fundus.getByRole("listbox", { name: "Prompts" }).locator('[data-id="prompt-mailverlauf"]').click();
    await fundus.getByTestId("prompt-text").waitFor();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    await shot(page, "c38-fundus-prompts");
  });

  await step("Prompt-Maske", async () => {
    await fundus.getByRole("button", { name: "Ausfüllen und einfügen" }).click();
    await mask.waitFor();
    await mask.getByLabel("Zielgruppe", { exact: true }).fill("die Amtsleitung");
    await mask.getByLabel("Was ist dir wichtig?", { exact: true }).click();
    await page.waitForTimeout(400);
    await shot(page, "c39-prompt-maske");
  });

  await step("Prompt eingefügt", async () => {
    await mask.getByLabel("Was ist dir wichtig?", { exact: true }).fill("Fristen und Kosten");
    await mask.getByRole("button", { name: "Einfügen", exact: true }).click();
    await mask.waitFor({ state: "hidden" });
    await fundus.waitFor({ state: "hidden" });
    await page.waitForTimeout(500);
    await shot(page.getByRole("textbox", { name: "Nachricht" }).locator("xpath=.."), "c40-prompt-eingefuegt");
    await page.getByRole("textbox", { name: "Nachricht" }).fill("");
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  // ---------------------------------------------------------------- Posteingang

  /** Eigene API-Sitzung, um Beispiel-Mails zu verschicken. */
  async function mailApi(user) {
    const c = await request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip() } });
    const r = await c.post("/api/auth/login", { data: user });
    if (!r.ok()) throw new Error(`Anmeldung für Beispiel-Mails fehlgeschlagen: ${await r.text()}`);
    return c;
  }
  async function sendMail(c, to, subject, body, cc = []) {
    const r = await c.post("/api/mail", { data: { to, cc, subject, body } });
    if (!r.ok()) throw new Error(`Beispiel-Mail „${subject}“: ${await r.text()}`);
  }
  const g = vormittag.guests;
  const views = page.getByRole("group", { name: "Ansicht wechseln" });

  await step("Beispiel-Mails", async () => {
    // Die Übung der Kursleitung an die Gruppe, zwei Mails aus der Gruppe und eine eigene Antwort.
    const teacher = await mailApi(admin);
    await sendMail(teacher, g.map((x) => x.username), EXERCISE_SUBJECT, EXERCISE_BODY);
    const a = await mailApi(g[0]);
    await sendMail(
      a,
      [guest.username, g[2].username],
      "Treffen zur Abschlussrunde",
      `Hallo ihr beiden,\n\nwollen wir uns für die Abschlussrunde um 15:30 Uhr in Raum 2.14 treffen? Ich bringe die Folien mit.\n\nViele Grüße\n${g[0].username}`,
    );
    const me = await mailApi(guest);
    await sendMail(
      me,
      [g[0].username],
      "AW: Treffen zur Abschlussrunde",
      `Passt mir gut, bis dann!\n\n> Hallo ihr beiden,\n> wollen wir uns für die Abschlussrunde um 15:30 Uhr in Raum 2.14 treffen?`,
    );
    const b = await mailApi(g[1]);
    await sendMail(
      b,
      [guest.username],
      "Mein Entwurf an Herrn Albers",
      `Hallo,\n\nhier mein erster Entwurf für die Übung – magst du kurz drüberschauen? Freebie hat mir beim Ton geholfen.\n\n> Sehr geehrter Herr Albers,\n> es tut uns leid, dass Sie so lange warten mussten …\n\nDanke dir!\n${g[1].username}`,
      [g[0].username],
    );
    await Promise.all([teacher, a, me, b].map((c) => c.dispose()));
    // Neu laden: die erste Abfrage merkt sich den Stand, sonst erschiene „Neue E-Mail von …“ im Bild.
    await page.goto("/?ansicht=posteingang");
    await page.getByRole("heading", { name: "Posteingang", level: 1 }).waitFor();
  });

  await step("Posteingang", async () => {
    await page.getByRole("list", { name: "E-Mails" }).getByRole("button", { name: new RegExp(EXERCISE_SUBJECT) }).click();
    await page.getByRole("region", { name: "Lesebereich" }).getByRole("heading", { name: EXERCISE_SUBJECT }).waitFor();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    await shot(page, "c22-posteingang");
  });

  await step("E-Mail schreiben", async () => {
    await page.getByRole("button", { name: "Neue E-Mail" }).first().click();
    const d = page.getByRole("dialog", { name: "Neue E-Mail" });
    const to = d.getByRole("textbox", { name: "An", exact: true });
    await to.fill(g[0].username);
    await to.press("Enter");
    await d.getByRole("textbox", { name: "Betreff" }).fill("Folien für die Abschlussrunde");
    await d.getByLabel("Text der E-Mail").fill(`Hallo ${g[0].username},\n\ndanke fürs Mitbringen! Kannst du noch eine Folie mit den Wartezeiten ergänzen? Die Zahlen schicke ich dir gleich.\n\nViele Grüße\n${guest.username}`);
    await d.getByRole("button", { name: "Adressbuch" }).first().click();
    await d.getByRole("list", { name: "Adressbuch für „An“" }).waitFor();
    // Etwas höher, damit der ganze Dialog samt „Senden“ ins Bild passt.
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.waitForTimeout(400);
    await shot(page, "c23-schreiben");
    await page.setViewportSize({ width: 1280, height: 800 });
    await d.getByRole("button", { name: "Adressbuch" }).first().click();
    await d.getByRole("button", { name: "Verwerfen" }).last().click();
    await d.getByRole("alert").getByRole("button", { name: "Verwerfen" }).click();
    await d.waitFor({ state: "hidden" });
  });

  await step("Verbindungen", async () => {
    await views.getByRole("button", { name: "Chat", exact: true }).click();
    await page.getByRole("button", { name: "Neuer Chat" }).first().click();
    await page.getByRole("textbox", { name: "Nachricht" }).fill("Was steht in meinen neuen E-Mails?");
    await page.getByRole("button", { name: /^Verbindungen/ }).click();
    await page.getByRole("dialog", { name: "Verbindungen" }).getByRole("switch", { name: "Posteingang" }).click();
    await page.waitForTimeout(300);
    await shot(page, "c24-verbindungen");
    await page.keyboard.press("Escape");
    await page.getByRole("textbox", { name: "Nachricht" }).fill("");
  });

  await step("Antwort mit E-Mails", async () => {
    await open("Antwort an Herrn Albers");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    await shot(page, "c25-mail-antwort");
  });

  // ---------------------------------------------------------------- Gruppenchat

  const groupNames = g.slice(0, 3).map((x) => x.username);
  const membersButton = (p) => p.getByRole("button", { name: /^Mitglieder \(\d+\)$/ }).filter({ visible: true });

  await step("Neuer Gruppenchat", async () => {
    await patchGroupAnswers(ctx, groupAnswer(groupNames));
    await page.getByRole("button", { name: "Neuer Gruppenchat" }).click();
    const d = page.getByRole("dialog", { name: "Neuer Gruppenchat" });
    await d.getByRole("textbox", { name: "Name" }).fill(GROUP_TITLE);
    for (const name of groupNames) await d.getByRole("checkbox", { name }).check();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(400);
    await shot(page, "c33-gruppenchat-neu");
    await d.getByRole("button", { name: "Chat starten" }).click();
    await d.waitFor({ state: "hidden" });
  });

  await step("Gruppenchat", async () => {
    const { chats } = await (await page.request.get("/api/groupchats")).json();
    const id = chats.find((c) => c.title === GROUP_TITLE).id;
    for (const [i, text] of groupNotes(groupNames)) {
      const c = await mailApi(g[i]);
      const r = await c.post(`/api/groupchats/${id}/messages`, { data: { text } });
      if (!r.ok()) throw new Error(`Beispiel-Beitrag: ${await r.text()}`);
      await c.dispose();
    }
    await page.getByRole("textbox", { name: "Nachricht" }).fill(GROUP_QUESTION);
    await page.getByRole("button", { name: "Senden", exact: true }).click();
    await page.getByText("Protokoll der Teamrunde Bürgerservice").waitFor({ timeout: 30_000 });
    // Der Hinweis „Gruppenchat … gestartet“ ist dann verschwunden.
    await page.waitForTimeout(4500);
    await page.setViewportSize({ width: 1280, height: 1150 });
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    await shot(page, "c34-gruppenchat");
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  await step("Gruppenchat: Vorschläge", async () => {
    const input = page.getByRole("textbox", { name: "Nachricht" });
    await input.fill("Danke dir! @");
    const list = page.getByRole("listbox", { name: "Vorschläge" });
    await list.waitFor();
    await page.waitForTimeout(300);
    const top = (await list.boundingBox()).y - 16;
    const box = await input.locator("xpath=..").boundingBox();
    const clip = { x: box.x - 16, y: top, width: box.width + 32, height: box.y + box.height + 16 - top };
    await page.screenshot({ path: path.join(outDir, "c35-gruppenchat-vorschlaege.jpg"), type: "jpeg", quality: 86, animations: "disabled", clip });
    console.log("  ✓", "c35-gruppenchat-vorschlaege");
    await input.fill("");
  });

  await step("Gruppenchat: Mitglieder", async () => {
    await membersButton(page).click();
    await page.getByRole("dialog", { name: "Mitglieder" }).waitFor();
    await page.waitForTimeout(400);
    await shot(page, "c36-gruppenchat-mitglieder");
    await page.keyboard.press("Escape");
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
    await p.getByRole("group", { name: "Ansicht wechseln" }).getByRole("button", { name: /^Posteingang/ }).click();
    await p.getByRole("heading", { name: "Posteingang", level: 1 }).waitFor();
    await p.waitForTimeout(600);
    await shot(p, "c26-mobil-posteingang");
    await patchGroupAnswers(mobile, groupAnswer(groupNames));
    await p.getByRole("button", { name: "Menü öffnen" }).click();
    await p.getByRole("group", { name: "Ansicht wechseln" }).getByRole("button", { name: /^Chat/ }).click();
    await p.getByRole("button", { name: "Menü öffnen" }).click();
    await p.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: new RegExp(`^${GROUP_TITLE}`) }).click();
    await p.getByText("Protokoll der Teamrunde Bürgerservice").waitFor();
    await p.waitForTimeout(800);
    await shot(p, "c37-mobil-gruppenchat");
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
    // Ein einzelnes Kärtchen für das Handbuch der Teilnehmenden.
    await shot(p.getByRole("list", { name: "Zugangskärtchen" }).getByRole("listitem").first(), "c32-kaertchen");
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

  // ---------------------------------------------------------------- Fundus pflegen

  const sub = async (name) => {
    await adminPage.getByRole("tablist", { name: "Fundus-Bereiche" }).getByRole("tab", { name: new RegExp(`^${name}`) }).click();
    await adminPage.waitForTimeout(400);
  };
  await step("Fundus: Dokumente", async () => {
    await tab("Fundus");
    await adminPage.getByRole("list", { name: "Dokumente im Fundus" }).waitFor();
    await adminPage.setViewportSize({ width: 1280, height: 1000 });
    await adminPage.mouse.move(0, 0);
    await adminPage.waitForTimeout(400);
    await shot(adminPage, "a16-fundus-dokumente");
  });

  await step("Fundus: Prüfen", async () => {
    await adminPage.getByRole("button", { name: "Dateien hochladen" }).click();
    const dialog = adminPage.getByRole("dialog", { name: "Dokumente hochladen" });
    await dialog.getByLabel("Dateien für den Fundus auswählen").setInputFiles(
      ["bericht.pdf", OWN_DOC.name, "umsatz.csv"].map((name) => ({ name, mimeType: "application/octet-stream", buffer: readFileSync(path.join(filesDir, name)) })),
    );
    await dialog.getByText(/(wird|werden) hochgeladen und geprüft/).waitFor({ state: "hidden", timeout: 30_000 });
    await dialog.locator('li[data-datei="bericht.pdf"]').getByLabel("Titel für „bericht.pdf“").fill("Quartalsbericht Bürgerservice");
    await dialog.getByLabel("Stichwörter").fill("Quartal, Wartezeiten");
    await dialog.getByRole("checkbox", { name: "Mit Zahlen" }).check();
    await dialog.getByRole("checkbox", { name: /keine echten personenbezogenen/ }).check();
    await adminPage.setViewportSize({ width: 1280, height: 1400 });
    // Nach dem Häkchen ist der Inhalt nach unten gescrollt – fürs Bild wieder von oben.
    await dialog.locator(".overflow-y-auto").first().evaluate((el) => (el.scrollTop = 0));
    await adminPage.waitForTimeout(400);
    await shot(dialog, "a17-fundus-pruefen");
    await dialog.getByRole("button", { name: "Abbrechen" }).click();
    await adminPage.setViewportSize({ width: 1280, height: 800 });
    await dialog.waitFor({ state: "hidden" });
  });

  await step("Fundus: Verlauf", async () => {
    await sub("E-Mail-Verläufe");
    await adminPage.getByRole("button", { name: "Verlauf hochladen" }).click();
    const dialog = adminPage.getByRole("dialog", { name: "E-Mail-Verlauf hochladen" });
    try {
      await dialog.getByLabel("E-Mails für den Verlauf auswählen").setInputFiles(
        ownThreadMails().map((m) => ({ name: m.name, mimeType: "message/rfc822", buffer: readFileSync(path.join(filesDir, m.name)) })),
      );
      await dialog.locator("li[data-mail]").nth(2).waitFor({ timeout: 30_000 });
      await dialog.getByRole("checkbox", { name: /keine echten personenbezogenen/ }).check();
      await adminPage.setViewportSize({ width: 1280, height: 1500 });
      await adminPage.waitForTimeout(400);
      await shot(dialog, "a18-fundus-verlauf");
    } finally {
      await dialog.getByRole("button", { name: "Abbrechen" }).click();
      await adminPage.setViewportSize({ width: 1280, height: 800 });
    }
  });

  await step("Prompt-Dialog", async () => {
    await sub("Prompts");
    await adminPage.setViewportSize({ width: 1280, height: 1700 });
    await adminPage.getByRole("button", { name: "„E-Mail-Verlauf zusammenfassen“ bearbeiten" }).click();
    const dialog = adminPage.getByRole("dialog", { name: "Prompt bearbeiten" });
    await dialog.waitFor();
    await adminPage.waitForTimeout(400);
    await shot(dialog, "a19-prompt-dialog");
    await adminPage.keyboard.press("Escape");
    await adminPage.setViewportSize({ width: 1280, height: 800 });
  });

  await step("Kategorien", async () => {
    await sub("Kategorien");
    await fullShot(adminPage, "a20-kategorien");
  });

  await step("Sicherheit", async () => {
    await tab("Sicherheit");
    await fullShot(adminPage, "a15-sicherheit");
  });
  await actx.close();

  if (failures.length) throw new Error(`${failures.length} Screenshot(s) fehlgeschlagen:\n- ${failures.join("\n- ")}`);
}
