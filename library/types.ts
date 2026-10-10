// Typen für die Inhalte des Fundus (Weltmodell, Dokumente, E-Mails).
import type { Block, LibraryTag, OrgLevel, RichText, Slide } from "@/lib/library/types";
import type { EmblemSymbol } from "./build/emblem";

export interface OrgSpec {
  id: string;
  name: string;
  short: string;
  level: OrgLevel;
  /** Zeile unter dem Namen im Briefkopf, z. B. „Die Oberbürgermeisterin“. */
  head?: string;
  /** Mail-Domain, immer auf `.example` (RFC 2606). */
  domain: string;
  address: string[];
  /** Vorwahl und Stammnummer aus den Spielfilm-Rufnummern der Bundesnetzagentur, z. B. „069 90009“. */
  phone: string;
  color: string;
  accent: string;
  symbol: EmblemSymbol;
  units: UnitSpec[];
}

export interface UnitSpec {
  id: string;
  name: string;
  parent?: string;
}

export interface PersonSpec {
  id: string;
  /** Fehlt bei Externen (Bürgerinnen, Presse, Firmen). */
  org?: string;
  unit?: string;
  title?: string;
  first: string;
  last: string;
  /** Anrede: Frau, Herr oder ohne (Name). */
  salutation: "Frau" | "Herr" | "";
  role: string;
  /** Durchwahl (drei Ziffern innerhalb des Spielfilm-Bereichs). */
  ext?: string;
  /** Nur für Externe: vollständige Adresse auf `.example`. */
  email?: string;
  /** Nur für Externe: Firma oder Redaktion. */
  company?: string;
}

interface ItemSpec {
  id: string;
  title: string;
  org: string;
  unit: string;
  /** ISO-Datum (YYYY-MM-DD). */
  date: string;
  tags?: LibraryTag[];
  /** Begriffe, die im ausgelesenen Text vorkommen müssen (Test). */
  keywords: string[];
  summary: string;
}

export interface DocBase extends ItemSpec {
  author: string;
  /** Art des Dokuments, z. B. „Vermerk“. */
  kind: string;
  /** Dateiname ohne Endung. */
  fileName: string;
}

export interface WordSpec extends DocBase {
  type: "word";
  /** Kopfangaben rechts oben (Aktenzeichen, Datum …). Datum und Bearbeitung ergänzt der Generator. */
  meta?: [string, string][];
  recipient?: string[];
  subject?: string;
  blocks: Block[];
}

/** Zellwerte: Text, Zahl, leer, Datum oder Formel. In Formeln steht {r} für die eigene Zeile, {first}/{last} für die erste/letzte Datenzeile. */
export type CellSpec = string | number | null | { date: string } | { f: string; fmt?: NumberFormat };
export type NumberFormat = "text" | "int" | "dec" | "eur" | "eur0" | "pct" | "date" | "hours";

export interface SheetSpec {
  name: string;
  title?: string;
  subtitle?: string;
  columns: { header: string; width?: number; fmt?: NumberFormat }[];
  rows: (CellSpec[] | { cells: CellSpec[]; total?: boolean })[];
  /** Hinweise unter der Tabelle. */
  notes?: string[];
}

export interface ExcelSpec extends DocBase {
  type: "excel";
  sheets: SheetSpec[];
}

export interface PowerPointSpec extends DocBase {
  type: "powerpoint";
  slides: Slide[];
}

export type DocSpec = WordSpec | ExcelSpec | PowerPointSpec;

export interface MailSpec {
  from: string;
  to: string[];
  cc?: string[];
  /** Ortszeit Berlin, z. B. „2025-10-07T14:32“. */
  date: string;
  /** Eigener Betreff (z. B. „WG: …“); sonst „AW: “ + Betreff des Verlaufs ab der zweiten Mail. */
  subject?: string;
  body: RichText;
  attachments?: string[];
  /** Früheren Verlauf zitieren (Standard: ja). */
  quote?: boolean;
  /** Signatur anhängen (Standard: ja, außer bei Externen ohne Firma). */
  signature?: boolean;
}

export interface ThreadSpec extends ItemSpec {
  subject: string;
  mails: MailSpec[];
}
