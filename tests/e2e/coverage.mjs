// Prüft die Abdeckungsmatrix (TESTPLAN Abschnitt 5) – läuft in der CI, ohne Browser.
//
// 1. Jede Katalog-ID aus TESTPLAN.md hat mindestens einen Test (oder steht unter "manual").
// 2. Jede Einstellung aus lib/shared/settings-defaults.ts und jede API-Route unter app/api steht in
//    tests/e2e/coverage.json – neue Einstellungen und Routen kommen nicht mehr ungetestet hinein.
// 3. Jede in coverage.json genannte Test-ID gibt es wirklich.
//
// Aufruf: node tests/e2e/coverage.mjs [--markdown]
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const read = (p) => readFileSync(path.join(root, p), "utf8");
const walk = (dir, filter) =>
  readdirSync(path.join(root, dir)).flatMap((name) => {
    const rel = path.join(dir, name);
    return statSync(path.join(root, rel)).isDirectory() ? walk(rel, filter) : filter(rel) ? [rel] : [];
  });

// Test-IDs aus den Testnamen (auch „Q03/F08 …“ und Namen in Template-Strings).
const testIds = new Map();
for (const file of walk("tests/e2e", (f) => f.endsWith(".spec.ts"))) {
  for (const m of read(file).matchAll(/test\(\s*([`"'])((?:(?!\1).)*)\1/g)) {
    const prefix = /^((?:[A-Z]\d{2}\/?)+)\s/.exec(m[2]);
    if (!prefix) continue;
    for (const id of prefix[1].split("/").filter(Boolean)) {
      if (!testIds.has(id)) testIds.set(id, []);
      testIds.get(id).push(`${path.relative("tests/e2e", file)}: ${m[2]}`);
    }
  }
}

// Katalog-IDs aus den Tabellen in TESTPLAN.md (inkl. Bereichen wie „Q02–Q10“).
const catalog = [];
for (const m of read("TESTPLAN.md").matchAll(/^\| ([A-Z])(\d{2})(?:–[A-Z]?(\d{2}))? \|/gm)) {
  const [from, to] = [Number(m[2]), Number(m[3] ?? m[2])];
  for (let n = from; n <= to; n++) catalog.push(`${m[1]}${String(n).padStart(2, "0")}`);
}

// Einstellungen aus den Standardwerten (Funktionsschalter als features.*).
const defaults = read("lib/shared/settings-defaults.ts");
const block = defaults.slice(defaults.indexOf("export const DEFAULT_SETTINGS"));
const body = block.slice(block.indexOf("{") + 1, block.indexOf("\n};"));
const featureBody = body.slice(body.indexOf("features: {") + 11, body.indexOf("},"));
const settingKeys = [
  ...[...featureBody.matchAll(/^\s{4}(\w+):/gm)].map((m) => `features.${m[1]}`),
  ...[...body.matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]).filter((k) => k !== "features"),
];

// API-Routen mit ihren Methoden.
const routes = walk("app/api", (f) => f.endsWith("route.ts")).flatMap((file) => {
  const url = "/" + path.dirname(file).replace(/^app\//, "").split(path.sep).join("/");
  return [...read(file).matchAll(/export (?:async )?function (GET|POST|PUT|DELETE|PATCH)\b/g)].map((m) => `${m[1]} ${url}`);
});

const coverage = JSON.parse(read("tests/e2e/coverage.json"));
const manual = Object.keys(coverage.manual).filter((k) => !k.startsWith("$"));
const problems = [];

for (const id of catalog) {
  if (!testIds.has(id) && !manual.includes(id)) problems.push(`Katalog-ID ${id} hat keinen Test.`);
}
for (const id of testIds.keys()) {
  if (!catalog.includes(id)) problems.push(`Test-ID ${id} steht nicht im Katalog (TESTPLAN.md).`);
}
for (const key of settingKeys) {
  if (!coverage.settings[key]?.length) problems.push(`Einstellung „${key}“ fehlt in coverage.json.`);
}
for (const key of Object.keys(coverage.settings)) {
  if (!settingKeys.includes(key)) problems.push(`coverage.json nennt die unbekannte Einstellung „${key}“.`);
}
for (const route of routes) {
  if (!coverage.routes[route]?.length) problems.push(`Route „${route}“ fehlt in coverage.json.`);
}
for (const route of Object.keys(coverage.routes)) {
  if (!routes.includes(route)) problems.push(`coverage.json nennt die unbekannte Route „${route}“.`);
}
for (const [group, entries] of Object.entries({ settings: coverage.settings, routes: coverage.routes, elements: coverage.elements })) {
  for (const [name, ids] of Object.entries(entries)) {
    if (name.startsWith("$")) continue;
    if (!ids.length) problems.push(`${group}: „${name}“ hat keine Test-ID.`);
    for (const id of ids) if (!testIds.has(id)) problems.push(`${group}: „${name}“ verweist auf ${id}, den es als Test nicht gibt.`);
  }
}

const elements = Object.keys(coverage.elements).filter((k) => !k.startsWith("$"));
const summary = [
  `Katalog: ${catalog.filter((id) => testIds.has(id)).length}/${catalog.length} IDs mit Test${manual.length ? `, ${manual.length} manuell` : ""}`,
  `Einstellungen: ${settingKeys.filter((k) => coverage.settings[k]?.length).length}/${settingKeys.length}`,
  `API-Routen: ${routes.filter((r) => coverage.routes[r]?.length).length}/${routes.length}`,
  `Bedienelemente: ${elements.length}`,
  `Tests mit ID: ${new Set([...testIds.values()].flat()).size}`,
];

if (process.argv.includes("--markdown")) {
  console.log("| ID | Tests |\n|---|---|");
  for (const id of catalog) console.log(`| ${id} | ${(testIds.get(id) ?? ["– manuell –"]).join("<br>")} |`);
} else {
  console.log(summary.join("\n"));
}
if (problems.length) {
  console.error(`\n${problems.length} Lücke(n) in der Abdeckung:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("\nAbdeckung vollständig.");
