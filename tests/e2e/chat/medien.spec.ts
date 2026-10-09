import { expect, test, uniq } from "../support/fixtures";
import { attach, chip, expectReady, freshPayload, payload } from "../support/files";

test.describe("G · Audio-Transkription", () => {
  test("G01 kurze MP3 wird transkribiert und erreicht das Modell", async ({ chat, page }) => {
    await attach(page, "ton.mp3");
    await expectReady(page, "ton.mp3", /Tokens|Transkript/);
    const answer = await chat.ask(`#zeige-dateien Worum geht es? ${uniq()}`);
    expect(await chat.diagnosis(answer, "Dateien")).toBe("ton (Transkript)");
    await expect(answer.locator("pre")).toContainText("[Testmodus] Transkript von teil-0.mp3");
  });

  test("G02 25-Minuten-Aufnahme: drei Abschnitte parallel, mit Fortschritt", async ({ chat, page }) => {
    const chunks: number[] = [];
    page.on("request", (r) => {
      if (r.url().endsWith("/api/transcribe/chunk")) chunks.push(JSON.parse(r.postData() ?? "{}").index);
    });
    // Abschnitte gestaffelt bremsen, damit der Fortschritt sichtbar wird.
    await page.route("/api/transcribe/chunk", async (route) => {
      const index = JSON.parse(route.request().postData() ?? "{}").index as number;
      await new Promise((r) => setTimeout(r, 600 * (index + 1)));
      await route.continue();
    });
    await attach(page, freshPayload("lang.mp3"));
    await expect(chip(page, "lang.mp3")).toContainText("Transkribiere Abschnitt 0/3", { timeout: 60_000 });
    await expect(chip(page, "lang.mp3")).toContainText(/Transkribiere Abschnitt [12]\/3/);
    await expectReady(page, "lang.mp3", /Tokens|Transkript/);
    expect(chunks.sort()).toEqual([0, 1, 2]);
    const answer = await chat.ask(`#zeige-dateien Zusammenfassung ${uniq()}`);
    for (const i of [0, 1, 2]) await expect(answer.locator("pre")).toContainText(`Transkript von teil-${i}.mp3`);
  });

  test("G03 dieselbe Aufnahme ein zweites Mal kommt aus dem Transkript-Cache", async ({ chat, page }) => {
    const id = uniq();
    // Eigener Inhalt pro Lauf, damit der Cache wirklich erst beim zweiten Mal greift.
    const audio = payload("ton.wav", `cache-${id}.wav`);
    audio.buffer = Buffer.concat([audio.buffer, Buffer.from(id)]);
    const first = page.waitForResponse("/api/transcribe/start");
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([audio]);
    expect((await (await first).json()).done).toBe(false);
    await expectReady(page, `cache-${id}.wav`, /Tokens|Transkript/);
    await page.getByRole("button", { name: `cache-${id}.wav entfernen` }).click();

    const second = page.waitForResponse("/api/transcribe/start");
    await page.getByLabel("Dateien zum Anhängen").setInputFiles([{ ...audio, name: `nochmal-${id}.wav` }]);
    const body = await (await second).json();
    expect(body).toMatchObject({ done: true, cached: true });
    await expectReady(page, `nochmal-${id}.wav`, /Tokens|Transkript/);
    void chat;
  });

  test("G04 ein Abschnitt scheitert einmal: automatische Wiederholung", async ({ chat, page }) => {
    let failures = 0;
    await page.route("/api/transcribe/chunk", async (route) => {
      if (failures === 0) {
        failures++;
        await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Kurz überlastet" }) });
      } else {
        await route.continue();
      }
    });
    await attach(page, freshPayload("ton.m4a"));
    await expectReady(page, "ton.m4a", /Tokens|Transkript/);
    expect(failures).toBe(1);
    void chat;
  });

  test("G04 dauerhaft scheiternder Abschnitt endet mit klarer Meldung", async ({ chat, page }) => {
    await page.route("/api/transcribe/chunk", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Der Anbieter hat gerade Probleme. Bitte gleich nochmal versuchen." }) }),
    );
    await attach(page, freshPayload("ton.flac"));
    await expect(chip(page, "ton.flac")).toContainText("Der Anbieter hat gerade Probleme.", { timeout: 30_000 });
    void chat;
  });

  for (const name of ["ton.wav", "ton.ogg", "ton.webm", "ton.flac"]) {
    test(`G05 Format ${name} wird transkribiert`, async ({ chat, page }) => {
      const audio = payload(name);
      audio.buffer = Buffer.concat([audio.buffer, Buffer.from(uniq())]);
      await page.getByLabel("Dateien zum Anhängen").setInputFiles([audio]);
      await expectReady(page, name, /Tokens|Transkript/);
      void chat;
    });
  }

  test("G05 Video ohne Ton und kaputte Audiodateien melden sich verständlich", async ({ chat, page }) => {
    await attach(page, "nur-video.mp4", "kaputt.mp3");
    await expect(chip(page, "nur-video.mp4")).toContainText("Die Audiodatei enthält keine Tonspur.", { timeout: 30_000 });
    await expect(chip(page, "kaputt.mp3")).toContainText("Die Audiodatei konnte nicht gelesen werden. Ist sie beschädigt?", { timeout: 30_000 });
    void chat;
  });
});

