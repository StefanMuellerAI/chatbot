import type { Page } from "@playwright/test";
import { ChatPage, expect, noticeKey, openAdmin, openChat, test, uniq } from "../support/fixtures";
import { attach, chip, expectReady, payload } from "../support/files";

const settingSwitch = (page: Page, label: string) => page.getByRole("switch", { name: label, exact: true });
const saveButton = (page: Page) => page.getByRole("button", { name: "Einstellungen speichern" });

/** Schaltet im Admin einen Schalter um und speichert. */
async function toggleAndSave(page: Page, label: string, to: boolean) {
  const sw = settingSwitch(page, label);
  if ((await sw.getAttribute("aria-checked")) !== String(to)) await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", String(to));
  await saveButton(page).click();
  await expect(page.getByRole("status").filter({ hasText: "Gespeichert." })).toBeVisible();
}

async function fillAndSave(page: Page, label: string, value: string) {
  await page.getByLabel(label, { exact: true }).fill(value);
  await saveButton(page).click();
}

test.describe("Q · Admin: Einstellungen", () => {
  test("Q01 Not-Aus wirkt sofort auf Chat, Bilder, Audio und Uploads – der Admin bleibt bedienbar", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    const message = `Kurze Pause für die Mittagspause ${uniq()}`;
    await page.getByLabel("Meldung während der Pause").fill(message);
    await saveButton(page).click();
    await settingSwitch(page, "Freebie pausieren").click();
    await expect(page.getByRole("status").filter({ hasText: "Freebie ist pausiert." })).toBeVisible();

    const chat = await openChat(browser, baseURL!, ip);
    await expect(chat.page.getByText(message)).toBeVisible();
    await expect(chat.composer).toBeDisabled();
    await expect(chat.composer).toHaveAttribute("placeholder", "Freebie macht gerade Pause.");
    for (const name of ["Datei anhängen", "Spracheingabe", "Websuche", "Bild-Modus"]) {
      await expect(chat.page.getByRole("button", { name, exact: true })).toBeDisabled();
    }
    // Auch direkt an der API vorbei an der Oberfläche ist alles gesperrt.
    const api = chat.page.request;
    expect((await api.post("/api/images", { data: { prompt: "x", size: "1024x1024", quality: "low" } })).status()).toBe(503);
    expect((await api.post("/api/transcribe/start", { data: { key: "uploads/12345678-aaaa/ton.mp3", name: "ton.mp3" } })).status()).toBe(503);
    expect((await api.post("/api/files/process", { data: { key: "uploads/12345678-aaaa/a.txt", name: "a.txt" } })).status()).toBe(503);
    const sse = await (await api.post("/api/chat", {
      data: { conversationId: "c1", modelId: "claude-sonnet-5-5", presetId: null, messages: [{ id: "m1", role: "user", text: "Hallo", createdAt: 1 }] },
    })).text();
    expect(sse).toContain(message);

    await page.getByRole("tab", { name: "Übersicht" }).click();
    await expect(page.getByText("Freebie ist pausiert (Not-Aus aktiv).")).toBeVisible();
    await page.getByRole("tab", { name: "Einstellungen" }).click();
    await settingSwitch(page, "Freebie pausieren").click();
    await expect(page.getByRole("status").filter({ hasText: "Freebie läuft wieder." })).toBeVisible();
    await chat.page.reload();
    await expect(chat.composer).toBeEnabled();
    await chat.ask(`Wieder da ${uniq()}`);
  });

  test("Q02 Websuche aus: kein Schalter im Chat, keine Suche", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Websuche", false);
    const chat = await openChat(browser, baseURL!, ip);
    await expect(chat.page.getByRole("button", { name: "Websuche" })).toHaveCount(0);
    const answer = await chat.ask(`Was gibt es Neues heute? ${uniq()}`);
    expect(await chat.diagnosis(answer, "Websuche")).toBe("aus");
    await expect(answer.getByRole("navigation", { name: "Quellen" })).toHaveCount(0);
  });

  test("Q03/F08 Datei-Upload aus: Dokumente werden abgewiesen, auch in der API", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Datei-Upload", false);
    const chat = await openChat(browser, baseURL!, ip);
    await attach(chat.page, "notiz.txt");
    await expect(chip(chat.page, "notiz.txt")).toContainText("Datei-Uploads sind deaktiviert.");
    const res = await chat.page.request.post("/api/files/process", { data: { key: "uploads/12345678-aaaa/a.txt", name: "a.txt" } });
    expect(res.status()).toBe(403);
    expect((await res.json()).error).toBe("Datei-Uploads sind deaktiviert.");
  });

  test("Q04/F08 Audio-Transkription aus: Audio wird abgewiesen; ohne Upload und Audio verschwindet die Büroklammer", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Audio-Transkription", false);
    let chat = await openChat(browser, baseURL!, ip);
    await attach(chat.page, "ton.mp3");
    await expect(chip(chat.page, "ton.mp3")).toContainText("Audio-Transkription ist deaktiviert.");
    expect((await chat.page.request.post("/api/transcribe/start", { data: { key: "uploads/12345678-aaaa/ton.mp3", name: "ton.mp3" } })).status()).toBe(403);

    await toggleAndSave(page, "Datei-Upload", false);
    chat = await openChat(browser, baseURL!, `${ip}-2`);
    await expect(chat.page.getByRole("button", { name: "Datei anhängen" })).toHaveCount(0);
  });

  test("Q05/H04 Spracheingabe aus: kein Mikrofon, API gesperrt", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Spracheingabe", false);
    const chat = await openChat(browser, baseURL!, ip);
    await expect(chat.page.getByRole("button", { name: "Spracheingabe" })).toHaveCount(0);
    const res = await chat.page.request.post("/api/transcribe/dictate", { multipart: { file: { name: "d.webm", mimeType: "audio/webm", buffer: Buffer.alloc(2000) } } });
    expect(res.status()).toBe(403);
  });

  test("Q06/I04 Bildgenerierung aus: kein Bild-Modus, kein Werkzeug, API gesperrt", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Bildgenerierung", false);
    const chat = await openChat(browser, baseURL!, ip);
    await expect(chat.page.getByRole("button", { name: "Bild-Modus" })).toHaveCount(0);
    const answer = await chat.ask(`Erstelle ein Bild von einem Hund ${uniq()}`);
    expect(await chat.diagnosis(answer, "Bild-Werkzeug")).toBe("aus");
    expect((await chat.page.request.post("/api/images", { data: { prompt: "x", size: "1024x1024", quality: "low" } })).status()).toBe(403);
  });

  test("Q07/K07 Artefakte aus: keine Karten und kein Panel, Inhalt als Code", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Artefakte", false);
    const chat = await openChat(browser, baseURL!, ip);
    const answer = await chat.ask(`Baue mir eine Webseite ${uniq()}`);
    await expect(answer.getByRole("button", { name: /Beispielseite/ })).toHaveCount(0);
    await expect(chat.page.getByRole("region", { name: /^Artefakt:/ })).toHaveCount(0);
    await expect(chat.page.getByRole("button", { name: /^Artefakte/ })).toHaveCount(0);
    await expect(answer.locator("pre")).toContainText("<h1>Hallo von Freebie!</h1>");
    const plain = await chat.ask(`Diagnose ${uniq()}`);
    expect(await chat.diagnosis(plain, "Artefakte")).toBe("aus");
  });

  test("Q08/M04 Antwort-Cache aus: gleiche Fragen werden neu beantwortet", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Antwort-Cache", false);
    const chat = await openChat(browser, baseURL!, ip);
    const question = `Ohne Cache ${uniq()}`;
    await chat.ask(question);
    await chat.newChat();
    const again = await chat.ask(question);
    await expect(again.getByText("aus dem Cache")).toHaveCount(0);
  });

  test("Q09/M04 Cache-Hinweis aus: Treffer ohne Kennzeichen", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Cache-Hinweis anzeigen", false);
    const chat = await openChat(browser, baseURL!, ip);
    const question = `Stiller Treffer ${uniq()}`;
    await chat.ask(question);
    await chat.newChat();
    const again = await chat.ask(question);
    await expect(again.getByText("aus dem Cache")).toHaveCount(0);
    await page.getByRole("tab", { name: "Übersicht" }).click();
    await expect(page.getByText(/[1-9]\d* Treffer/).first()).toBeVisible();
  });

  test("Q10 Kosten pro Antwort an: Betrag und Cache-Tokens unter der Antwort", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "Kosten pro Antwort anzeigen", true);
    const chat = await openChat(browser, baseURL!, ip);
    await chat.ask(`Erste ${uniq()}`);
    const second = await chat.ask(`Zweite ${uniq()}`);
    await expect(second.getByTitle("Geschätzte Kosten dieser Antwort")).toHaveText(/^[\d,]+\s\$ · [\d.]+ Tokens aus Cache$/);
  });

  test("Q12/Q13 Zahlenfelder: Grenzen mit deutscher Meldung, Komma erlaubt, nichts wird still ersetzt", async ({ page, admin }) => {
    await openAdmin(page, "Einstellungen");
    const status = page.getByRole("status");
    for (const [label, value, message] of [
      ["Antwort-Cache gültig (Stunden)", "0", "Antwort-Cache gültig (Stunden): mindestens 1"],
      ["Antwort-Cache gültig (Stunden)", "1000", "Antwort-Cache gültig (Stunden): höchstens 720"],
      ["Antwort-Cache gültig (Stunden)", "", "Antwort-Cache gültig (Stunden): muss eine Zahl sein"],
    ] as const) {
      await fillAndSave(page, label, value);
      await expect(status).toHaveText(message);
    }
    await fillAndSave(page, "Antwort-Cache gültig (Stunden)", "1,5");
    await expect(status).toHaveText("Gespeichert.");
    expect((await admin.settings()).answerCacheHours).toBe(1.5);

    for (const [value, message] of [
      ["0", "Dateien aufbewahren (Tage): mindestens 1"],
      ["91", "Dateien aufbewahren (Tage): höchstens 90"],
      ["2,5", "Dateien aufbewahren (Tage): muss eine ganze Zahl sein"],
    ] as const) {
      await fillAndSave(page, "Dateien aufbewahren (Tage)", value);
      await expect(status).toHaveText(message);
    }
    await fillAndSave(page, "Dateien aufbewahren (Tage)", "30");
    await expect(status).toHaveText("Gespeichert.");
    expect((await admin.settings()).fileRetentionDays).toBe(30);
  });

  test("Q14 Bild-Vorgaben erscheinen im Bild-Modus", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await page.getByLabel("Bildqualität (Standard)").selectOption({ label: "Hoch" });
    await page.getByLabel("Bildformat (Standard)").selectOption({ label: "Hochformat" });
    await page.getByLabel("Bildmodell (OpenAI)").fill("gpt-image-2.5-flare");
    await saveButton(page).click();
    await expect(page.getByRole("status")).toHaveText("Gespeichert.");
    const chat = await openChat(browser, baseURL!, ip);
    await chat.page.getByRole("button", { name: "Bild-Modus" }).click();
    await expect(chat.page.getByLabel("Format")).toHaveValue("1024x1536");
    await expect(chat.page.getByLabel("Qualität")).toHaveValue("high");
  });

  test("Q15/G06 Neues Transkriptionsmodell: Audio wird neu transkribiert statt aus dem Cache", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    const audio = payload("ton.wav", `modell-${uniq()}.wav`);
    audio.buffer = Buffer.concat([audio.buffer, Buffer.from(audio.name)]);
    await chat.page.getByLabel("Dateien zum Anhängen").setInputFiles([audio]);
    await expectReady(chat.page, audio.name, /Tokens|Transkript/);

    await openAdmin(page, "Einstellungen");
    await page.getByLabel("Transkriptionsmodell (Audio-Dateien)", { exact: true }).fill("whisper-1");
    await saveButton(page).click();
    await expect(page.getByRole("status")).toHaveText("Gespeichert.");

    await chat.page.getByRole("button", { name: `${audio.name} entfernen` }).click();
    const start = chat.page.waitForResponse("/api/transcribe/start");
    await chat.page.getByLabel("Dateien zum Anhängen").setInputFiles([audio]);
    expect((await (await start).json()).done).toBe(false);
  });

  test("Q16 Modell für Chat-Titel: nur aktive Modelle, gespeicherter Wert bleibt", async ({ page, admin }) => {
    await openAdmin(page, "Modelle");
    await page.getByRole("button", { name: "GPT-6 Astra deaktivieren" }).click();
    await expect(page.getByRole("button", { name: "GPT-6 Astra aktivieren" })).toBeVisible();
    await page.getByRole("tab", { name: "Einstellungen" }).click();
    const select = page.getByLabel("Modell für Chat-Titel");
    await expect(select.getByRole("option", { name: "GPT-6 Astra" })).toHaveCount(0);
    await select.selectOption({ label: "GPT-6 Luna" });
    await saveButton(page).click();
    await expect(page.getByRole("status")).toHaveText("Gespeichert.");
    expect((await admin.settings()).titleModelId).toBe("gpt-6-luna");
  });

  test("Q17 PDFs nativ: PDF geht als Dokument an fähige Modelle", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Einstellungen");
    await toggleAndSave(page, "PDFs nativ an das Modell schicken", true);
    const chat = await openChat(browser, baseURL!, ip);
    await attach(chat.page, "bericht.pdf");
    await expectReady(chat.page, "bericht.pdf", /Tokens/);
    const answer = await chat.ask(`Lies das PDF ${uniq()}`);
    expect(await chat.diagnosis(answer, "Dateien")).toBe("bericht.pdf (PDF nativ)");
    expect(await chat.diagnosis(answer, "Zusätzliche Anhänge")).toBe("1");
  });

  test("Q18/B02 Hinweistexte: neuer Text erscheint überall und muss erneut bestätigt werden", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    const full = `Neuer Hinweis für die Schulung am Freitag ${uniq()}. Bitte nichts Vertrauliches eingeben.`;
    const short = `Kurzhinweis ${uniq()}`;
    await openAdmin(page, "Einstellungen");
    await page.getByLabel("Vollständiger Text").fill(full);
    await page.getByLabel("Kurzform (Fußzeile)").fill(short);
    await saveButton(page).click();
    await expect(page.getByRole("status")).toHaveText("Gespeichert.");

    await chat.page.reload();
    const dialog = chat.page.getByRole("dialog", { name: "Wichtiger Hinweis" });
    await expect(dialog).toContainText(full);
    await dialog.getByRole("button", { name: "Verstanden" }).click();
    await expect(chat.page.getByText(short)).toBeVisible();
    expect(await chat.page.evaluate((k) => localStorage.getItem(k), noticeKey(full, chat.guest!.id))).toBe("1");

    const anon = await browser.newPage({ baseURL });
    await anon.goto("/login");
    await expect(anon.getByText(full)).toBeVisible();
    await anon.close();

    await page.getByLabel("Vollständiger Text").fill("Zu kurz");
    await saveButton(page).click();
    await expect(page.getByRole("status")).toHaveText("Hinweis: vollständiger Text: mindestens 10 Zeichen");
  });

  test("Q19 Hinweise an das Modell landen im System-Prompt", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    const question = `Mit Kursleitung ${uniq()}`;
    const before = await chat.ask(question);
    expect(await chat.diagnosis(before, "Kursleitung")).toBe("nein");
    await openAdmin(page, "Einstellungen");
    await page.getByLabel("Hinweise an das Modell").fill("Heute ist die Schulung „KI im Vertrieb“.");
    await saveButton(page).click();
    await expect(page.getByRole("status")).toHaveText("Gespeichert.");
    await chat.newChat();
    const after = await chat.ask(question);
    expect(await chat.diagnosis(after, "Kursleitung")).toBe("ja");
    await expect(after.getByText("aus dem Cache")).toHaveCount(0);
  });

  test("Q20 Speichern: nur bei Änderungen, zwei Admins überschreiben sich nicht", async ({ page, browser, baseURL, admin }) => {
    await openAdmin(page, "Einstellungen");
    await expect(saveButton(page)).toBeDisabled();
    await page.getByLabel("Bildmodell (OpenAI)").fill("gpt-image-anders");
    await expect(page.getByText("Ungespeicherte Änderungen")).toBeVisible();
    await expect(saveButton(page)).toBeEnabled();

    // Ein zweiter Admin ändert in der Zwischenzeit etwas anderes.
    const other = await browser.newPage({ baseURL });
    await openAdmin(other, "Einstellungen");
    await other.getByLabel("Kurzform (Fußzeile)").fill("Von Admin zwei");
    await other.getByRole("button", { name: "Einstellungen speichern" }).click();
    await expect(other.getByRole("status")).toHaveText("Gespeichert.");
    await other.close();

    await saveButton(page).click();
    await expect(page.getByRole("status")).toHaveText("Gespeichert.");
    const s = await admin.settings();
    expect(s.imageModel).toBe("gpt-image-anders");
    expect(s.noticeShort).toBe("Von Admin zwei");
  });

  test("L02/L03 Vorlage deaktivieren und empfohlenes Modell übernehmen", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Vorlagen");
    await page.getByRole("button", { name: "Vorlage „Ideen-Sparring“ bearbeiten" }).click();
    await page.getByRole("dialog").getByLabel("Empfohlenes Modell (optional)").selectOption({ label: "GPT-6 Luna" });
    await page.getByRole("dialog").getByRole("button", { name: "Speichern" }).click();
    await page.getByRole("button", { name: "Vorlage „E-Mail-Profi“ bearbeiten" }).click();
    await page.getByRole("dialog").getByRole("switch", { name: "Aktiv" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();

    const chat: ChatPage = await openChat(browser, baseURL!, ip);
    await expect(chat.page.getByRole("button", { name: /^E-Mail-Profi/ })).toHaveCount(0);
    await chat.page.getByRole("button", { name: /^Ideen-Sparring/ }).click();
    await expect(chat.page.getByRole("button", { name: /^Modell:/ })).toHaveAccessibleName("Modell: GPT-6 Luna");
  });
});
