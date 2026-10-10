// Word-Dateien (.docx) im Erscheinungsbild der jeweiligen Verwaltung.
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TabStopType,
  TextRun,
  TextWrappingSide,
  TextWrappingType,
  VerticalPositionRelativeFrom,
  WidthType,
  type ParagraphChild,
} from "docx";
import type { Block, LibraryPreview } from "@/lib/library/types";
import type { WordSpec } from "../types";
import { dateShort, rich } from "./format";
import { brand, email, emblem, formalName, org, person, phone, unitChain } from "./resolve";
import { FICTION_NOTE } from "./constants";
import { normalizeOffice } from "./zip";

const FONT = "Arial";
const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const GRID = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };

const hex = (c: string) => c.replace("#", "").toUpperCase();

function runs(text: string, opts: { size?: number; color?: string; bold?: boolean } = {}): ParagraphChild[] {
  return rich(text).map((part) => new TextRun({ text: part.text, bold: opts.bold || part.bold, size: opts.size, color: opts.color, font: FONT }));
}

/** Kopfangaben wie im Briefbogen: Aktenzeichen, Datum, Bearbeitung, Kontakt. */
export function wordMeta(spec: WordSpec): [string, string][] {
  const author = person(spec.author);
  const o = org(spec.org);
  const units = unitChain(spec.org, spec.unit)
    .slice(-2)
    .map((u) => u.name);
  const meta: [string, string][] = [["Dienststelle", [o.name, ...units].join(", ")], ...(spec.meta ?? [])];
  if (!meta.some(([k]) => k === "Datum")) meta.push(["Datum", dateShort(spec.date)]);
  meta.push(["Bearbeitung", formalName(author)]);
  const tel = phone(author);
  if (tel) meta.push(["Telefon", tel]);
  meta.push(["E-Mail", email(author)]);
  return meta;
}

export async function renderWord(spec: WordSpec): Promise<{ data: Buffer; preview: LibraryPreview }> {
  const o = org(spec.org);
  const b = brand(spec.org, spec.unit);
  const color = hex(o.color);
  const meta = wordMeta(spec);
  const author = person(spec.author);

  let listInstance = 0;
  const body: (Paragraph | Table)[] = [];

  // Kopfangaben als randlose Tabelle rechts
  body.push(
    new Table({
      width: { size: 62, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.RIGHT,
      borders: NO_BORDERS,
      rows: meta.map(
        ([k, v]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                children: [new Paragraph({ spacing: { after: 0 }, children: runs(k, { size: 17, color: "595959" }) })],
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                children: [new Paragraph({ spacing: { after: 0 }, children: runs(v, { size: 17 }) })],
              }),
            ],
          }),
      ),
    }),
  );
  body.push(new Paragraph({ spacing: { after: 240 }, children: [] }));

  if (spec.recipient?.length) {
    for (const line of spec.recipient) body.push(new Paragraph({ spacing: { after: 0 }, children: runs(line) }));
    body.push(new Paragraph({ spacing: { after: 360 }, children: [] }));
  }

  body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: spec.kind, font: FONT })] }));
  if (spec.subject) body.push(new Paragraph({ spacing: { after: 240 }, children: runs(`Betreff: ${spec.subject}`, { bold: true }) }));

  for (const block of spec.blocks) body.push(...renderBlock(block, color, () => ++listInstance));

  const firstHeader = new Header({
    children: [
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new ImageRun({
            type: "png",
            data: emblem(spec.org),
            transformation: { width: 50, height: 60 },
            altText: { name: "Signet", description: `Signet ${o.name}`, title: "Signet" },
            floating: {
              horizontalPosition: { relative: HorizontalPositionRelativeFrom.MARGIN, align: HorizontalPositionAlign.RIGHT },
              verticalPosition: { relative: VerticalPositionRelativeFrom.PARAGRAPH, offset: 0 },
              wrap: { type: TextWrappingType.SQUARE, side: TextWrappingSide.LEFT },
            },
          }),
          new TextRun({ text: o.name, bold: true, size: 30, color, font: FONT }),
        ],
      }),
      ...b.lines.map((l) => new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: l, size: 18, color: "404040", font: FONT })] })),
      new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color, space: 4 } }, spacing: { after: 120 }, children: [] }),
    ],
  });

  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF", space: 4 } },
        children: [new TextRun({ text: `${o.name} · ${spec.kind}`, size: 16, color: "7F7F7F", font: FONT })],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        style: "Fusszeile",
        tabStops: [{ type: TabStopType.RIGHT, position: 9300 }],
        children: [
          new TextRun({ text: FICTION_NOTE, size: 14, color: "A6A6A6" }),
          new TextRun({ children: ["\tSeite ", PageNumber.CURRENT, " von ", PageNumber.TOTAL_PAGES] }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: `${author.first} ${author.last}`,
    lastModifiedBy: `${author.first} ${author.last}`,
    title: spec.title,
    subject: spec.kind,
    description: FICTION_NOTE,
    keywords: spec.keywords.join(", "),
    styles: {
      default: { document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { after: 120, line: 276 } } } },
      paragraphStyles: [
        heading("Heading1", "Heading 1", 32, color, 0),
        heading("Heading2", "Heading 2", 26, color, 240),
        heading("Heading3", "Heading 3", 23, "262626", 200),
        heading("Heading4", "Heading 4", 22, "404040", 160),
        { id: "Fusszeile", name: "Fußzeile", basedOn: "Normal", run: { font: FONT, size: 16, color: "7F7F7F" }, paragraph: { spacing: { after: 0 } } },
      ],
    },
    numbering: {
      config: [
        {
          reference: "nummern",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 567, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          titlePage: true,
          page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1200, left: 1418, right: 1134, header: 600, footer: 500 } },
        },
        headers: { first: firstHeader, default: header },
        footers: { first: footer, default: footer },
        children: body,
      },
    ],
  });

  const data = normalizeOffice(await Packer.toBuffer(doc), spec.date);
  return {
    data,
    preview: { type: "word", brand: b, kind: spec.kind, meta, recipient: spec.recipient, subject: spec.subject, blocks: spec.blocks },
  };
}

