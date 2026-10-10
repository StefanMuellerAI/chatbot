// Macht Office-Dateien reproduzierbar: feste Zeitstempel, pro Datei neu gezählte IDs, neu gepackt.
// Die Bibliotheken nutzen prozessweite Zähler (Bild-IDs in docx, Diagramm-Nummern in pptxgenjs) und
// die aktuelle Uhrzeit. Ohne diesen Schritt hätte jede Datei bei jedem Build eine andere Prüfsumme.
import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from "fflate";

const FIXED_MTIME = new Date("2025-01-01T12:00:00Z");

export function normalizeOffice(data: Uint8Array, isoDate: string): Buffer {
  const files = unzipSync(data);
  const timestamp = `${isoDate}T09:00:00Z`;
  const out: Record<string, Uint8Array> = {};

  // Diagramme und eingebettete Tabellen fortlaufend ab 1 nummerieren.
  const chartNumbers = [...new Set(Object.keys(files).flatMap((n) => /^ppt\/charts\/chart(\d+)\.xml$/.exec(n)?.[1] ?? []))].map(Number).sort((a, b) => a - b);
  const chartMap = new Map(chartNumbers.map((n, i) => [n, i + 1]));
  const renameChart = (s: string) =>
    s
      .replace(/chart(\d+)\.xml/g, (m, n) => (chartMap.has(Number(n)) ? `chart${chartMap.get(Number(n))}.xml` : m))
      .replace(/Microsoft_Excel_Worksheet(\d+)\.xlsx/g, (m, n) => (chartMap.has(Number(n)) ? `Microsoft_Excel_Worksheet${chartMap.get(Number(n))}.xlsx` : m));

  for (const [name, content] of Object.entries(files)) {
    const target = renameChart(name);
    if (/\.xlsx$/.test(name)) {
      out[target] = normalizeOffice(content, isoDate);
      continue;
    }
    if (!/\.(xml|rels)$/.test(name)) {
      out[target] = content;
      continue;
    }
    let xml = strFromU8(content);
    if (chartMap.size) xml = renameChart(xml);
    if (name === "docProps/core.xml") {
      xml = xml
        .replace(/(<dcterms:created[^>]*>)[^<]*(<\/dcterms:created>)/, `$1${timestamp}$2`)
        .replace(/(<dcterms:modified[^>]*>)[^<]*(<\/dcterms:modified>)/, `$1${timestamp}$2`);
    }
    if (/^ppt\/slides\/slide\d+\.xml$/.test(name)) {
      // pptxgenjs schreibt bei mehreren Textläufen je Absatz weitere <a:pPr> mitten in den Absatz.
      // Das ist ungültig (PowerPoint bietet dann eine Reparatur an) – nur das erste pPr bleibt.
      xml = xml.replace(/(<\/a:r>)<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, "$1");
    }
    if (name.startsWith("word/")) {
      let id = 0;
      xml = xml.replace(/<wp:docPr id="\d+"/g, () => `<wp:docPr id="${++id}"`);
    }
    out[target] = strToU8(xml);
  }

  // [Content_Types].xml zuerst, danach in stabiler Reihenfolge.
  const names = Object.keys(out).sort((a, b) => (a === "[Content_Types].xml" ? -1 : b === "[Content_Types].xml" ? 1 : a < b ? -1 : a > b ? 1 : 0));
  const zippable: Zippable = {};
  for (const n of names) zippable[n] = [out[n], { mtime: FIXED_MTIME, level: 6 }];
  return Buffer.from(zipSync(zippable));
}
