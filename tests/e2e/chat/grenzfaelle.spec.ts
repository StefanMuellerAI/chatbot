import { readFileSync } from "node:fs";
import type { APIRequestContext, Page } from "@playwright/test";
import { createGuest, expect, inMinutes, test, uniq } from "../support/fixtures";
import { attachments, chip, expectReady } from "../support/files";
import { MailPage } from "../support/mail";
import { ADMIN } from "../support/servers.mjs";

// Grenzfälle und Fehlbedienung durch Teilnehmende (Plan: GRENZFAELLE-PLAN.md): Copy & Paste, Doppelklicks,
// Dateien aus dem echten Leben und der Schulungsraum hinter einer IP.

const login = (api: APIRequestContext, username: string, password: string) => api.post("/api/auth/login", { data: { username, password } });

/** Fügt Text so ein, wie ihn der Browser aus der Zwischenablage liefert (Firefox übernimmt clipboardData nicht aus dem Konstruktor). */
async function pasteText(page: Page, label: string, text: string) {
  await page.getByLabel(label).evaluate((el, value) => {
    const dt = new DataTransfer();
    dt.setData("text/plain", value);
    const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: dt });
    el.dispatchEvent(event);
  }, text);
}

test.describe("A · Zugangsdaten aus der Zwischenablage", () => {
  test("A13 Gast-Passwort mit kopierten Leerzeichen, Großbuchstaben oder unsichtbaren Zeichen öffnet den Chat; das Admin-Passwort bleibt exakt", async ({ page, baseURL }) => {
    const guest = await createGuest(baseURL!);
    const p = guest.password;
    const variants: [string, string][] = [
      [guest.username, `${p} `],
      [guest.username, ` ${p}`],
      [guest.username, `${p}\t`],
      [guest.username, `${p} `],
      [guest.username, p[0].toUpperCase() + p.slice(1)],
      [guest.username, p.toUpperCase()],
      [`​${guest.username}`, p],
      [`${guest.username.toUpperCase()} `, `﻿${p}`],
    ];
    for (const [username, password] of variants) {
      expect((await login(page.request, username, password)).status(), JSON.stringify([username, password])).toBe(200);
    }
    // Nach elf solchen Anmeldungen ist der Name nicht gesperrt – keine davon war ein Fehlversuch.
    for (let i = 0; i < 3; i++) expect((await login(page.request, guest.username, `${p} `)).status()).toBe(200);
    expect((await login(page.request, guest.username, `${p}x`)).status()).toBe(401);

    // Die Kursleitung muss ihr Passwort exakt eingeben.
    expect((await login(page.request, ADMIN.username, `${ADMIN.password} `)).status()).toBe(401);
    expect((await login(page.request, ADMIN.username, ADMIN.password.toUpperCase())).status()).toBe(401);
    expect((await login(page.request, ` ${ADMIN.username.toUpperCase()}`, ADMIN.password)).status()).toBe(200);

    // Im Formular: Passwort vom iPad mit großem Anfangsbuchstaben und Leerzeichen am Ende.
    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("Benutzername").fill(guest.username);
    await page.getByLabel("Passwort").fill(`${p[0].toUpperCase()}${p.slice(1)} `);
    await page.getByLabel("Passwort").press("Enter");
    await expect(page).toHaveURL(/\/$/);
  });

  test("A14 Benutzername und Passwort zusammen eingefügt werden auf beide Felder verteilt", async ({ page, baseURL }) => {
    const guest = await createGuest(baseURL!);
    await page.goto("/login");
    const username = page.getByLabel("Benutzername");
    const password = page.getByLabel("Passwort");
    for (const text of [`${guest.username} ${guest.password}`, `${guest.username};${guest.password};E2E;bis 17:00`, `Benutzername: ${guest.username}\nPasswort: ${guest.password}`]) {
      await username.fill("");
      await password.fill("");
      await pasteText(page, "Benutzername", text);
      await expect(username).toHaveValue(guest.username);
      await expect(password).toHaveValue(guest.password);
    }
    // Ins leere Passwortfeld eingefügt: ebenso.
    await username.fill("");
    await password.fill("");
    await pasteText(page, "Passwort", `${guest.username}\t${guest.password}`);
    await expect(username).toHaveValue(guest.username);
    await expect(password).toHaveValue(guest.password);
    // Steht der Name schon da, wird ein eingefügtes Passwort nie zerlegt.
    await password.fill("");
    await pasteText(page, "Passwort", "ganz eigenes22 passwort33");
    await expect(username).toHaveValue(guest.username);
    await expect(password).toHaveValue("");
    // Ein einzelner Name bleibt ein normales Einfügen.
    await username.fill("");
    await pasteText(page, "Benutzername", guest.username);
    await expect(password).toHaveValue("");

    await username.fill("");
    await pasteText(page, "Benutzername", `${guest.username} ${guest.password}`);
    await password.press("Enter");
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("T · Schulungsraum und Login-Bremse", () => {
  test("T19 Frühstarter hinter einer IP: Versuche vor der Freigabe sperren niemanden aus", async ({ page, admin }) => {
    const name = `Frühstart ${uniq()}`;
    const id = await admin.createEvent(name, 120, 360);
    const { guests } = await admin.createGroup(id, "Raum", 25);
    // Jede Person versucht es dreimal, eine sogar elfmal – alle mit den richtigen Daten, aber zu früh.
    const early = await Promise.all(
      guests.map(async (g, i) => {
        const statuses: number[] = [];
        for (let n = 0; n < (i === 0 ? 11 : 3); n++) statuses.push((await login(page.request, g.username, g.password)).status());
        return statuses;
      }),
    );
    expect(early.flat().every((s) => s === 403), JSON.stringify(early)).toBe(true);
    const res = await login(page.request, guests[0].username, guests[0].password);
    expect(await res.json()).toEqual({ error: expect.stringMatching(/^Dein Termin beginnt am .* Die Anmeldung ist ab 30 Minuten vorher möglich\.$/) });

    // Die Kursleitung zieht den Beginn vor: jetzt kommen alle hinein.
    await admin.json("PUT", "/api/admin/events", { id, name, startsAt: inMinutes(20), endsAt: inMinutes(360) });
    const statuses = await Promise.all(guests.map(async (g) => (await login(page.request, g.username, g.password)).status()));
    expect(statuses).toEqual(Array(25).fill(200));
  });

  test("T20 nach Tippfehlern gesperrt: ein neues Passwort der Kursleitung gilt sofort", async ({ page, admin, baseURL }) => {
    const guest = await createGuest(baseURL!);
    for (let i = 0; i < 10; i++) expect((await login(page.request, guest.username, `falsch${i + 22}`)).status()).toBe(401);
    expect((await login(page.request, guest.username, guest.password)).status()).toBe(429);
    const { password } = await admin.json<{ password: string }>("POST", "/api/admin/events/guests/password", { id: guest.id });
    expect((await login(page.request, guest.username, guest.password)).status()).toBe(401);
    expect((await login(page.request, guest.username, password)).status()).toBe(200);
  });

  test("T21 Gruppe mit Copy-&-Paste-Fehlern und Tippfehlern hinter einer IP: keine Raumsperre", async ({ page, admin }) => {
    const id = await admin.createEvent(`Raum ${uniq()}`, -5, 240);
    const { guests } = await admin.createGroup(id, "Raum", 25);
    const messy = (p: string, i: number) => [`${p} `, ` ${p}`, `${p}\t`, `${p} `, p[0].toUpperCase() + p.slice(1)][i % 5];
    const results = await Promise.all(
      guests.map(async (g, i) => [
        // ein echter Tippfehler (vertauschte Ziffern) …
        (await login(page.request, g.username, `${g.password.replace(/\d+$/, "")}99`)).status(),
        // … und zweimal mit kopierten Resten
        (await login(page.request, g.username, messy(g.password, i))).status(),
        (await login(page.request, g.username, messy(g.password, i + 1))).status(),
      ]),
    );
    for (const r of results) expect(r).toEqual([401, 200, 200]);
    // Die IP ist danach nicht gesperrt.
    expect((await login(page.request, guests[0].username, guests[0].password)).status()).toBe(200);
  });
});

// ---------------------------------------------------------------- Einfügen

/** Zwischenablage, wie sie Programme füllen: Office legt zum Text ein Bild der Auswahl dazu. */
const CLIPBOARD = {
  word: { "text/plain": "Sehr geehrte Damen und Herren,\nanbei der Bericht.", "text/html": "<p class=MsoNormal>Sehr geehrte Damen und Herren,</p>", "text/rtf": "{\\rtf1 Sehr geehrte}", image: true },
  excel: { "text/plain": "Monat\tUmsatz\nJanuar\t1.234,56", "text/html": "<table><tr><td>Monat</td><td>Umsatz</td></tr></table>", image: true },
  powerpoint: { "text/plain": "Folie 1: Ziele 2026", "text/html": "<div>Folie 1: Ziele 2026</div>", image: true },
  screenshot: { image: true },
  webImage: { "text/html": '<img src="https://example.com/bild.png">', image: true },
  finderFile: { "text/plain": "bericht.png", image: true },
} as const;

/** Löst ein Einfügen mit dieser Zwischenablage aus; liefert, ob Freebie das Einfügen des Browsers verhindert hat. */
async function paste(page: Page, kind: keyof typeof CLIPBOARD) {
  return page.getByRole("textbox", { name: "Nachricht" }).evaluate((el, content) => {
    const dt = new DataTransfer();
    for (const [type, value] of Object.entries(content)) if (type !== "image") dt.setData(type, value as string);
    if (content.image) dt.items.add(new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "image.png", { type: "image/png" }));
    const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: dt });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  }, CLIPBOARD[kind] as Record<string, string | boolean>);
}

test.describe("C · Einfügen, Doppelklicks", () => {
  test("C16 Einfügen aus Word, Excel und PowerPoint: der Text gilt, das mitkopierte Bild nicht", async ({ chat, page }) => {
    for (const kind of ["word", "excel", "powerpoint"] as const) {
      expect(await paste(page, kind), kind).toBe(false);
    }
    await page.waitForTimeout(500);
    await expect(attachments(page)).toHaveCount(0);
    void chat;
  });

  test("C16 echte Zwischenablage mit Text, HTML und Bild landet als Text im Eingabefeld @nur-chromium", async ({ chat, page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(() => {
      document.addEventListener("paste", (e) => ((window as unknown as { __files: number }).__files = e.clipboardData?.files.length ?? 0), true);
    });
    await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 8;
      const png = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob(["Monat\tUmsatz\nJanuar\t1.234,56"], { type: "text/plain" }),
          "text/html": new Blob(["<table><tr><td>Monat</td><td>Umsatz</td></tr></table>"], { type: "text/html" }),
          "image/png": png,
        }),
      ]);
    });
    await chat.composer.focus();
    await page.keyboard.press("ControlOrMeta+V");
    await expect(chat.composer).toHaveValue("Monat\tUmsatz\nJanuar\t1.234,56");
    // Der Browser hat das Bild tatsächlich mitgeliefert – trotzdem kein Anhang.
    expect(await page.evaluate(() => (window as unknown as { __files: number }).__files)).toBeGreaterThan(0);
    await expect(attachments(page)).toHaveCount(0);
  });

  test("C17 Screenshot, Bild von einer Webseite und kopierte Datei werden angehängt", async ({ chat, page }) => {
    for (const kind of ["screenshot", "webImage", "finderFile"] as const) {
      expect(await paste(page, kind), kind).toBe(true);
    }
    await expect(attachments(page).getByRole("group", { name: "image.png", exact: true })).toHaveCount(3);
    void chat;
  });

  test("C21 Doppelklick und Doppel-Enter auf „Senden“: genau eine Frage, ein Chat, eine Anfrage", async ({ chat, page }) => {
    let requests = 0;
    page.on("request", (r) => {
      if (r.url().endsWith("/api/chat")) requests++;
    });
    const nav = page.getByRole("navigation", { name: "Chatverlauf" });
    const id = uniq();

    // Neuer Chat, Doppelklick wie ein Mensch
    await chat.composer.fill(`Doppelt ${id}`);
    await chat.sendButton.dblclick();
    await chat.waitForAnswer(1);
    await page.waitForTimeout(500);
    await expect(nav.getByRole("button", { name: new RegExp(`^Doppelt ${id}`) })).toHaveCount(1);
    await expect(chat.questions).toHaveCount(1);
    expect(requests).toBe(1);

    // Laufender Chat, zwei Klicks im selben Augenblick
    await chat.composer.fill(`Noch einmal ${id}`);
    await chat.sendButton.evaluate((b: HTMLButtonElement) => {
      b.click();
      b.click();
    });
    await chat.waitForAnswer(2);
    await page.waitForTimeout(500);
    await expect(chat.questions).toHaveCount(2);
    await expect(chat.answers).toHaveCount(2);
    expect(requests).toBe(2);

    // Zweimal Enter im selben Augenblick
    await chat.composer.fill(`Enter ${id}`);
    await chat.composer.evaluate((el) => {
      for (let i = 0; i < 2; i++) el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    });
    await chat.waitForAnswer(3);
    await page.waitForTimeout(500);
    await expect(chat.questions).toHaveCount(3);
    expect(requests).toBe(3);

    // Langsamer Doppelklick: der zweite Klick trifft schon „Stoppen“ an derselben Stelle – die Antwort läuft weiter.
    await chat.composer.fill(`#langsam Langsam doppelt ${id}`);
    const box = (await chat.sendButton.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(chat.stopButton).toBeVisible();
    // Nur der zweite Klick (Klickzahl 2) – so, wie ihn der Browser bei einem Doppelklick meldet.
    await page.mouse.down({ clickCount: 2 });
    await page.mouse.up({ clickCount: 2 });
    await chat.waitForAnswer(4);
    await expect(chat.lastAnswer.getByText("(Abgebrochen)")).toHaveCount(0);
    await expect(chat.lastAnswer.getByRole("alert")).toHaveCount(0);
    expect(requests).toBe(4);
  });

  test("C22 Doppelklick auf „Neu generieren“: genau eine neue Antwort", async ({ chat, page }) => {
    await chat.ask(`Neu generieren doppelt ${uniq()}`);
    let requests = 0;
    page.on("request", (r) => {
      if (r.url().endsWith("/api/chat")) requests++;
    });
    await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).dblclick();
    await chat.waitForAnswer(1);
    await page.waitForTimeout(500);
    await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).evaluate((b: HTMLButtonElement) => {
      b.click();
      b.click();
    });
    await chat.waitForAnswer(1);
    await page.waitForTimeout(500);
    await expect(chat.answers).toHaveCount(1);
    await expect(chat.questions).toHaveCount(1);
    expect(requests).toBe(2);
  });
});

