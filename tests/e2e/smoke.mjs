// E2E-Smoke-Test gegen eine laufende Instanz im Testmodus (FREEBIE_MOCK=1).
// Aufruf: BASE_URL=http://localhost:3000 APP_PASSWORD=freebie ADMIN_PASSWORD=admin npm run test:e2e
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const APP_PASSWORD = process.env.APP_PASSWORD ?? "freebie";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";
const executablePath = process.env.CHROMIUM_PATH || (process.env.PLAYWRIGHT_BROWSERS_PATH ? "/opt/pw-browsers/chromium" : undefined);

let failures = 0;
async function step(name, fn) {
  const started = Date.now();
  try {
    await fn();
    console.log(`✓ ${name} (${Date.now() - started} ms)`);
  } catch (err) {
    failures++;
    if (process.env.E2E_SCREENSHOTS) await page.screenshot({ path: path.join(process.env.E2E_SCREENSHOTS, `fehler-${failures}.png`) }).catch(() => {});
    console.error(`✗ ${name}\n  ${err instanceof Error ? err.message.split("\n")[0] : err}`);
  }
}

function wav(seconds = 2, rate = 16000) {
  const samples = seconds * rate;
  const buf = Buffer.alloc(44 + samples * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) buf.writeInt16LE(Math.round(Math.sin((i / rate) * 2 * Math.PI * 440) * 8000), 44 + i * 2);
  return buf;
}

async function send(text) {
  await page.fill("textarea", text);
  await page.locator("button[aria-label='Senden']:not([disabled])").click({ timeout: 30000 });
}

const dir = await mkdtemp(path.join(os.tmpdir(), "freebie-e2e-"));
const files = {
  csv: path.join(dir, "umsatz.csv"),
  txt: path.join(dir, "notiz.txt"),
  png: path.join(dir, "punkt.png"),
  wav: path.join(dir, "ton.wav"),
};
await writeFile(files.csv, "Monat,Umsatz\nJan,100\nFeb,120\n");
await writeFile(files.txt, "Das ist eine Testnotiz für Freebie.");
await writeFile(
  files.png,
  Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
);
await writeFile(files.wav, wav());

const browser = await chromium.launch({ executablePath });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));

await step("Ohne Anmeldung wird auf /login umgeleitet", async () => {
  await page.goto(BASE);
  await page.waitForURL(/\/login$/);
  await page.getByText("Spielumgebung").first().waitFor();
});

await step("Falsches Passwort wird abgelehnt", async () => {
  await page.fill("input[type=password]", "falsch");
  await page.click("button[type=submit]");
  await page.getByText("Das Passwort stimmt nicht.").waitFor();
});

await step("Anmeldung und Hinweis „Spielumgebung“", async () => {
  await page.fill("input[type=password]", APP_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/`);
  await page.getByText("Wichtiger Hinweis").waitFor();
  await page.getByRole("button", { name: "Verstanden" }).click();
  await page.getByText("Hallo, ich bin").waitFor();
});

await step("Standardmodell ist Claude Sonnet 5.5 auf „Mittel“", async () => {
  await page.locator("header").getByText("Claude Sonnet 5.5").waitFor();
  await page.getByRole("button", { name: /Mittel/ }).waitFor();
});

await step("Chat-Antwort wird gestreamt", async () => {
  await send("Hallo Freebie!");
  await page.getByText("Testmodus:").first().waitFor({ timeout: 20000 });
});

await step("Identische Anfrage kommt aus dem Antwort-Cache", async () => {
  await page.getByRole("button", { name: "Neuer Chat" }).first().click();
  await send("Hallo Freebie!");
  await page.getByText("aus dem Cache").waitFor({ timeout: 20000 });
});

await step("Neu generieren umgeht den Cache", async () => {
  await page.getByRole("button", { name: "Neu generieren" }).click();
  await page.getByText("Testmodus:").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  if (await page.getByText("aus dem Cache").count()) throw new Error("Antwort sollte nicht aus dem Cache kommen");
});

await step("Dateien hochladen (CSV, Text, Bild, Audio) und befragen", async () => {
  await page.setInputFiles("input[type=file][multiple]", [files.csv, files.txt, files.png, files.wav]);
  await page.waitForFunction(() => !document.querySelector("[aria-label='Anhang entfernen'] ~ * .animate-spin, .animate-spin"), null, { timeout: 60000 });
  await send("Was steht in den Dateien?");
  await page.getByText("ton (Transkript)").waitFor({ timeout: 20000 });
  await page.getByText("Zusätzliche Anhänge").last().waitFor({ timeout: 20000 });
});

await step("Artefakt wird im Seitenpanel angezeigt", async () => {
  await send("Baue mir eine Webseite");
  await page.getByText("Klicken zum Öffnen").last().waitFor({ timeout: 20000 });
  await page.frameLocator("iframe[title='Beispielseite']").getByText("Hallo von Freebie!").waitFor({ timeout: 10000 });
});

await step("Bild per Bild-Modus erzeugen", async () => {
  await page.getByRole("button", { name: /Bild/ }).last().click();
  await page.fill("dialog textarea", "Ein Leuchtturm bei Sonnenuntergang");
  await page.getByRole("button", { name: "Bild erzeugen" }).click();
  await page.getByText("Hier ist dein Bild aus dem Bild-Modus.").waitFor({ timeout: 20000 });
});

await step("Admin-Bereich: Anmeldung und Übersicht", async () => {
  await page.goto(`${BASE}/admin`);
  await page.fill("input[type=password]", ADMIN_PASSWORD);
  await page.click("button[type=submit]");
  await page.getByText("Systemstatus").waitFor({ timeout: 15000 });
  await page.getByText("Antwort-Cache").first().waitFor();
});

await step("Admin-Bereich: Modelle und Einstellungen", async () => {
  await page.getByRole("button", { name: "Modelle", exact: true }).click();
  await page.getByText("claude-sonnet-5-5").waitFor();
  await page.getByRole("button", { name: "Einstellungen", exact: true }).click();
  await page.getByText("Not-Aus").waitFor();
});

await step("Keine unbehandelten Fehler im Browser", async () => {
  if (pageErrors.length) throw new Error(pageErrors.join(" | "));
});

await browser.close();
if (failures) {
  console.error(`\n${failures} Schritt(e) fehlgeschlagen.`);
  process.exit(1);
}
console.log("\nAlle E2E-Schritte erfolgreich.");
