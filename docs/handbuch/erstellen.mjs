// Erzeugt docs/Freebie-Handbuch.pdf und docs/Freebie-Handbuch-Teilnehmende.pdf: startet Freebie im Testmodus
// mit frischer Datenbank, nimmt alle Screenshots auf und rendert beide Handbücher mit Chromium.
// Zwischenstände liegen in .data/handbuch.
//
//   npm run build && npm run docs:handbuch
process.env.TZ = "Europe/Berlin";

import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { extractText, getDocumentProxy } from "unpdf";
import { ADMIN } from "../../tests/e2e/support/servers.mjs";
import { takeScreenshots } from "./screenshots.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const source = import.meta.dirname;
const build = path.join(root, ".data/handbuch");
/** Beide Handbücher nutzen dieselben Screenshots, dieselbe Gestaltung und dasselbe Inhaltsverzeichnis-Skript. */
const books = [
  { html: "handbuch.html", output: path.join(root, "docs/Freebie-Handbuch.pdf") },
  { html: "teilnehmende.html", output: path.join(root, "docs/Freebie-Handbuch-Teilnehmende.pdf") },
];
const PORT = 3400;
const baseURL = `http://localhost:${PORT}`;

if (!existsSync(path.join(root, ".next/BUILD_ID"))) {
  console.error("Kein Produktions-Build gefunden – bitte zuerst „npm run build“ ausführen.");
  process.exit(1);
}
for (const dir of ["shots", "dateien", "fonts"]) mkdirSync(path.join(build, dir), { recursive: true });

// ---------------------------------------------------------------- Server im Testmodus

console.log("Starte Freebie im Testmodus …");
const server = spawn(process.execPath, ["tests/e2e/support/serve.mjs", "handbuch", String(PORT), "mock"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));
const stopServer = () => server.exitCode === null && server.kill("SIGTERM");
process.on("exit", stopServer);

async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null) throw new Error(`Der Server ist beendet:\n${serverLog}`);
    try {
      if ((await fetch(`${baseURL}/login`)).ok) return;
    } catch {
      // startet noch
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Der Server antwortet nicht:\n${serverLog}`);
}

// ---------------------------------------------------------------- Schriften und Bilder der App

/** Die Schriften der App (aus dem Build) für das Handbuch übernehmen. */
function copyFonts() {
  const dirs = [".next/static/chunks", ".next/static/css"].map((d) => path.join(root, d)).filter(existsSync);
  const css = dirs.flatMap((d) => readdirSync(d).filter((f) => f.endsWith(".css")).map((f) => readFileSync(path.join(d, f), "utf8"))).join("\n");
  const rules = css.match(/@font-face\{font-family:(?:Hanken Grotesk|Space Grotesk|Bree Serif);[^}]*\}/g) ?? [];
  if (rules.length === 0) throw new Error("Keine Schriften im Build gefunden.");
  for (const rule of rules) {
    for (const [, file] of rule.matchAll(/url\(\.\.\/media\/([^)]+)\)/g)) copyFileSync(path.join(root, ".next/static/media", file), path.join(build, "fonts", file));
  }
  writeFileSync(path.join(build, "fonts.css"), [...new Set(rules)].map((r) => r.replaceAll("../media/", "fonts/")).join("\n"));
}

function copySources() {
  for (const file of [...books.map((b) => b.html), "style.css", "inhalt.js"]) copyFileSync(path.join(source, file), path.join(build, file));
  copyFileSync(path.join(root, "app/icon.png"), path.join(build, "icon.png"));
  copyFileSync(path.join(root, "public/stefanai-logo.png"), path.join(build, "stefanai-logo.png"));
}

// ---------------------------------------------------------------- PDF

const norm = (s) => s.replace(/\s+/g, "").replaceAll("­", "").toLowerCase();

/** Seite (ab 1, Deckblatt mitgezählt) jedes Eintrags im Inhaltsverzeichnis – der Reihe nach gesucht. */
async function findPages(pdf, toc) {
  const { text } = await extractText(await getDocumentProxy(new Uint8Array(pdf)), { mergePages: false });
  const pages = text.map(norm);
  const result = {};
  let cursor = 0;
  let part = 0;
  for (const entry of toc) {
    const needle = entry.num === null ? norm(`Teil ${++part}${entry.text}`) : norm(entry.num + entry.text);
    const found = pages.findIndex((p, i) => i >= cursor && p.includes(needle));
    if (found === -1) throw new Error(`„${entry.text}“ nicht im PDF gefunden.`);
    result[entry.id] = found + 1;
    cursor = found;
  }
  return { result, count: pages.length };
}

async function render(browser, html, pages) {
  const page = await browser.newPage();
  await page.addInitScript((p) => (window.__PAGES = p), pages);
  await page.goto(`file://${path.join(build, html)}`, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  });
  const toc = await page.evaluate(() => window.__TOC);
  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, outline: true, tagged: true });
  await page.close();
  return { pdf, toc };
}

// ---------------------------------------------------------------- Ablauf

const executablePath = existsSync(chromium.executablePath()) ? undefined : existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
const browser = await chromium.launch({ executablePath });
try {
  await waitForServer();
  console.log("Nehme Screenshots auf …");
  await takeScreenshots({ browser, baseURL, admin: ADMIN, outDir: path.join(build, "shots"), filesDir: path.join(build, "dateien") });
  stopServer();

  copyFonts();
  copySources();
  for (const { html, output } of books) {
    console.log(`Rendere ${html} …`);
    // Seitenzahlen im Inhaltsverzeichnis: rendern, nachschlagen, erneut rendern – bis sie sich nicht mehr ändern.
    let pages = {};
    let pdf;
    let count = 0;
    for (let pass = 1; pass <= 4; pass++) {
      const rendered = await render(browser, html, pages);
      const found = await findPages(rendered.pdf, rendered.toc);
      pdf = rendered.pdf;
      count = found.count;
      if (JSON.stringify(found.result) === JSON.stringify(pages)) break;
      pages = found.result;
      if (pass === 4) throw new Error(`Die Seitenzahlen im Inhaltsverzeichnis von ${html} stabilisieren sich nicht.`);
    }
    writeFileSync(output, pdf);
    console.log(`Fertig: ${path.relative(root, output)} (${count} Seiten, ${(pdf.length / 1024 / 1024).toFixed(1)} MB)`);
  }
} finally {
  await browser.close();
  stopServer();
}