// ---------------------------------------------------------------- Dateien

const ANSI = (text: string) => Buffer.from(Array.from(text, (c) => (c === "€" ? 0x80 : c.charCodeAt(0))));

test.describe("F · Dateien aus dem echten Leben", () => {
  test("F13 Dateinamen ohne lateinische Buchstaben, mit großer Endung oder sehr lang werden verarbeitet", async ({ chat, page }) => {
    const id = uniq();
    const names = ["Отчет.txt", "📊.csv", "報告.md", "تقرير.TXT", `${"Sehr langer Dateiname ".repeat(8)}Ende.txt`];
    await page.getByLabel("Dateien zum Anhängen").setInputFiles(
      names.map((name, i) => ({ name, mimeType: "text/plain", buffer: Buffer.from(`Spalte\nInhalt-${i}-${id}`) })),
    );
    for (const name of names) await expectReady(page, name, /ca\. \d+ Tokens/);
    const answer = await chat.ask(`#zeige-dateien ${id}`);
    for (let i = 0; i < names.length; i++) await expect(answer.locator("pre")).toContainText(`Inhalt-${i}-${id}`);
    for (const name of names) await expect(chat.questions.last().getByRole("group", { name, exact: true })).toBeVisible();
  });

  test("F14 CSV aus deutschem Excel, UTF-16- und UTF-8-Text mit BOM kommen mit Umlauten beim Modell an", async ({ chat, page }) => {
    const id = uniq();
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([
      { name: "excel-export.csv", mimeType: "text/csv", buffer: ANSI(`Name;Ort;Betrag;Datum\nMüller ${id};Köln;1.234,56 €;14.10.2026\n`) },
      { name: "unicode-text.txt", mimeType: "text/plain", buffer: Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(`Straße\tDüsseldorf ${id}\n`, "utf16le")]) },
      { name: "notiz.md", mimeType: "text/markdown", buffer: Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(`# Größe ${id}\r\nÜbergabe im März`, "utf8")]) },
    ]);
    for (const name of ["excel-export.csv", "unicode-text.txt", "notiz.md"]) await expectReady(page, name, /ca\. \d+ Tokens/);
    const pre = (await chat.ask(`#zeige-dateien ${id}`)).locator("pre");
    for (const text of [`Müller ${id},Köln,"1.234,56 €",14.10.2026`, `Straße\tDüsseldorf ${id}`, `# Größe ${id}`, "Übergabe im März"]) await expect(pre).toContainText(text);
    expect(await pre.innerText()).not.toContain("�");
  });

  test("F15 Nullbytes und Steuerzeichen: Text wird ausgelesen, nie ein interner Fehler", async ({ chat, page }) => {
    const id = uniq();
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([
      { name: "dienst.log", mimeType: "text/plain", buffer: Buffer.from(`Start\u0000\u0000 Dienst ${id}\u0007 läuft\r\nEnde\u001b[0m`, "utf8") },
      { name: "nur-nullen.txt", mimeType: "text/plain", buffer: Buffer.alloc(64) },
    ]);
    await expectReady(page, "dienst.log", /ca\. \d+ Tokens/);
    await expect(chip(page, "nur-nullen.txt")).toContainText("In der Datei wurde kein lesbarer Text gefunden", { timeout: 30_000 });
    const pre = (await chat.ask(`#zeige-dateien ${id}`)).locator("pre");
    await expect(pre).toContainText(`Start Dienst ${id} läuft`);
    expect(await pre.innerText()).not.toMatch(/[\u0000\u0007\u001b]/);
  });
});

