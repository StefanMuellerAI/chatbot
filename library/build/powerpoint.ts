// PowerPoint-Dateien (.pptx) mit Folienmaster im Erscheinungsbild der Verwaltung.
import PptxGenJS from "pptxgenjs";
import type { LibraryPreview, RichText, Slide, SlideBullet } from "@/lib/library/types";
import type { PowerPointSpec } from "../types";
import { FICTION_NOTE } from "./constants";
import { dateLong, rich } from "./format";
import { brand, emblem, org, person, unitChain } from "./resolve";
import { normalizeOffice } from "./zip";

const FONT = "Arial";
const GRAY = "595959";

type TextObj = PptxGenJS.TextProps;

function paragraph(text: RichText, opts: PptxGenJS.TextPropsOptions): TextObj[] {
  const parts = rich(text);
  return parts.map((p, i) => ({
    text: p.text,
    options: {
      ...(i === 0 ? opts : {}),
      bold: p.bold || opts.bold,
      fontSize: opts.fontSize,
      color: opts.color,
      fontFace: FONT,
      breakLine: i === parts.length - 1,
    },
  }));
}

function bulletList(items: SlideBullet[], size: number): TextObj[] {
  return items.flatMap((item) => {
    const main = typeof item === "string" ? item : item.text;
    const sub = typeof item === "string" ? [] : item.sub;
    return [
      ...paragraph(main, { bullet: { indent: 18 }, indentLevel: 0, fontSize: size, color: "262626", paraSpaceAfter: 8 }),
      ...sub.flatMap((s) => paragraph(s, { bullet: { indent: 18 }, indentLevel: 1, fontSize: size - 4, color: GRAY, paraSpaceAfter: 4 })),
    ];
  });
}

export async function renderPowerPoint(spec: PowerPointSpec): Promise<{ data: Buffer; preview: LibraryPreview }> {
  const o = org(spec.org);
  const author = person(spec.author);
  const color = o.color.slice(1).toUpperCase();
  const accent = o.accent.slice(1).toUpperCase();
  const logo = `image/png;base64,${emblem(spec.org).toString("base64")}`;
  const unitName = unitChain(spec.org, spec.unit).at(-1)!.name;

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = `${author.first} ${author.last}`;
  pptx.company = o.name;
  pptx.title = spec.title;
  pptx.subject = FICTION_NOTE;

  pptx.defineSlideMaster({
    title: "TITEL",
    background: { color },
    objects: [
      { image: { x: 0.7, y: 0.6, w: 0.9, h: 1.08, data: logo } },
      { rect: { x: 0.7, y: 4.55, w: 2.2, h: 0.06, fill: { color: accent } } },
      { text: { text: `${o.name} · ${FICTION_NOTE}`, options: { x: 0.7, y: 6.85, w: 11, h: 0.3, fontSize: 9, color: "D9D9D9", fontFace: FONT } } },
    ],
  });
  pptx.defineSlideMaster({
    title: "ABSCHNITT",
    background: { color: "F4F4F4" },
    objects: [{ rect: { x: 0, y: 0, w: 0.35, h: 7.5, fill: { color } } }, { image: { x: 12.3, y: 0.3, w: 0.55, h: 0.66, data: logo } }],
    slideNumber: { x: 12.4, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: GRAY, fontFace: FONT },
  });
  pptx.defineSlideMaster({
    title: "INHALT",
    background: { color: "FFFFFF" },
    objects: [
      { rect: { x: 0, y: 0, w: 13.333, h: 0.09, fill: { color } } },
      { image: { x: 12.35, y: 0.28, w: 0.5, h: 0.6, data: logo } },
      { line: { x: 0.6, y: 6.85, w: 12.1, h: 0, line: { color: "D9D9D9", width: 0.75 } } },
      {
        text: {
          text: `${o.name} · ${unitName} · ${FICTION_NOTE}`,
          options: { x: 0.6, y: 6.92, w: 10.5, h: 0.3, fontSize: 9, color: "8C8C8C", fontFace: FONT },
        },
      },
      {
        placeholder: {
          options: {
            name: "titel",
            type: "title",
            x: 0.6,
            y: 0.3,
            w: 11.5,
            h: 0.85,
            fontSize: 28,
            bold: true,
            color,
            fontFace: FONT,
            align: "left",
            valign: "middle",
          },
          text: "",
        },
      },
    ],
    slideNumber: { x: 12.4, y: 6.92, w: 0.6, h: 0.3, fontSize: 10, color: GRAY, fontFace: FONT },
  });

  for (const s of spec.slides) addSlide(pptx, s, { color, accent, orgName: o.name, unitName, date: spec.date, author: `${author.first} ${author.last}` });

  const data = normalizeOffice(new Uint8Array((await pptx.write({ outputType: "nodebuffer" })) as Buffer), spec.date);
  return { data, preview: { type: "powerpoint", brand: brand(spec.org, spec.unit), slides: spec.slides } };
}