test.describe("H · Spracheingabe @nur-chromium", () => {
  test("H01 Aufnehmen und Stoppen hängt den Text an die Eingabe an", async ({ chat, page }) => {
    await chat.composer.fill("Bitte notieren:");
    await page.getByRole("button", { name: "Spracheingabe" }).click();
    const stop = page.getByRole("button", { name: "Aufnahme beenden" });
    await expect(stop).toBeVisible();
    await expect(stop).toContainText(/0:0[2-9]/, { timeout: 10_000 });
    await stop.click();
    await expect(chat.composer).toHaveValue(/^Bitte notieren: \[Testmodus\] Transkript von diktat\.(webm|ogg|m4a)/, { timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Spracheingabe" })).toBeEnabled();
  });

  test("H02 verweigertes Mikrofon gibt einen Hinweis, der sich wegklicken lässt", async ({ page, chat }) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("verweigert", "NotAllowedError"));
    });
    await page.reload();
    await page.getByRole("button", { name: "Spracheingabe" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "Kein Zugriff auf das Mikrofon. Bitte im Browser erlauben." });
    await expect(alert).toBeVisible();
    await alert.click();
    await expect(alert).toBeHidden();
    void chat;
  });

  test("H03 nach 10 Minuten stoppt die Aufnahme von selbst", async ({ page, chat }) => {
    await page.clock.install();
    await page.reload();
    await page.getByRole("button", { name: "Spracheingabe" }).click();
    await expect(page.getByRole("button", { name: "Aufnahme beenden" })).toBeVisible();
    await page.clock.fastForward(10 * 60 * 1000 + 1000);
    await expect(page.getByRole("button", { name: "Aufnahme beenden" })).toBeHidden({ timeout: 10_000 });
    void chat;
  });
});

