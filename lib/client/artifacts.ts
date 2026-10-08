// Erkennt <artifact …>…</artifact>-Blöcke in Modellantworten – auch unvollständige während des Streamings.

export type ArtifactType = "html" | "svg" | "mermaid" | "markdown" | "code";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  language?: string;
  content: string;
  complete: boolean;
}

export type Segment = { kind: "text"; text: string } | { kind: "artifact"; artifact: Artifact };

const OPEN = /<artifact\b([^>]*)>/g;
const TYPES: ArtifactType[] = ["html", "svg", "mermaid", "markdown", "code"];

function attr(attrs: string, name: string): string | undefined {
  const m = new RegExp(`${name}\\s*=\\s*"([^"]*)"`).exec(attrs) ?? new RegExp(`${name}\\s*=\\s*'([^']*)'`).exec(attrs);
  return m?.[1];
}

export function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  OPEN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = OPEN.exec(text))) {
    const before = text.slice(cursor, match.index);
    if (before) segments.push({ kind: "text", text: before });
    const attrs = match[1];
    const bodyStart = match.index + match[0].length;
    const close = text.indexOf("</artifact>", bodyStart);
    const complete = close !== -1;
    const raw = text.slice(bodyStart, complete ? close : undefined);
    const rawType = (attr(attrs, "type") ?? "code").toLowerCase();
    const type = (TYPES.includes(rawType as ArtifactType) ? rawType : "code") as ArtifactType;
    segments.push({
      kind: "artifact",
      artifact: {
        id: (attr(attrs, "id") ?? `artefakt-${segments.length}`).slice(0, 80),
        type,
        title: attr(attrs, "title") ?? "Artefakt",
        language: attr(attrs, "language"),
        content: cleanContent(raw),
        complete,
      },
    });
    cursor = complete ? close + "</artifact>".length : text.length;
    OPEN.lastIndex = cursor;
  }
  // Angefangenes "<artif…" am Ende während des Streamings ausblenden.
  let rest = text.slice(cursor);
  const partial = rest.lastIndexOf("<");
  if (partial !== -1 && "<artifact".startsWith(rest.slice(partial, partial + 9)) && !rest.slice(partial).includes(">")) {
    rest = rest.slice(0, partial);
  }
  if (rest) segments.push({ kind: "text", text: rest });
  return segments;
}

/** Entfernt umschließende Codeblock-Zäune, falls das Modell sie trotzdem setzt. */
function cleanContent(raw: string): string {
  let s = raw.replace(/^\s*\n/, "").replace(/\s+$/, "");
  const fence = /^```[a-zA-Z0-9-]*\n([\s\S]*?)\n?```$/.exec(s.trim());
  if (fence) s = fence[1];
  return s;
}

export interface ArtifactVersion extends Artifact {
  messageId: string;
  version: number;
}

/** Sammelt alle Artefakte eines Gesprächs; gleiche id = neue Version. */
export function collectArtifacts(messages: { id: string; role: string; text: string }[]): Map<string, ArtifactVersion[]> {
  const map = new Map<string, ArtifactVersion[]>();
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    for (const seg of parseSegments(m.text)) {
      if (seg.kind !== "artifact") continue;
      const list = map.get(seg.artifact.id) ?? [];
      list.push({ ...seg.artifact, messageId: m.id, version: list.length + 1 });
      map.set(seg.artifact.id, list);
    }
  }
  return map;
}

const EXTENSIONS: Record<string, string> = {
  python: "py", javascript: "js", typescript: "ts", java: "java", csharp: "cs", "c#": "cs", cpp: "cpp", c: "c",
  go: "go", rust: "rs", ruby: "rb", php: "php", sql: "sql", bash: "sh", shell: "sh", json: "json", yaml: "yml",
  css: "css", html: "html", xml: "xml", kotlin: "kt", swift: "swift", r: "r",
};

export function fileNameFor(a: Artifact): string {
  const base = a.id.replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "artefakt";
  switch (a.type) {
    case "html":
      return `${base}.html`;
    case "svg":
      return `${base}.svg`;
    case "mermaid":
      return `${base}.mmd`;
    case "markdown":
      return `${base}.md`;
    default:
      return `${base}.${EXTENSIONS[(a.language ?? "").toLowerCase()] ?? "txt"}`;
  }
}

const CSP =
  "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com; " +
  "style-src 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
  "font-src https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com data:; " +
  "img-src data: blob: https:; media-src data: blob: https:; connect-src 'none'; form-action 'none'; base-uri 'none'";

/** Bettet eine Content-Security-Policy in HTML-Artefakte ein (zusätzlich zur Sandbox). */
export function hardenHtml(html: string): string {
  const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP}">`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => `${m}${meta}`);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${meta}</head>`);
  return `<!doctype html><html><head><meta charset="utf-8">${meta}</head><body>${html}</body></html>`;
}

export function svgDocument(svg: string): string {
  return hardenHtml(
    `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;display:grid;place-items:center;background:#fff}svg{max-width:100%;max-height:100vh;height:auto}</style></head><body>${svg}</body></html>`,
  ).replace("script-src 'unsafe-inline' 'unsafe-eval'", "script-src 'none'");
}
