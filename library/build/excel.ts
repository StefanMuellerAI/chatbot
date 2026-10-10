// Excel-Dateien (.xlsx) mit echten Formeln, Zahlenformaten, fixierter Kopfzeile und Filter.
import ExcelJS from "exceljs";
import type { LibraryPreview, SheetPreview } from "@/lib/library/types";
import type { CellSpec, ExcelSpec, NumberFormat, SheetSpec } from "../types";
import { FICTION_NOTE } from "./constants";
import { formatNumber, dateShort } from "./format";
import { colLetters, evaluate, type Value } from "./formula";
import { org, person } from "./resolve";
import { normalizeOffice } from "./zip";

const NUMFMT: Record<NumberFormat, string> = {
  text: "@",
  int: "#,##0",
  dec: "#,##0.0",
  eur: '#,##0.00 "€"',
  eur0: '#,##0 "€"',
  pct: "0.0%",
  date: "dd.mm.yyyy",
  hours: '#,##0.0 "h"',
};

interface Layout {
  headerRow: number;
  firstRow: number;
  lastRow: number;
}

/** Zeile der Kopfzeile und Bereich der Datenzeilen (ohne Summenzeilen am Ende). */
export function sheetLayout(sheet: SheetSpec): Layout {
  const headerRow = sheet.title ? 4 : 1;
  const firstRow = headerRow + 1;
  let dataRows = sheet.rows.length;
  while (dataRows > 0) {
    const row = sheet.rows[dataRows - 1];
    if (Array.isArray(row) || !row.total) break;
    dataRows--;
  }
  return { headerRow, firstRow, lastRow: firstRow + Math.max(dataRows, 1) - 1 };
}

function cellsOf(row: SheetSpec["rows"][number]): CellSpec[] {
  return Array.isArray(row) ? row : row.cells;
}

function formula(f: string, row: number, layout: Layout): string {
  return f
    .replace(/\{r\}/g, String(row))
    .replace(/\{first\}/g, String(layout.firstRow))
    .replace(/\{last\}/g, String(layout.lastRow));
}

/** Berechnet alle Zellwerte der Arbeitsmappe (Formeln inklusive). */
export function computeWorkbook(spec: ExcelSpec): Map<string, Map<string, Value>> {
  const raw = new Map<string, Map<string, CellSpec>>();
  for (const sheet of spec.sheets) {
    const layout = sheetLayout(sheet);
    const cells = new Map<string, CellSpec>();
    sheet.rows.forEach((row, i) => {
      const r = layout.firstRow + i;
      cellsOf(row).forEach((c, j) => {
        if (c && typeof c === "object" && "f" in c) cells.set(`${colLetters(j + 1)}${r}`, { ...c, f: formula(c.f, r, layout) });
        else cells.set(`${colLetters(j + 1)}${r}`, c);
      });
    });
    raw.set(sheet.name, cells);
  }
  const values = new Map<string, Map<string, Value>>();
  const busy = new Set<string>();
  const get = (sheet: string, addr: string): Value => {
    const key = `${sheet}!${addr}`;
    const cached = values.get(sheet)?.get(addr);
    if (cached !== undefined) return cached;
    const c = raw.get(sheet)?.get(addr);
    let v: Value;
    if (c === undefined || c === null) v = null;
    else if (typeof c === "object" && "f" in c) {
      if (busy.has(key)) throw new Error(`Zirkelbezug in ${spec.id}: ${key}`);
      busy.add(key);
      v = evaluate(c.f, sheet, { cell: (s, col, row) => get(s, `${colLetters(col)}${row}`) });
      busy.delete(key);
    } else if (typeof c === "object" && "date" in c) v = c.date;
    else v = c;
    if (!values.has(sheet)) values.set(sheet, new Map());
    values.get(sheet)!.set(addr, v);
    return v;
  };
  for (const [sheet, cells] of raw) for (const addr of cells.keys()) get(sheet, addr);
  return values;
}