test.describe("I · Bilder", () => {
  test("I01 Bild-Modus: Beschreibung nötig, Auswahl wird übernommen, Ergebnis mit Download", async ({ chat, page }) => {
    await page.getByRole("button", { name: "Bild-Modus" }).click();
    const dialog = page.getByRole("dialog", { name: "Bild-Modus" });
    await expect(dialog).toBeVisible();
    const create = dialog.getByRole("button", { name: "Bild erzeugen" });
    await expect(create).toBeDisabled();
    await expect(dialog.getByLabel("Format")).toHaveValue("1024x1024");
    await expect(dialog.getByLabel("Qualität")).toHaveValue("medium");

    const prompt = `Ein Leuchtturm bei Sonnenuntergang ${uniq()}`;
    await dialog.getByLabel("Bildbeschreibung").fill(prompt);
    await dialog.getByLabel("Format").selectOption({ label: "Querformat" });
    await dialog.getByLabel("Qualität").selectOption({ label: "Entwurf (schnell, günstig)" });
    const request = page.waitForRequest("/api/images");
    await create.click();
    expect((await request).postDataJSON()).toEqual({ prompt, size: "1536x1024", quality: "low" });
    await expect(dialog).toBeHidden();

    await expect(chat.questions.last()).toContainText(`🎨 Bild-Modus: ${prompt}`);
    const answer = chat.lastAnswer;
    await expect(answer).toContainText("Hier ist dein Bild aus dem Bild-Modus.");
    const img = answer.getByRole("img", { name: prompt });
    await expect(img).toBeVisible();
    await expect(answer.getByRole("button", { name: "Neu generieren" })).toHaveCount(0);
    const download = page.waitForEvent("download");
    await answer.getByRole("link", { name: "Herunterladen" }).click();
    expect((await download).suggestedFilename()).toMatch(/\.(png|svg)$/);
    const popup = page.waitForEvent("popup");
    await img.click();
    await expect(await popup).toHaveURL(/\/api\/files\/images\//);
  });

  test("I01 Bild-Modus schließt per X, Esc, Abbrechen und Klick daneben", async ({ chat, page }) => {
    const dialog = page.getByRole("dialog", { name: "Bild-Modus" });
    const open = () => page.getByRole("button", { name: "Bild-Modus" }).click();
    await open();
    await dialog.getByRole("button", { name: "Schließen" }).click();
    await expect(dialog).toBeHidden();
    await open();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await open();
    await dialog.getByRole("button", { name: "Abbrechen" }).click();
    await expect(dialog).toBeHidden();
    await open();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();
    void chat;
  });

  test("I02 Fehler bei der Erzeugung wird gezeigt und beim nächsten Öffnen zurückgesetzt", async ({ chat, page }) => {
    await page.route("/api/images", (route) =>
      route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "Die Bild-API hat kein Bild geliefert." }) }),
    );
    await page.getByRole("button", { name: "Bild-Modus" }).click();
    const dialog = page.getByRole("dialog", { name: "Bild-Modus" });
    await dialog.getByLabel("Bildbeschreibung").fill("Ein Bild, das scheitert");
    await dialog.getByRole("button", { name: "Bild erzeugen" }).click();
    await expect(dialog.getByRole("alert")).toHaveText("Die Bild-API hat kein Bild geliefert.");
    await dialog.getByRole("button", { name: "Abbrechen" }).click();
    await page.getByRole("button", { name: "Bild-Modus" }).click();
    await expect(dialog.getByRole("alert")).toHaveCount(0);
    await expect(dialog.getByLabel("Bildbeschreibung")).toHaveValue("Ein Bild, das scheitert");
    void chat;
  });

  test("I03 Bild direkt im Chat über das Werkzeug", async ({ chat }) => {
    const answer = await chat.ask(`Erstelle ein Bild von einem Leuchtturm ${uniq()}`);
    await expect(answer).toContainText("Hier ist dein Bild (Testmodus).");
    await expect(answer.getByRole("img")).toHaveCount(1);
    const failed = await chat.ask(`#bildfehler ${uniq()}`);
    await expect(failed).toContainText("Das Bild konnte nicht erzeugt werden: Die Bild-API hat kein Bild geliefert.");
  });

  test("I05 sehr lange Bildbeschreibungen werden begrenzt", async ({ chat, page }) => {
    await page.getByRole("button", { name: "Bild-Modus" }).click();
    const field = page.getByLabel("Bildbeschreibung");
    await field.fill("a".repeat(5000));
    expect((await field.inputValue()).length).toBe(4000);
    await expect(page.getByText("4000 / 4000 Zeichen")).toBeVisible();
    void chat;
  });
});

test.describe("J · Websuche", () => {
  test("J01 an: Quellen mit Nummer und Seitenname; aus: keine Suche", async ({ chat, page }) => {
    const toggle = page.getByRole("button", { name: "Websuche" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    const answer = await chat.ask(`Was gibt es Neues heute? ${uniq()}`);
    const sources = answer.getByRole("navigation", { name: "Quellen" });
    const link = sources.getByRole("link");
    await expect(link).toHaveCount(1);
    await expect(link).toContainText("1");
    await expect(link).toContainText("StefanAI – KI Schulungen & Beratungen");
    await expect(link).toContainText("stefanai.de");
    await expect(link).toHaveAttribute("target", "_blank");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    const without = await chat.ask(`Was gibt es Neues heute? ${uniq()}`);
    await expect(without.getByRole("navigation", { name: "Quellen" })).toHaveCount(0);
    expect(await chat.diagnosis(without, "Websuche")).toBe("aus");
  });

  test("J02 höchstens 12 Quellen, Dubletten nur einmal", async ({ chat }) => {
    const answer = await chat.ask(`#quellen:20 ${uniq()}`);
    const links = answer.getByRole("navigation", { name: "Quellen" }).getByRole("link");
    await expect(links).toHaveCount(12);
    const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(new Set(hrefs).size).toBe(12);
  });
});