// ---------------------------------------------------------------- Spracheingabe

test.describe("H · Spracheingabe @nur-chromium", () => {
  test("H05 Doppelklick aufs Mikrofon: eine Aufnahme, nach „Stopp“ ist das Mikrofon aus", async ({ chat, page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __streams: MediaStream[] };
      w.__streams = [];
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        const stream = await original(constraints);
        w.__streams.push(stream);
        return stream;
      };
    });
    await page.reload();
    await page.getByRole("button", { name: "Spracheingabe" }).dblclick();
    const stop = page.getByRole("button", { name: "Aufnahme beenden" });
    await expect(stop).toContainText(/0:0[2-9]/, { timeout: 10_000 });
    await stop.click();
    await expect(chat.composer).toHaveValue(/Transkript/, { timeout: 20_000 });
    const streams = () => page.evaluate(() => (window as unknown as { __streams: MediaStream[] }).__streams.map((s) => s.active));
    expect(await streams()).toEqual([false]);
    // Auch später fügt keine vergessene Aufnahme noch Text ein.
    const value = await chat.composer.inputValue();
    await page.waitForTimeout(1500);
    await expect(chat.composer).toHaveValue(value);
    await expect(page.getByRole("button", { name: "Spracheingabe" })).toBeEnabled();
  });
});