export async function renderExcel(spec: ExcelSpec): Promise<{ data: Buffer; preview: LibraryPreview }> {
  const o = org(spec.org);
  const author = person(spec.author);
  const color = `FF${o.color.slice(1).toUpperCase()}`;
  const values = computeWorkbook(spec);

  const wb = new ExcelJS.Workbook();
  const when = new Date(`${spec.date}T09:00:00Z`);
  wb.creator = `${author.first} ${author.last}`;
  wb.lastModifiedBy = `${author.first} ${author.last}`;
  wb.created = when;
  wb.modified = when;
  wb.title = spec.title;
  wb.subject = spec.kind;
  wb.description = FICTION_NOTE;
  wb.keywords = spec.keywords.join(", ");
  wb.company = o.name;

  const previews: SheetPreview[] = [];
  for (const sheet of spec.sheets) {
    const layout = sheetLayout(sheet);
    const ws = wb.addWorksheet(sheet.name, {
      properties: { tabColor: { argb: color } },
      views: [{ state: "frozen", ySplit: layout.headerRow, showGridLines: true }],
      pageSetup: { paperSize: 9, orientation: sheet.columns.length > 6 ? "landscape" : "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      headerFooter: { oddFooter: `&L&8${FICTION_NOTE}&R&8Seite &P von &N`, oddHeader: `&L&8${o.name}&R&8${spec.title}` },
    });
    ws.columns = sheet.columns.map((c) => ({ width: c.width ?? 14 }));

    if (sheet.title) {
      const t = ws.getCell(1, 1);
      t.value = sheet.title;
      t.font = { name: "Arial", size: 14, bold: true, color: { argb: color } };
      if (sheet.subtitle) {
        const s = ws.getCell(2, 1);
        s.value = sheet.subtitle;
        s.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF595959" } };
      }
    }

    const head = ws.getRow(layout.headerRow);
    sheet.columns.forEach((c, i) => {
      const cell = head.getCell(i + 1);
      cell.value = c.header;
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
      cell.alignment = { vertical: "middle", horizontal: c.fmt && c.fmt !== "text" ? "right" : "left", wrapText: true };
      cell.border = { bottom: { style: "thin", color: { argb: "FF808080" } } };
    });
    head.height = 30;

    const previewRows: SheetPreview["rows"] = [];
    sheet.rows.forEach((row, i) => {
      const r = layout.firstRow + i;
      const total = !Array.isArray(row) && Boolean(row.total);
      const display: string[] = [];
      cellsOf(row).forEach((c, j) => {
        const cell = ws.getCell(r, j + 1);
        const fmt: NumberFormat = (c && typeof c === "object" && "f" in c && c.fmt) || sheet.columns[j]?.fmt || "text";
        const value = values.get(sheet.name)?.get(`${colLetters(j + 1)}${r}`) ?? null;
        if (c && typeof c === "object" && "f" in c) {
          cell.value = {
            formula: formula(c.f, r, layout),
            result: typeof value === "boolean" ? (value ? 1 : 0) : (value ?? undefined),
          } as ExcelJS.CellFormulaValue;
        } else if (c && typeof c === "object" && "date" in c) {
          cell.value = new Date(`${c.date}T00:00:00Z`);
        } else {
          cell.value = c;
        }
        if (fmt !== "text") cell.numFmt = NUMFMT[fmt];
        cell.font = { name: "Arial", size: 10, bold: total };
        cell.alignment = { vertical: "top", wrapText: fmt === "text", horizontal: typeof value === "number" ? "right" : "left" };
        cell.border = total
          ? { top: { style: "thin", color: { argb: "FF404040" } }, bottom: { style: "double", color: { argb: "FF404040" } } }
          : { bottom: { style: "hair", color: { argb: "FFD9D9D9" } } };
        display.push(
          value === null
            ? ""
            : typeof value === "number"
              ? formatNumber(value, fmt)
              : fmt === "date" || (c && typeof c === "object" && "date" in c)
                ? dateShort(String(value))
                : String(value),
        );
      });
      if (i % 2 === 1 && !total) ws.getRow(r).eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F7F7" } }));
      previewRows.push({ cells: display, total: total || undefined });
    });

    if (sheet.rows.length > 3) {
      ws.autoFilter = { from: { row: layout.headerRow, column: 1 }, to: { row: layout.lastRow, column: sheet.columns.length } };
    }

    const notesStart = layout.firstRow + sheet.rows.length + 1;
    (sheet.notes ?? []).forEach((note, i) => {
      const cell = ws.getCell(notesStart + i, 1);
      cell.value = note;
      cell.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF595959" } };
    });

    previews.push({
      name: sheet.name,
      title: sheet.title,
      subtitle: sheet.subtitle,
      columns: sheet.columns.map((c) => ({ header: c.header, width: Math.round((c.width ?? 14) * 7.5), align: c.fmt && c.fmt !== "text" ? "right" : "left" })),
      rows: previewRows,
      notes: sheet.notes,
    });
  }

  const data = normalizeOffice(new Uint8Array(await wb.xlsx.writeBuffer()), spec.date);
  return { data, preview: { type: "excel", sheets: previews } };
}
