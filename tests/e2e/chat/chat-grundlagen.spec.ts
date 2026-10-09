import { expect, test, uniq } from "../support/fixtures";

test.describe("C · Chat-Grundfunktionen", () => {
  test("C01 Startseite: Begrüßung, Beispiele füllen das Eingabefeld ohne zu senden", async ({ chat, page }) => {
    await expect(page.getByRole("heading", { name: "Hallo, ich bin Freebie." })).toBeVisible();
    const example = "Baue mir eine kleine Landingpage für ein Café in Leipzig.";
    await page.getByRole("button", { name: example }).click();
    await expect(chat.composer).toHaveValue(example);
    await expect(chat.composer).toBeFocused();
    await expect(chat.answers).toHaveCount(0);
    for (const text of [
      "Erkläre mir, wie ein Sprachmodell funktioniert – so, dass es meine Oma versteht.",
      "Erstelle ein Diagramm, wie ein Bewerbungsprozess abläuft.",
      "Was sind die wichtigsten KI-Nachrichten dieser Woche?",
    ]) {
      await page.getByRole("button", { name: text }).click();
      await expect(chat.composer).toHaveValue(text);
    }
  });

  test("C02 Senden per Button und Enter, Shift+Enter macht eine neue Zeile", async ({ chat, page }) => {
    const id = uniq();
    await chat.ask(`Erste Frage ${id}`);
    await expect(chat.questions.last()).toContainText(`Erste Frage ${id}`);

    await chat.composer.fill(`Zeile eins ${id}`);
    await chat.composer.press("Shift+Enter");
    await chat.composer.pressSequentially("Zeile zwei");
    await expect(chat.composer).toHaveValue(`Zeile eins ${id}\nZeile zwei`);
    await expect(chat.questions).toHaveCount(1);
    await chat.composer.press("Enter");
    await chat.waitForAnswer(2);
    await expect(chat.questions.last()).toHaveText(new RegExp(`Zeile eins ${id}\\s+Zeile zwei`));
    await expect(chat.composer).toHaveValue("");
    await expect(page.getByRole("heading", { name: "Hallo, ich bin Freebie." })).toBeHidden();
  });

  test("C03 Senden ist gesperrt bei leerer Eingabe und während einer Antwort", async ({ chat }) => {
    await expect(chat.sendButton).toBeDisabled();
    await chat.composer.fill("   \n  ");
    await expect(chat.sendButton).toBeDisabled();
    await chat.send(`#langsam ${uniq()}`);
    await expect(chat.stopButton).toBeVisible();
    await expect(chat.sendButton).toHaveCount(0);
    await chat.composer.fill("Zwischenfrage");
    await chat.composer.press("Enter");
    await expect(chat.questions).toHaveCount(1);
    await chat.stopButton.click();
  });

  test("C04 Antwort wird gestreamt und sauber formatiert, Einschleusungen bleiben wirkungslos", async ({ chat, page }) => {
    await chat.send(`#warten #formatierung ${uniq()}`);
    await expect(page.getByRole("button", { name: /Freebie denkt nach/ })).toBeVisible();
    await chat.waitForAnswer(1);
    const answer = chat.lastAnswer;
    await expect(answer.getByRole("heading", { name: "Formatierung" })).toBeVisible();
    await expect(answer.locator("strong", { hasText: "fett" })).toBeVisible();
    await expect(answer.getByRole("columnheader", { name: "Umsatz" })).toBeVisible();
    await expect(answer.getByRole("cell", { name: "100" })).toBeVisible();
    await expect(answer.locator(".katex").first()).toBeVisible();
    await expect(answer.getByText("python", { exact: true })).toBeVisible();
    await expect(answer.locator("pre span[style]").first()).toBeVisible();

    const link = answer.getByRole("link", { name: "StefanAI" });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    const evil = answer.getByText("Böser Link");
    expect(await evil.evaluate((el) => el.closest("a")?.getAttribute("href") ?? "")).not.toMatch(/javascript:/i);
    // Fremde Bilder werden nur verlinkt, nicht geladen.
    await expect(answer.getByRole("link", { name: "Fremdbild" })).toBeVisible();
    await expect(answer.locator('img[src^="https://example.com"]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    await expect(answer.locator("img[onerror]")).toHaveCount(0);
  });

  test("C05 Stoppen vor dem ersten Text und mitten in der Antwort", async ({ chat }) => {
    await chat.send(`#warten ${uniq()}`);
    await chat.stopButton.click();
    await chat.waitForAnswer(1);
    await expect(chat.lastAnswer.getByRole("alert")).toHaveText("Abgebrochen.");

    await chat.send(`#langsam ${uniq()}`);
    await expect(chat.answers.last()).toContainText("Testmodus", { timeout: 10_000 });
    await chat.stopButton.click();
    await chat.waitForAnswer(2);
    await expect(chat.lastAnswer.locator("em", { hasText: "(Abgebrochen)" })).toBeVisible();
    await expect(chat.lastAnswer).not.toContainText("Formel-Test");
  });

  test("C06 Neu generieren gibt es nur bei der letzten Antwort", async ({ chat }) => {
    const id = uniq();
    await chat.ask(`Frage A ${id}`);
    await chat.ask(`Frage B ${id}`);
    await expect(chat.answers.first().getByRole("button", { name: "Neu generieren" })).toHaveCount(0);
    await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).click();
    await chat.waitForAnswer(2);
    await expect(chat.lastAnswer).toContainText(`Frage B ${id}`);
    await expect(chat.lastAnswer.getByText("aus dem Cache")).toHaveCount(0);
    await expect(chat.questions).toHaveCount(2);
  });

  test("C07 frühere Nachricht bearbeiten: Abbrechen stellt her, Senden kürzt den Verlauf", async ({ chat, page }) => {
    const id = uniq();
    await chat.ask(`Original eins ${id}`);
    await chat.ask(`Original zwei ${id}`);
    const first = chat.questions.first();
    await first.hover();
    await first.getByRole("button", { name: "Bearbeiten" }).click();
    const banner = page.getByText("Du bearbeitest eine frühere Nachricht.");
    await expect(banner).toBeVisible();
    await expect(chat.composer).toHaveValue(`Original eins ${id}`);
    await page.getByRole("button", { name: "Abbrechen" }).click();
    await expect(banner).toBeHidden();
    await expect(chat.composer).toHaveValue("");

    await first.hover();
    await first.getByRole("button", { name: "Bearbeiten" }).click();
    await chat.composer.fill(`Geändert ${id}`);
    await chat.sendButton.click();
    await chat.waitForAnswer(1);
    await expect(chat.questions).toHaveCount(1);
    await expect(chat.questions.first()).toContainText(`Geändert ${id}`);
    await expect(banner).toBeHidden();
  });

  test("C08 Kopieren von Frage, Antwort und Code landet exakt in der Zwischenablage @nur-chromium", async ({ chat, page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const question = `#formatierung ${uniq()}`;
    await chat.ask(question);
    const clipboard = () => page.evaluate(() => navigator.clipboard.readText());

    await chat.questions.last().hover();
    await chat.questions.last().getByRole("button", { name: "Nachricht kopieren" }).click();
    expect(await clipboard()).toBe(question);

    await chat.lastAnswer.getByRole("button", { name: "Code kopieren" }).click();
    expect(await clipboard()).toBe('def hallo():\n    return "Freebie"');
    await expect(chat.lastAnswer.getByText("Kopiert")).toBeVisible();

    await chat.lastAnswer.getByRole("button", { name: "Antwort kopieren" }).click();
    expect(await clipboard()).toContain("Das ist **fett**");
  });

  test("C09 Gedankengang lässt sich auf- und zuklappen", async ({ chat }) => {
    const id = uniq();
    await chat.ask(`Denk nach ${id}`);
    const toggle = chat.lastAnswer.getByRole("button", { name: "Gedankengang" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(chat.lastAnswer.getByText(`Ich überlege, wie ich auf „Denk nach ${id}“`)).toBeVisible();
    await toggle.click();
    await expect(chat.lastAnswer.getByText(/Ich überlege/)).toBeHidden();
  });

  test("C10 lange Antworten scrollen mit, außer man hat hochgescrollt", async ({ chat, page }) => {
    const region = page.getByRole("region", { name: "Gespräch" });
    const distanceToBottom = () => region.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight);
    await chat.ask(`#lang ${uniq()}`);
    expect(await distanceToBottom()).toBeLessThan(5);

    await chat.send(`#lang #langsam ${uniq()}`);
    await expect(chat.lastAnswer).toContainText("Absatz 3", { timeout: 15_000 });
    await region.hover();
    // In kleinen Schritten wie ein echtes Mausrad (große Einzelsprünge verarbeitet nicht jeder Browser gleich).
    await expect
      .poll(async () => {
        await page.mouse.wheel(0, -2000);
        return region.evaluate((el) => el.scrollTop);
      })
      .toBeLessThan(50);
    await page.waitForTimeout(1500);
    expect(await region.evaluate((el) => el.scrollTop)).toBeLessThan(50);
    await chat.stopButton.click();
  });
});

test.describe("C · Fehler und Grenzfälle", () => {
  const providerErrors: [string, string][] = [
    ["401", "Der API-Schlüssel wurde abgelehnt. Bitte im Admin-Bereich prüfen."],
    ["413", "Die Anfrage ist zu groß. Bitte kürzere Dateien verwenden oder einen neuen Chat starten."],
    ["429", "Der Anbieter ist gerade überlastet oder das Kontingent ist erschöpft. Bitte gleich nochmal versuchen."],
    ["400", "Die Anfrage wurde abgelehnt: Mock-Fehler 400"],
    ["500", "Der Anbieter hat gerade Probleme. Bitte gleich nochmal versuchen."],
  ];
  for (const [code, message] of providerErrors) {
    test(`C11 Anbieterfehler ${code} erscheint als deutsche Meldung, Neu generieren bleibt möglich`, async ({ chat }) => {
      await chat.ask(`#fehler:${code} ${uniq()}`);
      await expect(chat.lastAnswer.getByRole("alert")).toHaveText(message);
      await expect(chat.lastAnswer.getByRole("button", { name: "Neu generieren" })).toBeVisible();
    });
  }

  test("C11 Ablehnung aus Sicherheitsgründen wird erklärt", async ({ chat }) => {
    await chat.ask(`#ablehnung ${uniq()}`);
    await expect(chat.lastAnswer).toContainText("Das Modell hat diese Anfrage aus Sicherheitsgründen abgelehnt.");
  });

  test("C11 abgeschnittener Stream wird als unterbrochen markiert", async ({ chat, page }) => {
    await page.route("/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: { "content-type": "text/event-stream" },
        body: 'data: {"type":"start","modelId":"claude-sonnet-5-5","fromCache":false}\n\ndata: {"type":"text","text":"Halb fert"}\n\n',
      }),
    );
    await chat.ask(`Abbruch ${uniq()}`);
    await expect(chat.lastAnswer).toContainText("Halb fert");
    await expect(chat.lastAnswer.getByRole("alert")).toHaveText("Die Antwort wurde unterbrochen (Zeitlimit oder Verbindung). Bitte „Neu generieren“ verwenden.");
  });

  test("C11 ohne Netz kommt eine deutsche Meldung statt „Failed to fetch“", async ({ chat, page }) => {
    await page.route("/api/chat", (route) => route.abort("internetdisconnected"));
    await chat.ask(`Offline ${uniq()}`);
    await expect(chat.lastAnswer.getByRole("alert")).toHaveText("Keine Verbindung zu Freebie. Bitte prüfe die Internetverbindung und versuche es erneut.");
    await page.unroute("/api/chat");
    await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).click();
    await chat.waitForAnswer(1);
    await expect(chat.lastAnswer).toContainText("Testmodus");
  });

  test("C12 Sitzung läuft mitten im Chat ab: Weiterleitung zum Login", async ({ chat, page, context }) => {
    await context.clearCookies();
    await chat.send(`Noch da? ${uniq()}`);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("C13 lange Eingaben werden komprimiert gesendet, zu lange gar nicht", async ({ chat, page }) => {
    const encodings: (string | undefined)[] = [];
    page.on("request", (r) => {
      if (r.url().endsWith("/api/chat")) encodings.push(r.headers()["x-freebie-encoding"]);
    });
    const long = `Langer Text ${uniq()} ` + "Wort ".repeat(60_000);
    await chat.composer.fill(long);
    await chat.sendButton.click();
    await chat.waitForAnswer(1);
    expect(encodings).toEqual(["gzip"]);
    await expect(chat.lastAnswer).toContainText("Testmodus");

    await chat.composer.fill("x".repeat(400_001));
    await expect(page.getByRole("alert").filter({ hasText: "Die Nachricht ist zu lang" })).toBeVisible();
    await expect(chat.sendButton).toBeDisabled();
  });

  test("C14 Markdown-Export und Drucken", async ({ chat, page }) => {
    const id = uniq();
    await page.addInitScript(() => {
      (window as unknown as { __printed: number }).__printed = 0;
      window.print = () => {
        (window as unknown as { __printed: number }).__printed++;
      };
    });
    await page.reload();
    await chat.ask(`Exporttest ${id}`);
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Chat als Markdown exportieren" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^exporttest-.*\.md$/);
    const content = await (await file.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8"));
    expect(content).toContain(`# Exporttest ${id}`);
    expect(content).toContain("## Du");
    expect(content).toContain(`Exporttest ${id}`);
    expect(content).toMatch(/## Freebie \(Claude Sonnet 5\.5\)/);

    await page.getByRole("button", { name: "Drucken oder als PDF speichern" }).click();
    expect(await page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);
    await page.emulateMedia({ media: "print" });
    await expect(chat.composer).toBeHidden();
    await expect(page.getByRole("button", { name: "Neuer Chat" }).first()).toBeHidden();
    await expect(chat.lastAnswer).toBeVisible();
  });

  test("C15 HTML in der eigenen Nachricht wird als Text gezeigt", async ({ chat, page }) => {
    const text = `<img src=x onerror="window.__xss=3"><b>fett?</b> ${uniq()}`;
    await chat.ask(text);
    await expect(chat.questions.last()).toContainText('<img src=x onerror="window.__xss=3"><b>fett?</b>');
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });
});
