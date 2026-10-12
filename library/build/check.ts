// Prüft einzelne Inhaltsdateien, ohne den ganzen Fundus zu bauen – für neue Inhalte, auch parallel.
// Aufruf: npm run library:check -- library/content/<datei>.ts [weitere Dateien]
// Erzeugt jede Datei im Speicher, liest sie wie der Chat aus und wendet dieselben Regeln an wie
// tests/unit/library.test.ts (Pflichtbegriffe, .example-Adressen, Spielfilm-Rufnummern, Postleitzahlen, IBANs, Sperrliste).
import path from "node:path";
import { pathToFileURL } from "node:url";
import { estimateTokens, extractText } from "@/lib/files/extract";
import { LIBRARY_EXTENSION, LIBRARY_MIME, lengthTag, type LibraryTag } from "@/lib/library/types";
import type { DocSpec, PersonSpec, ThreadSpec } from "../types";
import { PERSONS } from "../world";
import { renderExcel } from "./excel";
import { fictionProblems } from "./fiction";
import { renderMail, type MailAttachment } from "./mail";
import { renderPowerPoint } from "./powerpoint";
import { validateLibrary } from "./validate";
import { renderWord } from "./word";

async function render(doc: DocSpec) {
  switch (doc.type) {
    case "word":
      return renderWord(doc);
    case "excel":
      return renderExcel(doc);
    case "powerpoint":
      return renderPowerPoint(doc);
  }
}

async function main() {
  const files = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (!files.length) throw new Error("Aufruf: npm run library:check -- library/content/<datei>.ts");
  const docs: DocSpec[] = [];
  const threads: ThreadSpec[] = [];
  for (const file of files) {
    const mod = (await import(pathToFileURL(path.resolve(file)).href)) as { documents?: DocSpec[]; threads?: ThreadSpec[]; persons?: PersonSpec[] };
    docs.push(...(mod.documents ?? []));
    threads.push(...(mod.threads ?? []));
    // Personen, die nur in dieser Datei stehen, gelten für die Prüfung wie Personen aus world.ts.
    for (const p of mod.persons ?? []) if (!PERSONS.some((x) => x.id === p.id)) PERSONS.push(p);
  }

  const problems = validateLibrary(docs, threads);
  const warnings: string[] = [];
  const weekday = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay();
  const rows: string[] = [];
  const rendered = new Map<string, { data: Buffer; fileName: string }>();
  const tagCount = new Map<LibraryTag, number>();
  const count = (tags: LibraryTag[]) => tags.forEach((t) => tagCount.set(t, (tagCount.get(t) ?? 0) + 1));

  for (const doc of docs) {
    if (doc.date < "2025-01-01" || doc.date > "2026-09-30") problems.push(`${doc.id}: Datum ${doc.date} außerhalb Januar 2025 bis September 2026`);
    if ([0, 6].includes(weekday(doc.date))) warnings.push(`${doc.id}: Datum ${doc.date} ist ein Wochenende`);
    try {
      const { data } = await render(doc);
      const fileName = `${doc.fileName}.${LIBRARY_EXTENSION[doc.type]}`;
      rendered.set(doc.id, { data, fileName });
      const text = await extractText(data, fileName, LIBRARY_MIME[doc.type]);
      const tokens = estimateTokens(text);
      for (const k of doc.keywords) if (!text.includes(k)) problems.push(`${doc.id}: Pflichtbegriff „${k}“ fehlt im ausgelesenen Text`);
      problems.push(...fictionProblems(doc.id, text));
      if (doc.type === "powerpoint" && /<\/a:r><a:pPr/.test(data.toString("latin1"))) problems.push(`${doc.id}: ungültige Absatz-Eigenschaften in Folien`);
      const tags = [lengthTag(tokens), ...(doc.tags ?? [])];
      count(tags);
      rows.push(`${doc.type.padEnd(10)} ${String(tokens).padStart(6)}  ${tags.join(",").padEnd(40)} ${doc.id}`);
    } catch (err) {
      problems.push(`${doc.id}: lässt sich nicht erzeugen oder auslesen: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  let mailCount = 0;
  for (const thread of threads) {
    if (thread.date < "2025-01-01" || thread.date > "2026-09-30") problems.push(`${thread.id}: Datum ${thread.date} außerhalb Januar 2025 bis September 2026`);
    const texts: string[] = [];
    let maxTokens = 0;
    for (let i = 0; i < thread.mails.length; i++) {
      try {
        const attachments: MailAttachment[] = (thread.mails[i].attachments ?? []).flatMap((id) => {
          const doc = docs.find((d) => d.id === id);
          const file = rendered.get(id);
          if (!doc || !file) return [];
          return [{ id, title: doc.title, fileName: doc.fileName, type: doc.type, mime: LIBRARY_MIME[doc.type], data: file.data }];
        });
        const mail = renderMail(thread, i, attachments);
        const text = await extractText(mail.data, mail.fileName, LIBRARY_MIME.mail);
        texts.push(text);
        maxTokens = Math.max(maxTokens, estimateTokens(text));
        problems.push(...fictionProblems(mail.id, text));
        mailCount++;
      } catch (err) {
        problems.push(`${thread.id}-${i + 1}: lässt sich nicht erzeugen oder auslesen: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    const joined = texts.join("\n");
    for (const k of thread.keywords) if (!joined.includes(k)) problems.push(`${thread.id}: Pflichtbegriff „${k}“ fehlt in den Mails`);
    const tags = [lengthTag(maxTokens), ...(thread.tags ?? [])];
    count(tags);
    rows.push(`${"mail".padEnd(10)} ${String(maxTokens).padStart(6)}  ${tags.join(",").padEnd(40)} ${thread.id} (${thread.mails.length} Mails)`);
  }

  console.log(rows.join("\n"));
  const byType = (t: string) => docs.filter((d) => d.type === t).length;
  console.log(
    `\n${docs.length} Dokumente (Word ${byType("word")}, Excel ${byType("excel")}, PowerPoint ${byType("powerpoint")}), ${threads.length} Verläufe mit ${mailCount} Mails`,
  );
  console.log(`Merkmale: ${[...tagCount].map(([t, n]) => `${t} ${n}`).join(", ")}`);
  if (warnings.length) console.log(`\nHinweise:\n- ${warnings.join("\n- ")}`);
  if (problems.length) {
    console.log(`\nFEHLER (${problems.length}):\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log("\nKeine Fehler.");
}

if (process.argv[1]?.endsWith("check.ts")) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? (err.stack ?? err.message) : err);
    process.exit(1);
  });
}
