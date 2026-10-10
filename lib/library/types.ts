// Fundus: erfundene Beispieldateien und E-Mails. Typen für Browser, Server und Generator.

export type LibraryFileType = "word" | "excel" | "powerpoint" | "mail";
export type LibraryDocType = Exclude<LibraryFileType, "mail">;

/** Merkmale für Übungen (in der Liste filterbar). Die Länge wird aus der Token-Schätzung abgeleitet. */
export const LIBRARY_TAGS = {
  kurz: "Kurz",
  mittel: "Mittel",
  lang: "Lang",
  zahlen: "Mit Zahlen",
  widersprueche: "Mit Widersprüchen",
  personendaten: "Fiktive Personendaten",
  unstrukturiert: "Unstrukturiert",
} as const;
export type LibraryTag = keyof typeof LIBRARY_TAGS;

export const LEVEL_LABELS = {
  kommune: "Kommune",
  kreis: "Landkreis",
  land: "Land",
  bund: "Bund",
  it: "IT-Dienstleister",
} as const;
export type OrgLevel = keyof typeof LEVEL_LABELS;

/** Erlaubte IDs: klein, Ziffern, Bindestrich (auch in URLs und Speicherschlüsseln sicher). */
export const LIBRARY_ID = /^[a-z0-9](?:[a-z0-9-]{1,78}[a-z0-9])$/;

export interface LibraryUnit {
  id: string;
  name: string;
  /** Übergeordnete Einheit (Dezernat, Abteilung …); fehlt bei der obersten Ebene. */
  parent?: string;
}

export interface LibraryOrg {
  id: string;
  name: string;
  short: string;
  level: OrgLevel;
  /** Hauptfarbe des Erscheinungsbilds (#rrggbb). */
  color: string;
  units: LibraryUnit[];
}

export interface LibraryPersonRef {
  name: string;
  email: string;
  role?: string;
}

interface CatalogItemBase {
  id: string;
  title: string;
  orgId: string;
  unitId: string;
  /** ISO-Datum (YYYY-MM-DD). */
  date: string;
  tags: LibraryTag[];
  keywords: string[];
  summary: string;
}

export interface LibraryDocument extends CatalogItemBase {
  type: LibraryDocType;
  /** Art des Dokuments, z. B. „Vermerk“ oder „Budgetübersicht“. */
  kind: string;
  fileName: string;
  author: LibraryPersonRef;
  size: number;
  tokens: number;
  sha256: string;
}

export interface LibraryMail {
  id: string;
  subject: string;
  from: LibraryPersonRef;
  /** ISO-Zeitpunkt mit Zeitzone. */
  date: string;
  fileName: string;
  size: number;
  tokens: number;
  sha256: string;
  /** IDs der Fundus-Dokumente, die der Mail anhängen. */
  attachments: string[];
}

export interface LibraryThread extends CatalogItemBase {
  subject: string;
  participants: string[];
  mails: LibraryMail[];
}

export interface LibraryCatalog {
  version: string;
  orgs: LibraryOrg[];
  documents: LibraryDocument[];
  threads: LibraryThread[];
}

// ---------------------------------------------------------------- Inhalte und Vorschau

/** Text mit **fett** als einziger Auszeichnung. */
export type RichText = string;

export type Block =
  | { t: "h1" | "h2" | "h3"; text: string }
  | { t: "p"; text: RichText }
  | { t: "ul" | "ol"; items: RichText[] }
  | { t: "table"; header: string[]; rows: string[][]; widths?: number[] }
  | { t: "note"; text: RichText }
  | { t: "signature"; lines: string[] }
  | { t: "pagebreak" };

export interface Brand {
  orgName: string;
  /** Zeilen unter dem Namen im Briefkopf (z. B. „Der Oberbürgermeister“, „Amt 51 – Jugendamt“). */
  lines: string[];
  color: string;
  accent: string;
  /** Signet als PNG (data-URL) für die Vorschau. */
  emblem: string;
}

export type SlideBullet = RichText | { text: RichText; sub: RichText[] };

export type Slide =
  | { t: "title"; title: string; subtitle?: string; notes?: string }
  | { t: "section"; title: string; subtitle?: string; notes?: string }
  | { t: "bullets"; title: string; bullets: SlideBullet[]; notes?: string }
  | { t: "twocol"; title: string; left: { heading: string; bullets: RichText[] }; right: { heading: string; bullets: RichText[] }; notes?: string }
  | { t: "table"; title: string; header: string[]; rows: string[][]; notes?: string }
  | { t: "chart"; title: string; chart: ChartSpec; caption?: string; notes?: string }
  | { t: "end"; title: string; lines?: string[]; notes?: string };

export interface ChartSpec {
  type: "bar" | "line" | "pie";
  categories: string[];
  series: { name: string; values: number[] }[];
  /** Einheit der Werte für die Achse, z. B. „Tsd. €“. */
  unit?: string;
}

export interface SheetPreview {
  name: string;
  columns: { header: string; width: number; align: "left" | "right" }[];
  rows: { cells: string[]; total?: boolean }[];
  title?: string;
  subtitle?: string;
  notes?: string[];
}

export interface MailPreview {
  id: string;
  subject: string;
  from: LibraryPersonRef;
  to: LibraryPersonRef[];
  cc: LibraryPersonRef[];
  date: string;
  body: string;
  attachments: { id: string; title: string; fileName: string; type: LibraryDocType }[];
}

export type LibraryPreview =
  | { type: "word"; brand: Brand; kind: string; meta: [string, string][]; recipient?: string[]; subject?: string; blocks: Block[] }
  | { type: "excel"; sheets: SheetPreview[] }
  | { type: "powerpoint"; brand: Brand; slides: Slide[] }
  | { type: "thread"; subject: string; mails: MailPreview[] };

/** Endung je Dateityp. */
export const LIBRARY_EXTENSION: Record<LibraryFileType, string> = { word: "docx", excel: "xlsx", powerpoint: "pptx", mail: "eml" };

export const LIBRARY_MIME: Record<LibraryFileType, string> = {
  word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  powerpoint: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  mail: "message/rfc822",
};

export const LIBRARY_TYPE_LABEL: Record<LibraryFileType, string> = { word: "Word", excel: "Excel", powerpoint: "PowerPoint", mail: "E-Mail" };

/** Länge eines Inhalts anhand der Token-Schätzung. */
export function lengthTag(tokens: number): LibraryTag {
  return tokens < 600 ? "kurz" : tokens < 2000 ? "mittel" : "lang";
}
