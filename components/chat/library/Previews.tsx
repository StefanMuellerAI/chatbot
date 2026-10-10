"use client";
// Vorschauen für den Fundus: Word-Seite, Excel-Tabelle, Folien und E-Mail-Verlauf.
import { FileSpreadsheet, FileText, Mail, Paperclip, Presentation } from "lucide-react";
import { Fragment, useState } from "react";
import type { Block, Brand, ChartSpec, LibraryFileType, LibraryPreview, MailPreview, SheetPreview, Slide, SlideBullet } from "@/lib/library/types";
import { cn } from "@/components/ui/cn";

export const TYPE_STYLE: Record<LibraryFileType, { label: string; color: string; Icon: typeof FileText }> = {
  word: { label: "Word", color: "#2b579a", Icon: FileText },
  excel: { label: "Excel", color: "#217346", Icon: FileSpreadsheet },
  powerpoint: { label: "PowerPoint", color: "#c43e1c", Icon: Presentation },
  mail: { label: "E-Mail", color: "#0f6cbd", Icon: Mail },
};

const FICTION = "Fiktives Übungsdokument – Freebie-Fundus";

/** Text mit **fett**. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*[^*]+\*\*)/g)
        .map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

export function PreviewView({ preview, orgColor }: { preview: LibraryPreview; orgColor: string }) {
  switch (preview.type) {
    case "word":
      return <WordPreview preview={preview} />;
    case "excel":
      return <SheetsPreview sheets={preview.sheets} color={orgColor} />;
    case "powerpoint":
      return <SlidesPreview brand={preview.brand} slides={preview.slides} />;
    case "thread":
      return null;
  }
}

// ---------------------------------------------------------------- Word

function WordPreview({ preview }: { preview: Extract<LibraryPreview, { type: "word" }> }) {
  const { brand } = preview;
  return (
    <div
      data-testid="vorschau-word"
      className="mx-auto max-w-[720px] rounded-sm bg-white px-6 py-7 text-[13px] leading-relaxed text-[#1f1f1f] shadow-md ring-1 ring-black/5 sm:px-10"
    >
      <div className="flex items-start justify-between gap-4 border-b-2 pb-3" style={{ borderColor: brand.color }}>
        <div>
          <p className="text-lg font-bold" style={{ color: brand.color }}>
            {brand.orgName}
          </p>
          {brand.lines.map((l) => (
            <p key={l} className="text-[11px] text-[#404040]">
              {l}
            </p>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.emblem} alt={`Signet ${brand.orgName}`} className="h-12 w-auto shrink-0" />
      </div>
      <dl className="mt-4 ml-auto grid w-fit max-w-full grid-cols-[auto_minmax(0,1fr)] gap-x-4 text-[11px]">
        {preview.meta.map(([k, v]) => (
          <Fragment key={k}>
            <dt className="text-[#595959]">{k}</dt>
            <dd className="[overflow-wrap:anywhere]">{v}</dd>
          </Fragment>
        ))}
      </dl>
      {preview.recipient?.length ? (
        <div className="mt-4">
          {preview.recipient.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      ) : null}
      <p className="mt-5 text-xl font-bold" style={{ color: brand.color }}>
        {preview.kind}
      </p>
      {preview.subject && <p className="mt-1 font-bold">Betreff: {preview.subject}</p>}
      <div className="mt-3 space-y-2">
        {preview.blocks.map((b, i) => (
          <WordBlock key={i} block={b} color={brand.color} />
        ))}
      </div>
      <p className="mt-8 border-t border-[#e5e5e5] pt-2 text-[10px] text-[#737373]">{FICTION}</p>
    </div>
  );
}

function WordBlock({ block, color }: { block: Block; color: string }) {
  switch (block.t) {
    case "h1":
      return (
        <p className="pt-2 text-[15px] font-bold" style={{ color }}>
          {block.text}
        </p>
      );
    case "h2":
      return <p className="pt-1 font-bold text-[#262626]">{block.text}</p>;
    case "h3":
      return <p className="font-semibold text-[#404040]">{block.text}</p>;
    case "p":
      return (
        <p className="text-justify">
          <Rich text={block.text} />
        </p>
      );
    case "ul":
    case "ol": {
      const List = block.t === "ul" ? "ul" : "ol";
      return (
        <List className={cn("space-y-1 pl-6", block.t === "ul" ? "list-disc" : "list-decimal")}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Rich text={item} />
            </li>
          ))}
        </List>
      );
    }
    case "note":
      return (
        <p className="border-l-4 bg-[#f2f2f2] px-3 py-2 text-[12px]" style={{ borderColor: color }}>
          <Rich text={block.text} />
        </p>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {block.header.map((h) => (
                  <th key={h} className="border border-[#bfbfbf] px-2 py-1 text-left font-bold text-white" style={{ background: color }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((c, j) => (
                    <td key={j} className="border border-[#bfbfbf] px-2 py-1 align-top">
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "signature":
      return (
        <div className="pt-4">
          {block.lines.map((l, i) => (
            <p key={i} className="min-h-4">
              {l}
            </p>
          ))}
        </div>
      );
    case "pagebreak":
      return <hr className="my-4 border-dashed border-[#bfbfbf]" />;
  }
}

// ---------------------------------------------------------------- Excel

function SheetsPreview({ sheets, color }: { sheets: SheetPreview[]; color: string }) {
  const [index, setIndex] = useState(0);
  const sheet = sheets[Math.min(index, sheets.length - 1)];
  return (
    <div data-testid="vorschau-excel" className="overflow-hidden rounded-md bg-white text-[12px] text-[#1f1f1f] shadow-md ring-1 ring-black/5">
      {sheet.title && (
        <div className="px-3 pt-3">
          <p className="text-[14px] font-bold" style={{ color }}>
            {sheet.title}
          </p>
          {sheet.subtitle && <p className="text-[11px] text-[#595959] italic">{sheet.subtitle}</p>}
        </div>
      )}
      {/* Scrollbar per Tastatur erreichbar (Pfeiltasten scrollen die Tabelle). */}
      <div className="mt-2 max-h-[420px] overflow-auto focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0} role="region" aria-label={`Tabellenblatt ${sheet.name}`}>
        <table className="border-collapse">
          <thead className="sticky top-0">
            <tr>
              {sheet.columns.map((c) => (
                <th
                  key={c.header}
                  scope="col"
                  className={cn("border border-white/30 px-2 py-1.5 font-bold text-white", c.align === "right" ? "text-right" : "text-left")}
                  style={{ background: color, minWidth: Math.min(c.width, 320) }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, i) => (
              <tr key={i} className={cn(row.total ? "border-t-2 border-[#404040] font-bold" : i % 2 ? "bg-[#f7f7f7]" : "")}>
                {sheet.columns.map((c, j) => (
                  <td key={j} className={cn("border-b border-[#e6e6e6] px-2 py-1 whitespace-nowrap", c.align === "right" && "text-right tabular-nums")}>
                    {row.cells[j] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {sheet.notes?.length ? (
          <div className="space-y-1 px-3 py-2 text-[11px] text-[#595959] italic">
            {sheet.notes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1 border-t border-[#d9d9d9] bg-[#f3f3f3] px-2 py-1.5" role="group" aria-label="Tabellenblätter">
        {sheets.map((s, i) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={cn("rounded px-2.5 py-1 text-[12px]", i === index ? "bg-white font-semibold shadow-sm" : "text-[#404040] hover:bg-white/70")}
            style={i === index ? { color } : undefined}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- PowerPoint

function SlidesPreview({ brand, slides }: { brand: Brand; slides: Slide[] }) {
  return (
    <ol data-testid="vorschau-powerpoint" className="space-y-4" aria-label="Folien">
      {slides.map((s, i) => (
        <li key={i}>
          <div className="mb-1 text-xs text-muted">Folie {i + 1}</div>
          <SlideCard slide={s} brand={brand} number={i + 1} />
          {s.notes && (
            <details className="mt-1 text-xs text-muted">
              <summary className="cursor-pointer select-none">Sprechernotizen</summary>
              <p className="mt-1 rounded-lg bg-surface px-3 py-2 text-text">{s.notes}</p>
            </details>
          )}
        </li>
      ))}
    </ol>
  );
}

function bulletParts(b: SlideBullet): { text: string; sub: string[] } {
  return typeof b === "string" ? { text: b, sub: [] } : { text: b.text, sub: b.sub };
}

function SlideCard({ slide, brand, number }: { slide: Slide; brand: Brand; number: number }) {
  const dark = slide.t === "title" || slide.t === "end";
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-md text-[#262626] shadow-md ring-1 ring-black/10 @container"
      style={{ background: dark ? brand.color : slide.t === "section" ? "#f4f4f4" : "#ffffff" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={brand.emblem} alt="" className={cn("absolute", dark ? "top-[7%] left-[5%] h-[15%]" : "top-[4%] right-[3%] h-[9%]")} />
      {!dark && slide.t !== "section" && <div className="absolute inset-x-0 top-0 h-[1.2%]" style={{ background: brand.color }} />}
      {slide.t === "section" && <div className="absolute inset-y-0 left-0 w-[2.6%]" style={{ background: brand.color }} />}
      <div className="absolute inset-0 flex flex-col px-[5%] pt-[4%] pb-[7%] text-[2.2cqw] leading-snug">
        {dark ? (
          <div className="mt-auto mb-[6%] text-white">
            <p className="text-[4.6cqw] leading-tight font-bold">{slide.title}</p>
            <div className="my-[2%] h-[0.5cqw] w-[16%]" style={{ background: brand.accent }} />
            {slide.t === "title" && slide.subtitle && <p className="text-[2.4cqw]">{slide.subtitle}</p>}
            {slide.t === "end" &&
              slide.lines?.map((l) => (
                <p key={l} className="text-[2cqw]">
                  {l}
                </p>
              ))}
          </div>
        ) : slide.t === "section" ? (
          <div className="my-auto pl-[4%]">
            <p className="text-[4cqw] font-bold" style={{ color: brand.color }}>
              {slide.title}
            </p>
            {slide.subtitle && <p className="text-[2.2cqw] text-[#595959]">{slide.subtitle}</p>}
          </div>
        ) : (
          <>
            <p className="mb-[2.5%] pr-[10%] text-[3.3cqw] leading-tight font-bold" style={{ color: brand.color }}>
              {slide.title}
            </p>
            <SlideBody slide={slide} brand={brand} />
          </>
        )}
      </div>
      {!dark && <span className="absolute right-[3%] bottom-[2.5%] text-[1.4cqw] text-[#737373]">{number}</span>}
    </div>
  );
}

function SlideBody({ slide, brand }: { slide: Slide; brand: Brand }) {
  switch (slide.t) {
    case "bullets":
      return <BulletList bullets={slide.bullets} />;
    case "twocol":
      return (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-[4%]">
          {[slide.left, slide.right].map((col) => (
            <div key={col.heading}>
              <p className="mb-[3%] font-bold" style={{ color: brand.color }}>
                {col.heading}
              </p>
              <BulletList bullets={col.bullets} />
            </div>
          ))}
        </div>
      );
    case "table":
      return (
        <table className="w-full border-collapse text-[1.8cqw]">
          <thead>
            <tr>
              {slide.header.map((h) => (
                <th key={h} className="border border-[#bfbfbf] px-[1%] py-[0.6%] text-left text-white" style={{ background: brand.color }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slide.rows.map((r, i) => (
              <tr key={i} className={i % 2 ? "bg-[#f2f2f2]" : ""}>
                {r.map((c, j) => (
                  <td key={j} className="border border-[#bfbfbf] px-[1%] py-[0.6%]">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "chart":
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          <MiniChart chart={slide.chart} title={slide.title} colors={[brand.color, brand.accent, "#7f7f7f", "#bfbfbf", "#a5a5a5"]} />
          {slide.caption && <p className="mt-[1%] text-[1.6cqw] text-[#595959] italic">{slide.caption}</p>}
        </div>
      );
    default:
      return null;
  }
}

function BulletList({ bullets }: { bullets: SlideBullet[] }) {
  return (
    <ul className="space-y-[1.2%] pl-[3%]">
      {bullets.map((b, i) => {
        const { text, sub } = bulletParts(b);
        return (
          <li key={i} className="list-disc">
            <Rich text={text} />
            {sub.length > 0 && (
              <ul className="mt-[0.5%] pl-[4%] text-[1.8cqw] text-[#595959]">
                {sub.map((s) => (
                  <li key={s} className="list-[circle]">
                    <Rich text={s} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Kleines SVG-Diagramm (Säulen, Linien, Kreis) für die Folienvorschau. */
export function MiniChart({ chart, title, colors }: { chart: ChartSpec; title: string; colors: string[] }) {
  const W = 400;
  const H = 170;
  const label = `Diagramm: ${title}`;
  if (chart.type === "pie") {
    const values = chart.series[0]?.values ?? [];
    const total = values.reduce((s, v) => s + v, 0) || 1;
    // Start- und Endwinkel je Segment (oben beginnend, im Uhrzeigersinn).
    const ends = values.map((_, i) => -Math.PI / 2 + (values.slice(0, i + 1).reduce((s, v) => s + v, 0) / total) * Math.PI * 2);
    const cx = 85;
    const cy = 85;
    const r = 72;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full max-h-full w-full" role="img" aria-label={label}>
        {values.map((_, i) => {
          const start = i === 0 ? -Math.PI / 2 : ends[i - 1];
          const angle = ends[i];
          const large = angle - start > Math.PI ? 1 : 0;
          const d = `M ${cx} ${cy} L ${cx + r * Math.cos(start)} ${cy + r * Math.sin(start)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(angle)} ${cy + r * Math.sin(angle)} Z`;
          return <path key={i} d={d} fill={colors[i % colors.length]} stroke="#fff" strokeWidth={1} />;
        })}
        {chart.categories.map((c, i) => (
          <g key={c} transform={`translate(190 ${18 + i * 22})`}>
            <rect width={10} height={10} y={-9} fill={colors[i % colors.length]} />
            <text x={16} fontSize={11} fill="#404040">
              {c}: {Math.round((values[i] / total) * 100)} %
            </text>
          </g>
        ))}
      </svg>
    );
  }
  const all = chart.series.flatMap((s) => s.values);
  const max = Math.max(...all, 1) * 1.1;
  const left = 34;
  const bottom = H - 22;
  const plotW = W - left - 6;
  const step = plotW / Math.max(chart.categories.length, 1);
  const y = (v: number) => bottom - (v / max) * (bottom - 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full max-h-full w-full" role="img" aria-label={label}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={left} x2={W - 6} y1={y((max * f) / 1.1)} y2={y((max * f) / 1.1)} stroke="#e5e5e5" />
          <text x={left - 4} y={y((max * f) / 1.1) + 3} fontSize={9} textAnchor="end" fill="#737373">
            {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format((max * f) / 1.1)}
          </text>
        </g>
      ))}
      {chart.type === "bar"
        ? chart.series.map((s, si) =>
            s.values.map((v, i) => {
              const bw = (step * 0.7) / chart.series.length;
              const x = left + i * step + step * 0.15 + si * bw;
              return <rect key={`${si}-${i}`} x={x} y={y(v)} width={bw - 1} height={bottom - y(v)} fill={colors[si % colors.length]} />;
            }),
          )
        : chart.series.map((s, si) => (
            <polyline
              key={si}
              fill="none"
              stroke={colors[si % colors.length]}
              strokeWidth={2}
              points={s.values.map((v, i) => `${left + i * step + step / 2},${y(v)}`).join(" ")}
            />
          ))}
      {chart.categories.map((c, i) => (
        <text key={c} x={left + i * step + step / 2} y={H - 8} fontSize={9} textAnchor="middle" fill="#595959">
          {c.length > 16 ? `${c.slice(0, 15)}…` : c}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------- E-Mail

const mailDate = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export function formatMailDate(iso: string): string {
  return mailDate.format(new Date(iso));
}

export function MailCard({ mail, attached, onAttach }: { mail: MailPreview; attached: boolean; onAttach: () => void }) {
  const [body, signature] = splitSignature(mail.body);
  const people = (list: MailPreview["to"]) => list.map((p) => `${p.name} <${p.email}>`).join("; ");
  return (
    <article aria-label={`E-Mail von ${mail.from.name}, ${formatMailDate(mail.date)}`} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{mail.from.name}</p>
          <p className="truncate text-xs text-muted">{mail.from.email}</p>
        </div>
        <p className="text-xs text-muted">{formatMailDate(mail.date)}</p>
      </div>
      <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 text-xs">
        <dt className="text-muted">An</dt>
        <dd className="[overflow-wrap:anywhere]">{people(mail.to)}</dd>
        {mail.cc.length > 0 && (
          <>
            <dt className="text-muted">Cc</dt>
            <dd className="[overflow-wrap:anywhere]">{people(mail.cc)}</dd>
          </>
        )}
        <dt className="text-muted">Betreff</dt>
        <dd className="font-medium break-words">{mail.subject}</dd>
      </dl>
      {mail.attachments.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Anhänge der E-Mail">
          {mail.attachments.map((a) => {
            const { Icon, color } = TYPE_STYLE[a.type];
            return (
              <li key={a.id} className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs">
                <Paperclip className="h-3 w-3 text-muted" aria-hidden />
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
                <span className="truncate">{a.fileName}</span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{body}</div>
      {signature && <div className="mt-3 border-t border-border pt-2 text-xs whitespace-pre-wrap text-muted">{signature}</div>}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onAttach}
          disabled={attached}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-sm hover:bg-surface-2 disabled:opacity-50"
        >
          <Paperclip className="h-3.5 w-3.5" aria-hidden />
          {attached ? "Bereits angehängt" : "Diese E-Mail anhängen"}
        </button>
      </div>
    </article>
  );
}

function splitSignature(text: string): [string, string] {
  const i = text.lastIndexOf("\n--\n");
  return i >= 0 ? [text.slice(0, i), text.slice(i + 4)] : [text, ""];
}
