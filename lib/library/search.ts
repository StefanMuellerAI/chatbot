// Suche und Filter im Fundus (Browser; ohne Server-Abhängigkeiten, auch in Unit-Tests nutzbar).
import type { LibraryCatalog, LibraryDocType, LibraryDocument, LibraryOrg, LibraryTag, LibraryThread } from "./types";

/** Vereinheitlicht Text für die Suche: klein, ä = ae, ß = ss, ohne Akzente. */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i");
}

export interface LibraryFilter {
  query: string;
  orgId: string | null;
  unitId: string | null;
  types: LibraryDocType[];
  tags: LibraryTag[];
}

export const EMPTY_FILTER: LibraryFilter = { query: "", orgId: null, unitId: null, types: [], tags: [] };

export function filterActive(f: LibraryFilter): boolean {
  return Boolean(f.query.trim() || f.orgId || f.unitId || f.types.length || f.tags.length);
}

/** Eine Einheit und alle darunterliegenden (Filter auf ein Dezernat zeigt auch seine Ämter). */
export function unitWithChildren(org: LibraryOrg, unitId: string): Set<string> {
  const result = new Set([unitId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const u of org.units) {
      if (u.parent && result.has(u.parent) && !result.has(u.id)) {
        result.add(u.id);
        grew = true;
      }
    }
  }
  return result;
}

/** Einheiten in Baumreihenfolge mit Tiefe (für die Auswahlliste). */
export function unitTree(org: LibraryOrg): { id: string; name: string; depth: number }[] {
  const out: { id: string; name: string; depth: number }[] = [];
  const walk = (parent: string | undefined, depth: number) => {
    for (const u of org.units.filter((x) => x.parent === parent)) {
      out.push({ id: u.id, name: u.name, depth });
      walk(u.id, depth + 1);
    }
  };
  walk(undefined, 0);
  return out;
}

function unitName(catalog: LibraryCatalog, orgId: string, unitId: string): string[] {
  const org = catalog.orgs.find((o) => o.id === orgId);
  const names: string[] = [];
  let unit = org?.units.find((u) => u.id === unitId);
  while (unit) {
    names.push(unit.name);
    unit = unit.parent ? org?.units.find((u) => u.id === unit!.parent) : undefined;
  }
  return names;
}

function matches(haystack: string[], query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = fold(haystack.join(" \n "));
  return words.every((w) => text.includes(w));
}

function inScope(catalog: LibraryCatalog, item: { orgId: string; unitId: string; tags: LibraryTag[] }, f: LibraryFilter): boolean {
  if (f.orgId && item.orgId !== f.orgId) return false;
  if (f.orgId && f.unitId) {
    const org = catalog.orgs.find((o) => o.id === f.orgId);
    if (!org || !unitWithChildren(org, f.unitId).has(item.unitId)) return false;
  }
  return f.tags.every((t) => item.tags.includes(t));
}

const newestFirst = (a: { date: string; title: string }, b: { date: string; title: string }) =>
  a.date === b.date ? a.title.localeCompare(b.title, "de") : a.date < b.date ? 1 : -1;

export function filterDocuments(catalog: LibraryCatalog, f: LibraryFilter): LibraryDocument[] {
  return catalog.documents
    .filter((d) => inScope(catalog, d, f) && (!f.types.length || f.types.includes(d.type)))
    .filter((d) => {
      const org = catalog.orgs.find((o) => o.id === d.orgId);
      return matches(
        [d.title, d.kind, d.fileName, d.summary, ...d.keywords, d.author.name, org?.name ?? "", org?.short ?? "", ...unitName(catalog, d.orgId, d.unitId)],
        f.query,
      );
    })
    .sort(newestFirst);
}

export function filterThreads(catalog: LibraryCatalog, f: LibraryFilter): LibraryThread[] {
  return catalog.threads
    .filter((t) => inScope(catalog, t, f))
    .filter((t) => {
      const org = catalog.orgs.find((o) => o.id === t.orgId);
      return matches(
        [
          t.title,
          t.subject,
          t.summary,
          ...t.keywords,
          ...t.participants,
          ...t.mails.map((m) => m.from.email),
          org?.name ?? "",
          org?.short ?? "",
          ...unitName(catalog, t.orgId, t.unitId),
        ],
        f.query,
      );
    })
    .sort(newestFirst);
}

/** Organisationseinheit als lesbare Zeile: „Amt 51 – Jugendamt · Abteilung Kindertagesbetreuung“. */
export function unitLabel(catalog: LibraryCatalog, orgId: string, unitId: string): string {
  return unitName(catalog, orgId, unitId).reverse().slice(-2).join(" · ");
}
