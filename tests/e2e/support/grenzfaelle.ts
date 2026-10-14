import type { Locator, Page } from "@playwright/test";
import { expect, type ChatPage } from "./fixtures";

// Testhelfer für Grenzfälle und Fehlbedienung (GRENZFAELLE-PLAN.md, Abschnitt 5.1): Einfügen und Ablegen mit der
// echten Form der Zwischenablage, Doppelklicks, langsame Geräte, Ausfälle von Speicher und Plattform – und die
// Invarianten, die nach jedem Grenzfall gelten müssen.

/**
 * Fügt Text so ein, wie ihn der Browser aus der Zwischenablage liefert (Firefox übernimmt clipboardData nicht aus
 * dem Konstruktor). Liefert, ob die Seite das Einfügen selbst übernommen hat (`preventDefault`).
 */
export async function pasteText(target: Locator, text: string): Promise<boolean> {
  return target.evaluate((el, value) => {
    const dt = new DataTransfer();
    dt.setData("text/plain", value);
    const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: dt });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  }, text);
}

/** Zwischenablage, wie sie Programme füllen: Office legt zum Text ein Bild der Auswahl dazu. */
export const CLIPBOARD = {
  word: { "text/plain": "Sehr geehrte Damen und Herren,\nanbei der Bericht.", "text/html": "<p class=MsoNormal>Sehr geehrte Damen und Herren,</p>", "text/rtf": "{\\rtf1 Sehr geehrte}", image: true },
  excel: { "text/plain": "Monat\tUmsatz\nJanuar\t1.234,56", "text/html": "<table><tr><td>Monat</td><td>Umsatz</td></tr></table>", image: true },
  powerpoint: { "text/plain": "Folie 1: Ziele 2026", "text/html": "<div>Folie 1: Ziele 2026</div>", image: true },
  screenshot: { image: true },
  webImage: { "text/html": '<img src="https://example.com/bild.png">', image: true },
  finderFile: { "text/plain": "bericht.png", image: true },
} as const;

/** Löst ein Einfügen mit dieser Zwischenablage aus; liefert, ob die Seite das Einfügen des Browsers verhindert hat. */
export async function pasteInto(target: Locator, kind: keyof typeof CLIPBOARD): Promise<boolean> {
  return target.evaluate((el, content) => {
    const dt = new DataTransfer();
    for (const [type, value] of Object.entries(content)) if (type !== "image") dt.setData(type, value as string);
    if (content.image) dt.items.add(new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "image.png", { type: "image/png" }));
    const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: dt });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  }, CLIPBOARD[kind] as Record<string, string | boolean>);
}

/**
 * Legt Dateien oder markierten Text auf einem Element ab (dragover, dann drop) und liefert, ob die Seite beides
 * abgefangen hat. Bei Dateien muss das so sein – sonst öffnet der Browser die Datei anstelle von Freebie.
 */
export async function dropOn(target: Locator, content: { files?: { name: string; text: string; type?: string }[]; text?: string }) {
  return target.evaluate((el, { files, text }) => {
    const transfer = () => {
      const dt = new DataTransfer();
      if (text !== undefined) dt.setData("text/plain", text);
      for (const f of files ?? []) dt.items.add(new File([f.text], f.name, { type: f.type ?? "text/plain" }));
      return dt;
    };
    const over = new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer() });
    el.dispatchEvent(over);
    const drop = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer() });
    el.dispatchEvent(drop);
    return { dragover: over.defaultPrevented, drop: drop.defaultPrevented };
  }, content);
}

/** Zwei Klicks im selben Augenblick – so arbeitet ein ausgelastetes Gerät einen Doppelklick ab. */
export async function clickTwice(target: Locator) {
  await target.evaluate((el: HTMLElement) => {
    el.click();
    el.click();
  });
}

/** Langsames Gerät (altes iPad): CPU-Drosselung über das DevTools-Protokoll, nur Chromium. */
export async function throttleCpu(page: Page, rate = 6) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  return () => cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
}

/** Hält Uploads an, bis der Test sie freigibt (zeigt laufende Uploads in Bedienfolgen). */
export async function holdUploads(page: Page): Promise<() => void> {
  let release: () => void = () => {};
  const released = new Promise<void>((r) => (release = r));
  await page.route("/api/upload/local", async (route) => {
    await released;
    await route.continue().catch(() => {});
  });
  return release;
}

/** Browser-Speicher voll: jedes Schreiben in IndexedDB wirft QuotaExceededError. */
export async function failStorage(page: Page) {
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Speicher voll", "QuotaExceededError");
    };
  });
}

/** Die Plattform antwortet mit einer HTML-Fehlerseite statt JSON (Vercel bei 413, 502, 504). */
export async function platformError(page: Page, url: string, status: number) {
  await page.route(url, (r) => r.fulfill({ status, contentType: "text/html", body: "<html><body>An error occurred</body></html>" }));
}

/** Zeichnet Mikrofon-Streams auf (vor dem Laden der Seite), damit `expectConsistent` vergessene Aufnahmen findet. */
export async function trackMicrophone(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __streams: MediaStream[] };
    w.__streams = [];
    const original = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
    if (!original) return;
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      w.__streams.push(stream);
      return stream;
    };
  });
}

/** Reihenfolge der Nachrichten im Chat: F = Frage, A = Antwort. */
export async function messageOrder(page: Page): Promise<string> {
  return page.locator("article").evaluateAll((els) => els.map((e) => (e.getAttribute("aria-label") === "Deine Nachricht" ? "F" : "A")).join(""));
}

/**
 * Invarianten nach jedem Grenzfall: Fragen und Antworten wechseln sich ab (auch Fehler und Abbrüche erscheinen als
 * Antwort), „Stoppen“ nur bei laufender Antwort, kein Mikrofon ohne Aufnahme, keine internen Fehlertexte. Übergänge
 * (Antwort wird gerade gespeichert, Liste lädt nach) dürfen sich bis zu fünf Sekunden ordnen. Unbehandelte Fehler im
 * Browser prüft die Fixture ohnehin.
 */
export async function expectConsistent(chat: ChatPage) {
  const { page } = chat;
  await expect(async () => {
    const running = await chat.stopButton.isVisible();
    const busy = await chat.answers.evaluateAll((els) => els.map((e) => e.getAttribute("aria-busy") === "true"));
    expect(await messageOrder(page), "Fragen und Antworten wechseln sich ab").toMatch(/^(FA)*$/);
    expect(busy.filter(Boolean).length, "höchstens eine laufende Antwort").toBeLessThanOrEqual(running ? 1 : 0);
    if (running) expect(busy.at(-1), "die laufende Antwort steht unten").toBe(true);
    const recording = await page.getByRole("button", { name: "Aufnahme beenden" }).isVisible();
    const liveStreams = await page.evaluate(() => ((window as unknown as { __streams?: MediaStream[] }).__streams ?? []).filter((s) => s.active).length);
    if (!recording) expect(liveStreams, "kein Mikrofon ohne Aufnahme").toBe(0);
  }).toPass({ timeout: 5_000, intervals: [100, 250, 500] });
  await expect(page.locator("main")).not.toContainText(/Failed query|Es ist ein Fehler aufgetreten:|\[object Object\]/);
}