// ---------------------------------------------------------------- Phase 2: Eingabe, Entwurf, Reihenfolgen

const nav = (page: Page) => page.getByRole("navigation", { name: "Chatverlauf" });
const editBanner = (page: Page) => page.getByText("Du bearbeitest eine frühere Nachricht.");

/** Hält Uploads an, bis der Test sie freigibt (zeigt laufende Uploads in Bedienfolgen). */
async function holdUploads(page: Page) {
  let release: () => void = () => {};
  const released = new Promise<void>((r) => (release = r));
  await page.route("/api/upload/local", async (route) => {
    await released;
    await route.continue().catch(() => {});
  });
  return release;
}

async function editFirstQuestion(page: Page, chat: { questions: ReturnType<Page["getByRole"]> }) {
  await chat.questions.first().hover();
  await chat.questions.first().getByRole("button", { name: "Bearbeiten" }).click();
  await expect(editBanner(page)).toBeVisible();
}

test.describe("C · Eingabe auf dem iPad, Entwurf und Reihenfolgen", () => {
  test("C19 Gerät ohne Maus (iPad, Handy): Enter macht eine neue Zeile, gesendet wird mit dem Knopf oder Strg/Cmd+Enter @tablet @mobil", async ({ chat }) => {
    const id = uniq();
    await chat.composer.fill(`Zeile eins ${id}`);
    await chat.composer.press("Enter");
    await chat.composer.pressSequentially("Zeile zwei");
    await expect(chat.composer).toHaveValue(`Zeile eins ${id}\nZeile zwei`);
    await expect(chat.questions).toHaveCount(0);
    await expect(chat.sendButton).toHaveAttribute("title", "Senden");
    await chat.sendButton.click();
    await chat.waitForAnswer(1);
    await expect(chat.questions.last()).toHaveText(new RegExp(`Zeile eins ${id}\\s+Zeile zwei`));
    // Mit angeschlossener Tastatur: Strg/Cmd+Enter sendet.
    await chat.composer.fill(`Tastatur ${id}`);
    await chat.composer.press("ControlOrMeta+Enter");
    await chat.waitForAnswer(2);
    await expect(chat.questions).toHaveCount(2);
  });

  test("C20 markierter Text lässt sich ins Eingabefeld ziehen", async ({ chat, page }) => {
    const prevented = await chat.composer.evaluate((el) => {
      const dt = new DataTransfer();
      dt.setData("text/plain", "Gezogener Text");
      const over = new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt });
      el.dispatchEvent(over);
      const drop = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt });
      el.dispatchEvent(drop);
      return { dragover: over.defaultPrevented, drop: drop.defaultPrevented };
    });
    // Freebie lässt das Einfügen dem Browser – nichts wird abgefangen oder angehängt.
    expect(prevented).toEqual({ dragover: false, drop: false });
    await expect(attachments(page)).toHaveCount(0);
  });

  test("C24 Entwurf mit laufendem Upload → „Bearbeiten“ → „Abbrechen“ bzw. Senden: Entwurf und Anhang sind wieder da", async ({ chat, page }) => {
    const id = uniq();
    await chat.ask(`Erste ${id}`);
    const release = await holdUploads(page);
    await chat.composer.fill(`Mein Entwurf ${id}`);
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([{ name: "unterwegs.txt", mimeType: "text/plain", buffer: Buffer.from(`Unterwegs ${id}`) }]);
    await expect(chip(page, "unterwegs.txt")).toContainText("%");

    await editFirstQuestion(page, chat);
    await expect(chat.composer).toHaveValue(`Erste ${id}`);
    await expect(chip(page, "unterwegs.txt")).toHaveCount(0);
    await page.getByRole("button", { name: "Abbrechen" }).click();
    await expect(editBanner(page)).toBeHidden();
    await expect(chat.composer).toHaveValue(`Mein Entwurf ${id}`);
    await expect(chip(page, "unterwegs.txt")).toBeVisible();
    // Der Upload lief weiter und wird fertig.
    release();
    await expectReady(page, "unterwegs.txt", /ca\. \d+ Tokens/);

    // Bearbeitete Nachricht senden: danach steht der eigene Entwurf wieder da.
    await editFirstQuestion(page, chat);
    await chat.composer.fill(`Erste geändert ${id}`);
    await chat.sendButton.click();
    await chat.waitForAnswer(1);
    await expect(chat.questions).toHaveText([new RegExp(`Erste geändert ${id}`)]);
    await expect(chat.composer).toHaveValue(`Mein Entwurf ${id}`);
    await expectReady(page, "unterwegs.txt", /ca\. \d+ Tokens/);
  });

  test("C25 Beispiel und „Mit Freebie besprechen“ überschreiben keinen eigenen Entwurf", async ({ chat, page }) => {
    const draft = `Mein eigener Prompt ${uniq()}`;
    const example = "Baue mir eine kleine Landingpage für ein Café in Leipzig.";
    await chat.composer.fill(draft);
    await page.getByRole("button", { name: example }).click();
    await expect(chat.composer).toHaveValue(draft);
    const toast = page.getByRole("status").filter({ hasText: "Im Eingabefeld steht schon dein Entwurf – er bleibt stehen." });
    await expect(toast).toBeVisible();
    await toast.getByRole("button", { name: "Ersetzen" }).click();
    await expect(chat.composer).toHaveValue(example);

    // „Mit Freebie besprechen“ im Posteingang: neuer Chat mit Verbindung, der Entwurf bleibt.
    await chat.composer.fill(draft);
    const mail = MailPage.of(chat);
    await mail.open();
    await mail.row(/Willkommen in deinem Posteingang/).click();
    await mail.reader.getByRole("toolbar", { name: "Aktionen für diese E-Mail" }).getByRole("button", { name: "Mit Freebie besprechen" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(chat.composer).toHaveValue(draft);
    await page.getByRole("status").filter({ hasText: "er bleibt stehen" }).getByRole("button", { name: "Ersetzen" }).click();
    await expect(chat.composer).toHaveValue(/^Fasse die E-Mail „Willkommen in deinem Posteingang“/);
  });

  test("C26 Bearbeiten → anderer Chat, „Neuer Chat“ oder Chat löschen: der eigene Entwurf kommt zurück, nie der alte Text", async ({ chat, page }) => {
    const id = uniq();
    await chat.ask(`Chat A ${id}`);
    await chat.newChat();
    await chat.ask(`Chat B ${id}`);
    await chat.composer.fill(`Entwurf ${id}`);

    await editFirstQuestion(page, chat);
    await nav(page).getByRole("button", { name: `Chat A ${id}`, exact: true }).click();
    await expect(editBanner(page)).toBeHidden();
    await expect(chat.composer).toHaveValue(`Entwurf ${id}`);
    await expect(chat.questions).toHaveText([new RegExp(`Chat A ${id}`)]);

    await editFirstQuestion(page, chat);
    await chat.newChat();
    await expect(editBanner(page)).toBeHidden();
    await expect(chat.composer).toHaveValue(`Entwurf ${id}`);

    await nav(page).getByRole("button", { name: `Chat B ${id}`, exact: true }).click();
    await editFirstQuestion(page, chat);
    page.once("dialog", (d) => void d.accept());
    await nav(page).getByRole("button", { name: `Chat „Chat B ${id}“ löschen` }).click();
    await expect(editBanner(page)).toBeHidden();
    await expect(chat.composer).toHaveValue(`Entwurf ${id}`);
  });

  test("C30 Fehlerseiten der Plattform ohne JSON: deutsche Meldung statt „Fehler 413“", async ({ chat, page }) => {
    const html = "<html><body>An error occurred</body></html>";
    for (const [status, message] of [
      [413, "Die Anfrage ist zu groß. Bitte einen neuen Chat starten oder kleinere Dateien verwenden."],
      [504, "Freebie hat zu lange gebraucht (Zeitüberschreitung). Bitte gleich nochmal versuchen."],
      [502, "Freebie antwortet gerade nicht. Bitte gleich nochmal versuchen."],
    ] as const) {
      await page.route("/api/chat", (r) => r.fulfill({ status, contentType: "text/html", body: html }));
      await chat.ask(`Fehlerseite ${status} ${uniq()}`);
      await expect(chat.lastAnswer.getByRole("alert")).toHaveText(message);
      await page.unroute("/api/chat");
    }
    await page.route("/api/upload/local", (r) => r.fulfill({ status: 413, contentType: "text/plain", body: "Request Entity Too Large" }));
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([{ name: "gross.txt", mimeType: "text/plain", buffer: Buffer.from("x") }]);
    await expect(chip(page, "gross.txt")).toContainText("Upload fehlgeschlagen: Die Anfrage ist zu groß.");
    await page.route("/api/images", (r) => r.fulfill({ status: 504, contentType: "text/html", body: html }));
    await page.getByRole("button", { name: "Bild-Modus" }).click();
    const dialog = page.getByRole("dialog", { name: "Bild-Modus" });
    await dialog.getByLabel("Bildbeschreibung").fill("Ein Leuchtturm");
    await dialog.getByRole("button", { name: "Bild erzeugen" }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Freebie hat zu lange gebraucht (Zeitüberschreitung). Bitte gleich nochmal versuchen.");
  });
});

test.describe("H · Spracheingabe beim Tippen @nur-chromium", () => {
  test("H06 während des Diktats getippter Text bleibt, das Transkript wird angehängt", async ({ chat, page }) => {
    await chat.composer.fill("Alt");
    await page.getByRole("button", { name: "Spracheingabe" }).click();
    const stop = page.getByRole("button", { name: "Aufnahme beenden" });
    await expect(stop).toContainText(/0:0[2-9]/, { timeout: 10_000 });
    await chat.composer.fill("Neu getippt");
    await stop.click();
    await expect(chat.composer).toHaveValue(/^Neu getippt \[Testmodus\] Transkript von diktat\./, { timeout: 20_000 });
  });
});

test.describe("F · Dateien neben die Ablagefläche", () => {
  test("F17 Datei auf die Seitenleiste fallen gelassen: Freebie bleibt offen und hängt sie an", async ({ chat, page }) => {
    const prevented = await page.evaluate(() => {
      const transfer = () => {
        const dt = new DataTransfer();
        dt.items.add(new File(["Daneben abgelegt"], "daneben.txt", { type: "text/plain" }));
        return dt;
      };
      const aside = document.querySelector("aside")!;
      const over = new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer() });
      aside.dispatchEvent(over);
      const drop = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer() });
      aside.dispatchEvent(drop);
      return { dragover: over.defaultPrevented, drop: drop.defaultPrevented };
    });
    // Ohne preventDefault würde der Browser die Datei anstelle von Freebie öffnen.
    expect(prevented).toEqual({ dragover: true, drop: true });
    await expectReady(page, "daneben.txt", /ca\. \d+ Tokens/);
    void chat;
  });
});