function heading(id: string, name: string, size: number, color: string, before: number) {
  return {
    id,
    name,
    basedOn: "Normal",
    next: "Normal",
    quickFormat: true,
    run: { font: FONT, size, bold: true, color },
    paragraph: { spacing: { before, after: 120 }, keepNext: true },
  };
}

function renderBlock(block: Block, color: string, nextList: () => number): (Paragraph | Table)[] {
  switch (block.t) {
    case "h1":
      return [new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: block.text, font: FONT })] })];
    case "h2":
      return [new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: block.text, font: FONT })] })];
    case "h3":
      return [new Paragraph({ heading: HeadingLevel.HEADING_4, children: [new TextRun({ text: block.text, font: FONT })] })];
    case "p":
      return [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: runs(block.text) })];
    case "ul":
      return block.items.map((item) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: runs(item) }));
    case "ol": {
      const instance = nextList();
      return block.items.map(
        (item) => new Paragraph({ numbering: { reference: "nummern", level: 0, instance }, spacing: { after: 60 }, children: runs(item) }),
      );
    }
    case "note":
      return [
        new Paragraph({
          shading: { type: ShadingType.CLEAR, fill: "F2F2F2", color: "auto" },
          border: { left: { style: BorderStyle.SINGLE, size: 24, color, space: 8 } },
          spacing: { before: 120, after: 200 },
          children: runs(block.text, { size: 20 }),
        }),
      ];
    case "table": {
      const total = block.widths?.reduce((s, w) => s + w, 0) ?? block.header.length;
      const width = (i: number) => Math.round(((block.widths?.[i] ?? 1) / total) * 100);
      const cell = (text: string, i: number, head: boolean) =>
        new TableCell({
          width: { size: width(i), type: WidthType.PERCENTAGE },
          shading: head ? { type: ShadingType.CLEAR, fill: color, color: "auto" } : undefined,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ spacing: { after: 0 }, children: runs(text, { size: 19, color: head ? "FFFFFF" : undefined, bold: head }) })],
        });
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: GRID, bottom: GRID, left: GRID, right: GRID, insideHorizontal: GRID, insideVertical: GRID },
          rows: [
            new TableRow({ tableHeader: true, children: block.header.map((h, i) => cell(h, i, true)) }),
            ...block.rows.map((row) => new TableRow({ children: row.map((c, i) => cell(c, i, false)) })),
          ],
        }),
        new Paragraph({ spacing: { after: 120 }, children: [] }),
      ];
    }
    case "signature":
      return [
        new Paragraph({ spacing: { before: 360, after: 0 }, children: [] }),
        ...block.lines.map((line) => new Paragraph({ spacing: { after: 0 }, children: runs(line) })),
      ];
    case "pagebreak":
      return [new Paragraph({ children: [new PageBreak()] })];
  }
}
