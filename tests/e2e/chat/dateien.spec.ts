import { expect, test, uniq } from "../support/fixtures";
import { attach, attachments, chip, expectReady, payload } from "../support/files";

const DOCUMENTS: [string, string][] = [
  ["bericht.pdf", "Umsatzbericht Seite eins"],
  ["vertrag.docx", "| Kaltmiete | 900 € |"],
  ["zahlen.xlsx", "Tabellenblatt „Kosten“"],
  ["zahlen.xls", "Miete,900"],
  ["zahlen.ods", "Februar,120"],
  ["folien.pptx", "Sprechernotizen: Hier die Zahlen langsam erklären"],
  ["umsatz.csv", "Januar,100"],
  ["tabelle.tsv", "Leipzig,620000"],
  ["notiz.txt", "LEUCHTTURM"],
  ["readme.md", "Kaffee kochen"],
  ["daten.json", '"projekt"'],
  ["skript.py", 'print("Hallo aus Python")'],
];

test.describe("F · Dateien", () => {
  test("F01 Büroklammer öffnet die Dateiauswahl mit den erlaubten Typen", async ({ chat, page }) => {
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Datei anhängen" }).click();
    const fc = await chooser;
    expect(fc.isMultiple()).toBe(true);
    const accept = await page.getByLabel("Dateien zum Anhängen").getAttribute("accept");
    for (const ext of [".pdf", ".docx", ".xlsx", ".pptx", ".csv", ".png", ".jpg", ".mp3", ".m4a"]) expect(accept).toContain(ext);
    void chat;
  });

  for (const [name, expected] of DOCUMENTS) {
    test(`F02 ${name} wird ausgelesen und erreicht das Modell`, async ({ chat, page }) => {
      await attach(page, name);
      await expectReady(page, name, /ca\. \d+ Tokens/);
      await expect(page.getByText(/≈ \d+ Tokens im Anhang/)).toBeVisible();
      const answer = await chat.ask(`#zeige-dateien Was steht drin? ${uniq()}`);
      expect(await chat.diagnosis(answer, "Dateien")).toBe(name);
      await expect(answer.locator("pre")).toContainText(expected);
      // Der Anhang erscheint an der eigenen Nachricht, das Eingabefeld ist wieder leer.
      await expect(chat.questions.last().getByRole("group", { name, exact: true })).toBeVisible();
      await expect(attachments(page)).toHaveCount(0);
    });
  }

  for (const name of ["punkt.png", "foto.jpg", "grafik.webp", "animation.gif"]) {
    test(`F03 Bild ${name} wird mit Vorschau angehängt und als Bild übergeben`, async ({ chat, page }) => {
      await attach(page, name);
      await expectReady(page, name, "Bild");
      const thumb = chip(page, name).locator("img");
      await expect(thumb).toHaveAttribute("src", /^\/api\/files\/uploads\//);
      await expect.poll(() => thumb.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const answer = await chat.ask(`Was siehst du? ${uniq()}`);
      expect(await chat.diagnosis(answer, "Zusätzliche Anhänge")).toBe("1");
      expect(await chat.diagnosis(answer, "Dateien")).toBe(name);
    });
  }

  test("F03 große Bilder werden vor dem Upload verkleinert, zu große abgelehnt", async ({ chat, page }) => {
    await attach(page, "gross.png");
    await expectReady(page, "gross.png", "Bild");
    const src = await chip(page, "gross.png").locator("img").getAttribute("src");
    const png = await (await page.request.get(src!)).body();
    expect(png.readUInt32BE(16)).toBe(1568);
    expect(png.readUInt32BE(20)).toBe(1176);

    await attach(page, "rauschen.png");
    await expect(chip(page, "rauschen.png")).toContainText("Bild zu groß (max. 5 MB).", { timeout: 30_000 });
    void chat;
  });

  test("F04 Grenzfälle melden sich verständlich und blockieren nichts", async ({ chat, page }) => {
    await attach(
      page,
      "leer.txt",
      "kaputt.pdf",
      "bombe.docx",
      payload("punkt.png", "falsch.pdf"),
      { name: "programm.exe", mimeType: "application/octet-stream", buffer: Buffer.from("MZ") },
      payload("notiz.txt", "Übersicht Größe – März 🚀.txt"),
    );
    await expect(chip(page, "leer.txt")).toContainText("Die Datei ist leer.");
    await expect(chip(page, "programm.exe")).toContainText("Dieses Format wird nicht unterstützt.");
    await expect(chip(page, "kaputt.pdf")).toContainText("Die Datei konnte nicht gelesen werden. Ist sie beschädigt oder passwortgeschützt?", { timeout: 30_000 });
    await expect(chip(page, "falsch.pdf")).toContainText("Die Datei konnte nicht gelesen werden.", { timeout: 30_000 });
    await expect(chip(page, "bombe.docx")).toContainText("Die Datei ist zu groß oder beschädigt (entpackt über 200 MB).", { timeout: 30_000 });
    await expectReady(page, "Übersicht Größe – März 🚀.txt", /ca\. \d+ Tokens/);

    // Fehlerhafte Anhänge blockieren das Senden nicht; nur der gute geht mit.
    const answer = await chat.ask(`Trotzdem senden ${uniq()}`);
    expect(await chat.diagnosis(answer, "Dateien")).toBe("Übersicht Größe – März 🚀.txt");
    await expect(chip(page, "leer.txt")).toBeVisible();
  });

  test("F04 Größengrenzen werden vor dem Upload geprüft", async ({ chat, page }) => {
    // Dateien mit vorgetäuschter Größe – so muss nichts Großes erzeugt werden.
    await page.evaluate(() => {
      const fake = (name: string, mb: number) => {
        const f = new File(["x"], name);
        Object.defineProperty(f, "size", { value: mb * 1024 * 1024 + 1 });
        return f;
      };
      const dt = new DataTransfer();
      for (const f of [fake("riesig.png", 20), fake("riesig.pdf", 50), fake("riesig.mp3", 300)]) dt.items.add(f);
      const input = document.querySelector<HTMLInputElement>('input[aria-label="Dateien zum Anhängen"]')!;
      Object.defineProperty(input, "files", { value: dt.files, configurable: true });
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect(chip(page, "riesig.png")).toContainText("Zu groß (max. 20 MB).");
    await expect(chip(page, "riesig.pdf")).toContainText("Zu groß (max. 50 MB).");
    await expect(chip(page, "riesig.mp3")).toContainText("Zu groß (max. 300 MB).");
    void chat;
  });

  test("F05 mehr als 20 Anhänge: der Rest wird mit Hinweis abgewiesen", async ({ chat, page }) => {
    const files = Array.from({ length: 21 }, (_, i) => ({ name: `datei-${i + 1}.txt`, mimeType: "text/plain", buffer: Buffer.from(`Inhalt ${i + 1}`) }));
    await page.getByLabel("Dateien zum Anhängen").setInputFiles(files);
    await expect(chip(page, "datei-21.txt")).toContainText("Höchstens 20 Anhänge pro Nachricht.");
    await expectReady(page, "datei-20.txt", /ca\. \d+ Tokens/);
    void chat;
  });

  test("F05 Anhang entfernen bricht den laufenden Upload ab", async ({ chat, page }) => {
    let release: () => void = () => {};
    let started: () => void = () => {};
    const uploadStarted = new Promise<void>((r) => (started = r));
    await page.route("/api/upload/local", async (route) => {
      started();
      await new Promise<void>((r) => (release = r));
      await route.continue().catch(() => {});
    });
    const aborted = page.waitForEvent("requestfailed", (r) => r.url().endsWith("/api/upload/local"));
    await attach(page, "notiz.txt");
    await uploadStarted;
    await expect(chat.sendButton).toBeDisabled();
    await attachments(page).getByRole("button", { name: "notiz.txt entfernen" }).click();
    await expect(chip(page, "notiz.txt")).toHaveCount(0);
    expect((await aborted).failure()?.errorText).toMatch(/ABORTED|cancel/i);
    release();
    await chat.composer.fill("Ohne Anhang");
    await expect(chat.sendButton).toBeEnabled();
  });

  test("F06 Drag & Drop zeigt eine Ablagefläche und hängt Dateien an, Einfügen ebenso", async ({ chat, page }) => {
    const transfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(["Abgelegt per Drag & Drop"], "abgelegt.txt", { type: "text/plain" }));
      return dt;
    });
    await page.dispatchEvent("main", "dragover", { dataTransfer: transfer });
    await expect(page.getByText("Dateien hier ablegen")).toBeVisible();
    await page.dispatchEvent("main", "dragleave", { dataTransfer: transfer });
    await expect(page.getByText("Dateien hier ablegen")).toBeHidden();
    await page.dispatchEvent("main", "dragover", { dataTransfer: transfer });
    await page.dispatchEvent("main", "drop", { dataTransfer: transfer });
    await expect(page.getByText("Dateien hier ablegen")).toBeHidden();
    await expectReady(page, "abgelegt.txt", /ca\. \d+ Tokens/);

    await chat.composer.evaluate((el) => {
      const dt = new DataTransfer();
      dt.items.add(new File([new Uint8Array([137, 80, 78, 71])], "eingefuegt.png", { type: "image/png" }));
      // Firefox übernimmt clipboardData nicht aus dem Konstruktor – daher nachträglich setzen.
      const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true });
      Object.defineProperty(event, "clipboardData", { value: dt });
      el.dispatchEvent(event);
    });
    await expect(chip(page, "eingefuegt.png")).toBeVisible();
  });

  test("F07 dieselbe Datei ein zweites Mal kommt aus dem Datei-Cache", async ({ chat, page }) => {
    const id = uniq();
    const content = { name: "einmalig.txt", mimeType: "text/plain", buffer: Buffer.from(`Einmaliger Inhalt ${id}`) };
    const first = page.waitForResponse("/api/files/process");
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([content]);
    expect((await first).headers()["x-freebie-cache"]).toBe("miss");
    await expectReady(page, "einmalig.txt", /ca\. \d+ Tokens/);
    await attachments(page).getByRole("button", { name: "einmalig.txt entfernen" }).click();

    const second = page.waitForResponse("/api/files/process");
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([{ ...content, name: "kopie.txt" }]);
    expect((await second).headers()["x-freebie-cache"]).toBe("hit");
    await expectReady(page, "kopie.txt", /ca\. \d+ Tokens/);
    void chat;
  });

  test("F09 Anhänge bleiben Teil des Verlaufs und stehen im Export", async ({ chat, page }) => {
    const id = uniq();
    await attach(page, "vertrag.docx");
    await expectReady(page, "vertrag.docx", /ca\. \d+ Tokens/);
    await chat.ask(`Fasse zusammen ${id}`);
    const second = await chat.ask(`Und jetzt kürzer ${id}`);
    expect(await chat.diagnosis(second, "Nachrichten im Verlauf")).toBe("3");
    await expect(chat.questions.first().getByRole("group", { name: "vertrag.docx", exact: true })).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Chat als Markdown exportieren" }).click();
    const text = Buffer.concat(await (await (await download).createReadStream()).toArray()).toString("utf8");
    expect(text).toContain("> 📎 vertrag.docx");
  });
});