test.describe("E · Import, Speicher und Tabs", () => {
  test("E11 Import mit kaputten Feldern: Ungültiges fällt weg, der Chat bleibt nutzbar", async ({ chat, page }) => {
    const id = uniq();
    const json = JSON.stringify({
      conversations: [
        {
          id: `kaputt-${id}`,
          title: `Kaputt ${id}`,
          messages: [
            { role: "user", text: "Frage", attachments: [null, { name: 5 }, { name: "ohne-pruefsumme.txt", kind: "document", storageKey: "uploads/x/y.txt" }], effort: "extrem", webSearch: "ja" },
            { role: "assistant", text: "Antwort", citations: "x", images: "y", native: "z", usage: 5, thinking: 7, fromCache: "nein" },
          ],
        },
      ],
    });
    page.once("dialog", (d) => void d.accept());
    await page.getByLabel("Export-Datei für den Import").setInputFiles({ name: "kaputt.json", mimeType: "application/json", buffer: Buffer.from(json) });
    await nav(page).getByRole("button", { name: `Kaputt ${id}`, exact: true }).click();
    await expect(chat.questions).toHaveText([/Frage/]);
    await expect(chat.answers).toHaveCount(1);
    // Der Server nimmt den bereinigten Verlauf an.
    const answer = await chat.ask(`Weiter im importierten Chat ${id}`);
    await expect(answer).toContainText("Testmodus");
    await expect(answer.getByRole("alert")).toHaveCount(0);
  });

  test("E11 ein Chat, der sich nicht anzeigen lässt, zeigt einen Hinweis statt einer weißen Seite", async ({ chat, page }) => {
    const id = uniq();
    // Unter Umgehung des Imports direkt in die Browser-Datenbank geschrieben (wie aus einer älteren Version).
    await page.evaluate(
      ({ db, id }) =>
        new Promise<void>((resolve, reject) => {
          const open = indexedDB.open(db);
          open.onerror = () => reject(open.error);
          open.onsuccess = () => {
            const tx = open.result.transaction("conversations", "readwrite");
            const now = Date.now();
            tx.objectStore("conversations").put({
              id: `defekt-${id}`,
              title: `Defekt ${id}`,
              modelId: "claude-sonnet-5-5",
              presetId: null,
              createdAt: now,
              updatedAt: now,
              messages: [
                { id: "u", role: "user", text: "Frage", createdAt: now },
                { id: "a", role: "assistant", text: "Antwort", createdAt: now, citations: "kaputt" },
              ],
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          };
        }),
      { db: `freebie-g-${chat.guest!.id}`, id },
    );
    await page.reload();
    await nav(page).getByRole("button", { name: `Defekt ${id}`, exact: true }).click();
    const alert = page.getByRole("alert").filter({ hasText: "Dieser Chat kann nicht angezeigt werden" });
    await expect(alert).toBeVisible();
    await expect(chat.composer).toBeVisible();
    page.once("dialog", (d) => void d.accept());
    await alert.getByRole("button", { name: "Chat löschen" }).click();
    await expect(nav(page).getByRole("button", { name: `Defekt ${id}`, exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Hallo, ich bin Freebie." })).toBeVisible();
  });

  test("E12 älteren Export erneut importieren: Chats mit gleicher ID werden überschrieben (so gewollt)", async ({ chat, page }, testInfo) => {
    const id = uniq();
    await chat.ask(`Stand eins ${id}`);
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Alle Chats exportieren" }).click();
    const path = testInfo.outputPath("alt.json");
    await (await download).saveAs(path);
    await chat.ask(`Stand zwei ${id}`);
    await expect(chat.questions).toHaveCount(2);
    const message = new Promise<string>((resolve) =>
      page.once("dialog", (d) => {
        resolve(d.message());
        void d.accept();
      }),
    );
    await page.getByLabel("Export-Datei für den Import").setInputFiles({ name: "alt.json", mimeType: "application/json", buffer: readFileSync(path) });
    expect(await message).toBe("1 Chat importiert.");
    await expect(chat.questions).toHaveCount(1);
  });

  test("E15 zwei Tabs mit demselben Chat: während einer Antwort sendet der andere Tab nicht dazwischen", async ({ chat, page, context }) => {
    const id = uniq();
    await chat.ask(`Start ${id}`);
    const second = await context.newPage();
    await second.goto("/");
    await nav(second).getByRole("button", { name: new RegExp(`^Start ${id}`) }).click();
    const secondComposer = second.getByRole("textbox", { name: "Nachricht" });

    await chat.send(`#langsam Tab eins ${id}`);
    await expect(chat.stopButton).toBeVisible();
    await secondComposer.fill(`Tab zwei ${id}`);
    await second.getByRole("button", { name: "Senden", exact: true }).click();
    await expect(second.getByRole("status").filter({ hasText: "In einem anderen Tab läuft gerade eine Antwort in diesem Chat." })).toBeVisible();
    await expect(secondComposer).toHaveValue(`Tab zwei ${id}`);

    await chat.waitForAnswer(2);
    await second.getByRole("button", { name: "Senden", exact: true }).click();
    await chat.waitForAnswer(3);
    await page.reload();
    await nav(page).getByRole("button", { name: new RegExp(`^Start ${id}`) }).click();
    const order = await page.locator("article").evaluateAll((els) => els.map((e) => (e.getAttribute("aria-label") === "Deine Nachricht" ? "F" : "A")).join(""));
    expect(order).toBe("FAFAFA");
    await second.close();
  });

  test("E16 Browser-Speicher voll: klare Meldung, Text und Anhang bleiben im Eingabefeld", async ({ chat, page }) => {
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([{ name: "bleibt.txt", mimeType: "text/plain", buffer: Buffer.from(`Bleibt ${uniq()}`) }]);
    await expectReady(page, "bleibt.txt", /ca\. \d+ Tokens/);
    await page.evaluate(() => {
      IDBObjectStore.prototype.put = function () {
        throw new DOMException("Speicher voll", "QuotaExceededError");
      };
    });
    const text = `Speicher voll ${uniq()}`;
    await chat.composer.fill(text);
    await chat.sendButton.click();
    await expect(page.getByRole("status").filter({ hasText: "Die Nachricht wurde nicht gesendet. Der Speicher dieses Browsers ist voll" })).toBeVisible();
    await expect(chat.composer).toHaveValue(text);
    await expect(chip(page, "bleibt.txt")).toBeVisible();
    await expect(chat.questions).toHaveCount(0);
  });
});
