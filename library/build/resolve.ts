// Nachschlagen im Weltmodell: Personen, Einheiten, Adressen, Erscheinungsbild.
import type { Brand, LibraryPersonRef } from "@/lib/library/types";
import { ORGS, PERSONS } from "../world";
import type { OrgSpec, PersonSpec, UnitSpec } from "../types";
import { emblemPng } from "./emblem";

export function org(id: string): OrgSpec {
  const found = ORGS.find((o) => o.id === id);
  if (!found) throw new Error(`Unbekannte Verwaltung: ${id}`);
  return found;
}

export function person(id: string): PersonSpec {
  const found = PERSONS.find((p) => p.id === id);
  if (!found) throw new Error(`Unbekannte Person: ${id}`);
  return found;
}

export function unit(orgId: string, unitId: string): UnitSpec {
  const found = org(orgId).units.find((u) => u.id === unitId);
  if (!found) throw new Error(`Unbekannte Einheit ${unitId} in ${orgId}`);
  return found;
}

/** Einheit samt übergeordneten Einheiten, von oben nach unten. */
export function unitChain(orgId: string, unitId: string): UnitSpec[] {
  const chain: UnitSpec[] = [];
  let current: UnitSpec | undefined = unit(orgId, unitId);
  while (current) {
    chain.unshift(current);
    current = current.parent ? unit(orgId, current.parent) : undefined;
  }
  return chain;
}

/** Klein, ohne Umlaute und Sonderzeichen – für Mail-Adressen. */
export function ascii(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function fullName(p: PersonSpec): string {
  return `${p.title ? `${p.title} ` : ""}${p.first} ${p.last}`;
}

/** „Frau Lindner“, „Herr Dr. Vogelsang“ */
export function formalName(p: PersonSpec): string {
  return [p.salutation, p.title, p.last].filter(Boolean).join(" ");
}

export function email(p: PersonSpec): string {
  if (p.email) return p.email;
  if (!p.org) throw new Error(`Person ohne Verwaltung braucht eine Mail-Adresse: ${p.id}`);
  return `${ascii(p.first)}.${ascii(p.last)}@${org(p.org).domain}`;
}

export function phone(p: PersonSpec): string | undefined {
  if (!p.org || !p.ext) return undefined;
  return `${org(p.org).phone}-${p.ext}`;
}

export function personRef(id: string): LibraryPersonRef {
  const p = person(id);
  return { name: fullName(p), email: email(p), role: p.company ? `${p.role}, ${p.company}` : p.role };
}

const emblems = new Map<string, Buffer>();

export function emblem(orgId: string): Buffer {
  if (!emblems.has(orgId)) {
    const o = org(orgId);
    emblems.set(orgId, emblemPng({ symbol: o.symbol, color: o.color, accent: o.accent }));
  }
  return emblems.get(orgId)!;
}

/** Briefkopf: Name, Leitung und die beiden untersten Ebenen der Einheit. */
export function brand(orgId: string, unitId: string): Brand {
  const o = org(orgId);
  const chain = unitChain(orgId, unitId).map((u) => u.name);
  const lines = [...(o.head && !chain[0]?.startsWith("Büro") ? [o.head] : []), ...chain.slice(-2)];
  return {
    orgName: o.name,
    lines,
    color: o.color,
    accent: o.accent,
    emblem: `data:image/png;base64,${emblem(orgId).toString("base64")}`,
  };
}