function addSlide(pptx: PptxGenJS, s: Slide, ctx: { color: string; accent: string; orgName: string; unitName: string; date: string; author: string }) {
  const content = { x: 0.6, y: 1.35, w: 12.1, h: 5.3 };
  switch (s.t) {
    case "title": {
      const slide = pptx.addSlide({ masterName: "TITEL" });
      slide.addText(s.title, { x: 0.7, y: 2.2, w: 11.5, h: 2.2, fontSize: 38, bold: true, color: "FFFFFF", fontFace: FONT, valign: "bottom" });
      if (s.subtitle) slide.addText(s.subtitle, { x: 0.7, y: 4.8, w: 11.5, h: 0.8, fontSize: 20, color: "FFFFFF", fontFace: FONT, valign: "top" });
      slide.addText(`${ctx.unitName} · ${dateLong(ctx.date)}`, { x: 0.7, y: 5.7, w: 11.5, h: 0.5, fontSize: 14, color: "E6E6E6", fontFace: FONT });
      if (s.notes) slide.addNotes(s.notes);
      return;
    }
    case "section": {
      const slide = pptx.addSlide({ masterName: "ABSCHNITT" });
      slide.addText(s.title, { x: 1.0, y: 2.6, w: 11, h: 1.2, fontSize: 34, bold: true, color: ctx.color, fontFace: FONT });
      if (s.subtitle) slide.addText(s.subtitle, { x: 1.0, y: 3.8, w: 11, h: 0.8, fontSize: 18, color: GRAY, fontFace: FONT });
      if (s.notes) slide.addNotes(s.notes);
      return;
    }
    case "end": {
      const slide = pptx.addSlide({ masterName: "TITEL" });
      slide.addText(s.title, { x: 0.7, y: 2.4, w: 11.5, h: 2.0, fontSize: 34, bold: true, color: "FFFFFF", fontFace: FONT, valign: "bottom" });
      if (s.lines?.length) {
        slide.addText(
          s.lines.flatMap((l) => paragraph(l, { fontSize: 16, color: "FFFFFF" })),
          { x: 0.7, y: 4.8, w: 11.5, h: 1.8, valign: "top" },
        );
      }
      if (s.notes) slide.addNotes(s.notes);
      return;
    }
  }

  const slide = pptx.addSlide({ masterName: "INHALT" });
  slide.addText(s.title, { placeholder: "titel" });
  switch (s.t) {
    case "bullets":
      slide.addText(bulletList(s.bullets, 20), { ...content, valign: "top", fontFace: FONT });
      break;
    case "twocol": {
      const col = (x: number, part: { heading: string; bullets: RichText[] }) =>
        slide.addText([...paragraph(part.heading, { bold: true, fontSize: 20, color: ctx.color, paraSpaceAfter: 10 }), ...bulletList(part.bullets, 18)], {
          x,
          y: content.y,
          w: 5.85,
          h: content.h,
          valign: "top",
          fontFace: FONT,
        });
      col(0.6, s.left);
      col(6.85, s.right);
      slide.addShape(pptx.ShapeType.line, { x: 6.67, y: 1.5, w: 0, h: 4.9, line: { color: "D9D9D9", width: 1 } });
      break;
    }
    case "table": {
      const rows: PptxGenJS.TableRow[] = [
        s.header.map((h) => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: ctx.color } } })),
        ...s.rows.map((r, i) => r.map((c) => ({ text: c, options: { fill: { color: i % 2 ? "F2F2F2" : "FFFFFF" } } }))),
      ];
      slide.addTable(rows, {
        x: content.x,
        y: content.y + 0.1,
        w: content.w,
        rowH: 0.48,
        fontSize: 15,
        fontFace: FONT,
        color: "262626",
        border: { type: "solid", pt: 0.5, color: "BFBFBF" },
        valign: "middle",
        margin: 0.08,
        autoPage: false,
      });
      break;
    }
    case "chart": {
      const type = s.chart.type === "bar" ? pptx.ChartType.bar : s.chart.type === "line" ? pptx.ChartType.line : pptx.ChartType.pie;
      const data = s.chart.series.map((series) => ({ name: series.name, labels: s.chart.categories, values: series.values }));
      const pie = s.chart.type === "pie";
      const decimals = s.chart.series.some((series) => series.values.some((v) => !Number.isInteger(v)));
      const valueFormat = decimals ? "#,##0.0" : "#,##0";
      const palette = [ctx.color, ctx.accent, "7F7F7F", "BFBFBF", "A5A5A5", "D9D9D9"];
      slide.addChart(type, data, {
        x: content.x,
        y: content.y,
        w: content.w,
        h: s.caption ? 4.7 : 5.2,
        // Eine Datenreihe: alle Balken in der Hausfarbe; Kreis: eine Farbe je Segment.
        chartColors: pie ? palette : s.chart.series.length === 1 ? [ctx.color] : palette.slice(0, s.chart.series.length),
        showLegend: pie || s.chart.series.length > 1,
        legendPos: "b",
        legendFontSize: 12,
        legendFontFace: FONT,
        showValue: !pie,
        showPercent: pie,
        dataLabelFontSize: 11,
        dataLabelFormatCode: pie ? "0%" : valueFormat,
        catAxisLabelFontSize: 12,
        catAxisLabelFontFace: FONT,
        valAxisLabelFontSize: 11,
        valAxisLabelFormatCode: valueFormat,
        showValAxisTitle: Boolean(s.chart.unit) && !pie,
        valAxisTitle: s.chart.unit,
        valAxisTitleFontSize: 11,
        barGapWidthPct: 70,
        lineDataSymbol: "circle",
        lineSize: 2,
      });
      if (s.caption) slide.addText(s.caption, { x: content.x, y: 6.15, w: content.w, h: 0.5, fontSize: 12, italic: true, color: GRAY, fontFace: FONT });
      break;
    }
  }
  if (s.notes) slide.addNotes(s.notes);
}
