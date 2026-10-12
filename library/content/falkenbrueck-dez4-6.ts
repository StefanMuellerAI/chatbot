// Stadt Falkenbrück – Dezernate IV bis VI (Schule, Kultur, Sport; Jugend, Soziales, Gesundheit; Planen und Bauen)
import type { CellSpec, DocSpec, ThreadSpec } from "../types";

// ---------------------------------------------------------------- Hilfen für lange Tabellen (deterministisch)

/** Einfacher linearer Kongruenzgenerator mit festem Startwert – liefert bei jedem Build dieselben Werte. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const pick = <T,>(rnd: () => number, list: readonly T[]): T => list[Math.floor(rnd() * list.length)];

/** ISO-Datum plus Tage (UTC, ohne Uhrzeit – deterministisch). */
function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const plusYears = (iso: string, years: number) => `${Number(iso.slice(0, 4)) + years}${iso.slice(4)}`;

/** Erster Tag des Folgemonats. */
function nextMonthStart(iso: string): string {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
}

// ── Baumkataster Nordstadt (Regelkontrolle Sommer 2025) ──

interface Baumart {
  name: string;
  planted: [number, number];
  /** Stammumfang in cm je Standjahr (grob). */
  growth: number;
  maxHeight: number;
  special?: Befund;
}

interface Befund {
  text: string;
  massnahme: string;
  dringlichkeit: string;
  sicher: "ja" | "eingeschränkt" | "nein";
}

const OHNE_BEFUND: Befund = { text: "ohne Befund", massnahme: "keine", dringlichkeit: "–", sicher: "ja" };
const BEFUNDE: Befund[] = [
  { text: "Totholz in der Krone (> 5 cm)", massnahme: "Totholzentfernung", dringlichkeit: "bis 4 Wochen", sicher: "eingeschränkt" },
  { text: "Lichtraumprofil über Fahrbahn unterschritten", massnahme: "Lichtraumprofilschnitt", dringlichkeit: "bis 6 Monate", sicher: "ja" },
  { text: "Lichtraumprofil über Gehweg unterschritten", massnahme: "Lichtraumprofilschnitt", dringlichkeit: "bis 6 Monate", sicher: "ja" },
  { text: "Anfahrschaden am Stamm, Rinde offen", massnahme: "beobachten", dringlichkeit: "nächste Regelkontrolle", sicher: "ja" },
  { text: "Wurzelanhebung Gehwegplatten", massnahme: "Gehweg instand setzen (Amt 66)", dringlichkeit: "bis 6 Monate", sicher: "ja" },
  { text: "Totholz in der Krone (> 5 cm)", massnahme: "Totholzentfernung", dringlichkeit: "bis 4 Wochen", sicher: "eingeschränkt" },
  { text: "Druckzwiesel mit Rissbildung", massnahme: "Kronensicherung", dringlichkeit: "bis 6 Monate", sicher: "eingeschränkt" },
  { text: "Pilzfruchtkörper am Stammfuß", massnahme: "eingehende Untersuchung", dringlichkeit: "bis 4 Wochen", sicher: "eingeschränkt" },
];
const STAMMFUSSFAEULE: Befund = { text: "Stammfußfäule, Restwandstärke unzureichend", massnahme: "Fällung", dringlichkeit: "sofort", sicher: "nein" };
const ABSTERBEND: Befund = { text: "absterbend, Krone zu über 70 % abgestorben", massnahme: "Fällung", dringlichkeit: "bis 4 Wochen", sicher: "nein" };

const BAUMARTEN: Record<string, Baumart> = {
  birke: { name: "Sandbirke", planted: [1972, 1990], growth: 3.4, maxHeight: 22 },
  linde: { name: "Winterlinde", planted: [1965, 2004], growth: 3.6, maxHeight: 24 },
  spitzahorn: { name: "Spitzahorn", planted: [1978, 2012], growth: 3.5, maxHeight: 21 },
  platane: {
    name: "Platane",
    planted: [1958, 1985],
    growth: 4.6,
    maxHeight: 28,
    special: { text: "Massaria-Befall an Starkästen", massnahme: "Totholzentfernung", dringlichkeit: "bis 4 Wochen", sicher: "eingeschränkt" },
  },
  hainbuche: { name: "Hainbuche", planted: [1988, 2015], growth: 2.6, maxHeight: 15 },
  feldahorn: { name: "Feldahorn", planted: [1990, 2016], growth: 2.8, maxHeight: 14 },
  kirsche: { name: "Zierkirsche", planted: [1992, 2014], growth: 2.5, maxHeight: 9 },
  eberesche: { name: "Eberesche", planted: [1995, 2016], growth: 2.4, maxHeight: 11 },
  amberbaum: { name: "Amberbaum", planted: [2018, 2021], growth: 3.2, maxHeight: 8 },
  saeulenhainbuche: { name: "Säulen-Hainbuche", planted: [2018, 2021], growth: 2.6, maxHeight: 7 },
  eiche: { name: "Stieleiche", planted: [1925, 1960], growth: 3.3, maxHeight: 27 },
  esche: {
    name: "Gemeine Esche",
    planted: [1950, 1975],
    growth: 3.6,
    maxHeight: 25,
    special: { text: "Eschentriebsterben, Kronenverlichtung ca. 40 %", massnahme: "Kronenrückschnitt", dringlichkeit: "bis 6 Monate", sicher: "eingeschränkt" },
  },
  kastanie: {
    name: "Rosskastanie",
    planted: [1935, 1965],
    growth: 4.0,
    maxHeight: 23,
    special: { text: "Miniermotte, vorzeitiger Laubfall", massnahme: "beobachten", dringlichkeit: "nächste Regelkontrolle", sicher: "ja" },
  },
};

const BAUM_STRASSEN: { street: string; block: number; count: number; arten: string[]; dates: string[] }[] = [
  { street: "Birkenallee", block: 1, count: 16, arten: ["birke", "birke", "linde"], dates: ["2025-06-03"] },
  { street: "Nordring", block: 2, count: 18, arten: ["spitzahorn", "spitzahorn", "platane"], dates: ["2025-06-05", "2025-06-10"] },
  { street: "Falkenweg", block: 3, count: 12, arten: ["hainbuche", "feldahorn"], dates: ["2025-06-17"] },
  { street: "Am Schwanenteich", block: 4, count: 14, arten: ["eiche", "esche", "kastanie"], dates: ["2025-07-08", "2025-07-10"] },
  { street: "Holunderweg", block: 5, count: 10, arten: ["kirsche", "eberesche"], dates: ["2025-06-24"] },
  { street: "Kiebitzweg", block: 6, count: 9, arten: ["amberbaum", "saeulenhainbuche"], dates: ["2025-07-01"] },
  { street: "Nordstadtplatz", block: 7, count: 6, arten: ["platane"], dates: ["2025-07-15"] },
  { street: "Ginsterweg", block: 8, count: 9, arten: ["feldahorn", "spitzahorn"], dates: ["2025-07-22"] },
];

/** Bäume, deren Befund feststeht (für Pflichtbegriffe und Übungen). */
const BAUM_FEST: Record<string, Befund> = {
  "NS-0207": STAMMFUSSFAEULE,
  "NS-0412": BEFUNDE[6],
  "NS-0109": ABSTERBEND,
  "NS-0305": BEFUNDE[7],
};

interface Baum {
  nr: string;
  street: string;
  standort: string;
  art: string;
  planted: number;
  umfang: number;
  hoehe: number;
  date: string;
  vital: number;
  befund: Befund;
  next: string;
}

function baumkataster(): Baum[] {
  const rnd = lcg(5217);
  const trees: Baum[] = [];
  for (const s of BAUM_STRASSEN) {
    let house = 1 + Math.floor(rnd() * 3);
    for (let i = 1; i <= s.count; i++) {
      const nr = `NS-${String(s.block).padStart(2, "0")}${String(i).padStart(2, "0")}`;
      const art = BAUMARTEN[pick(rnd, s.arten)];
      const planted = art.planted[0] + Math.floor(rnd() * (art.planted[1] - art.planted[0] + 1));
      const age = 2025 - planted;
      const umfang = Math.round((age * art.growth * (0.85 + rnd() * 0.3)) / 5) * 5 + 15;
      const hoehe = Math.min(art.maxHeight, Math.max(4, Math.round(age * 0.45 + rnd() * 4)));
      const date = s.dates[Math.min(s.dates.length - 1, Math.floor(((i - 1) / s.count) * s.dates.length))];
      let befund: Befund;
      const r = rnd();
      if (BAUM_FEST[nr]) befund = BAUM_FEST[nr];
      else if (r < 0.56) befund = OHNE_BEFUND;
      else if (art.special && r < 0.72) befund = art.special;
      else befund = pick(rnd, BEFUNDE.slice(0, age < 20 ? 4 : BEFUNDE.length));
      const vital = befund === ABSTERBEND ? 4 : befund === OHNE_BEFUND ? Math.floor(rnd() * 2) : befund.sicher === "ja" ? 1 + Math.floor(rnd() * 2) : 2 + Math.floor(rnd() * 2);
      const next = befund.massnahme === "Fällung" ? "–" : plusYears(date, age < 15 || befund.sicher === "eingeschränkt" ? 1 : age < 40 ? 2 : 1);
      const standort = s.street === "Nordstadtplatz" ? `Platzfläche, Standort ${i}` : `${rnd() < 0.5 ? "vor" : "ggü."} Nr. ${house}`;
      house += 2 + Math.floor(rnd() * 3);
      trees.push({ nr, street: s.street, standort, art: art.name, planted, umfang, hoehe, date, vital, befund, next });
    }
  }
  return trees;
}

const BAEUME = baumkataster();

const BAUM_KOSTEN: [string, number][] = [
  ["Totholzentfernung", 180],
  ["Lichtraumprofilschnitt", 120],
  ["Kronenrückschnitt", 480],
  ["Kronensicherung", 650],
  ["eingehende Untersuchung", 420],
  ["Fällung", 1150],
  ["beobachten", 0],
  ["Gehweg instand setzen (Amt 66)", 0],
];

// ── Kita-Warteliste Nordstadt (Stand 30.09.2025) ──

const KITA_NORD = ["Kita Sonnenblume", "Kita Schwanennest", "Kita Birkenhof", "Kinderhaus Falkenweg"] as const;
const KITA_PLAETZE: Record<(typeof KITA_NORD)[number], number> = { "Kita Sonnenblume": 110, "Kita Schwanennest": 95, "Kita Birkenhof": 105, "Kinderhaus Falkenweg": 85 };
const KIND_VORNAMEN = [
  "Emma", "Noah", "Mia", "Ben", "Lina", "Elias", "Sofia", "Matteo", "Hanna", "Paul", "Leni", "Finn", "Ella", "Emil", "Amira", "Yusuf",
  "Zeynep", "Mila", "Luca", "Ida", "Jonas", "Lea", "Malik", "Nele", "Aras", "Maja", "Theo", "Clara", "Milan", "Lotta", "Karim", "Frieda",
  "Oskar", "Alina", "Leo", "Ilvy", "Davide", "Mira", "Anton", "Selma",
];
const ELTERN_VORNAMEN = [
  "Sarah", "Michael", "Julia", "Daniel", "Katharina", "Sebastian", "Aylin", "Mehmet", "Olga", "Tomasz", "Laura", "Christian", "Fatima",
  "Ahmad", "Ioana", "Jennifer", "Marco", "Nadia", "Stefan", "Lisa", "Mustafa", "Anja", "Dragan", "Vanessa", "Patrick", "Yasmin",
];
const FAMILIENNAMEN = [
  "Schulte", "Peters", "Hoffmeister", "Kaczmarek", "Ahmadi", "Petrović", "Schmitz", "Korkmaz", "Vogel", "Haase", "Ivanova", "Wagner",
  "Demirci", "Thiel", "Popescu", "Engelhardt", "Jovanović", "Seidler", "Meyer", "Winter", "Köhler", "Weber", "Schreiber", "Simon",
  "Jung", "Otto", "Braun", "Zimmermann", "Schwarz", "Heinze", "Sadiku", "Reimers", "Lüdtke", "Mansour", "Gashi", "Tran", "Kılıç",
];
const NORD_STRASSEN = ["Birkenallee", "Nordring", "Falkenweg", "Holunderweg", "Kiebitzweg", "Am Schwanenteich", "Ginsterweg", "Lerchenstieg", "Amselring"];
const KITA_HINWEISE = [
  "", "", "", "", "", "Geschwisterkind in derselben Kita", "alleinerziehend", "beide Eltern berufstätig ab 01.02.2026", "Umzug innerhalb der Nordstadt 2025",
  "Integrationshilfe beantragt", "Mutter beginnt Ausbildung 08/2026", "", "Kindertagespflege endet 31.12.2025", "Sprachförderung empfohlen (Kinderarzt)",
];

interface WartelisteEintrag {
  vormerk: string;
  name: string;
  vorname: string;
  geburt: string;
  gruppe: "U3" | "Ü3";
  anschrift: string;
  eltern: string;
  telefon: string;
  seit: string;
  beginn: string;
  stunden: number;
  wunsch1: string;
  wunsch2: string;
  anspruch: "ja" | "nein";
  hinweis: string;
}

function kitaWarteliste(): WartelisteEintrag[] {
  const rnd = lcg(30925);
  const list: WartelisteEintrag[] = [];
  const anspruchRang: number[] = [];
  const vergeben = new Set<string>();
  for (let i = 0; i < 97; i++) {
    const u3 = rnd() < 0.58;
    // U3: geboren 01.09.2023 bis 30.06.2025, Ü3: 01.09.2021 bis 31.07.2023
    const geburt = u3 ? addDays("2023-09-01", Math.floor(rnd() * 668)) : addDays("2021-09-01", Math.floor(rnd() * 698));
    const firstBirthday = plusYears(geburt, 1);
    const wunschBeginn = pick(rnd, ["2025-11-01", "2026-01-01", "2026-02-01", "2026-03-01", "2026-04-01", "2026-08-01", "2026-08-01", "2026-08-01"]);
    const beginn = wunschBeginn < firstBirthday ? nextMonthStart(firstBirthday) : wunschBeginn;
    const seit = addDays(geburt < "2024-03-01" ? "2024-03-01" : addDays(geburt, 21), Math.floor(rnd() * 420));
    const seitFinal = seit > "2025-09-26" ? addDays("2025-09-26", -Math.floor(rnd() * 60)) : seit;
    const name = pick(rnd, FAMILIENNAMEN);
    const elternName = rnd() < 0.82 ? name : pick(rnd, FAMILIENNAMEN);
    const w1 = pick(rnd, KITA_NORD);
    let w2: string = pick(rnd, [...KITA_NORD, "Kita Kiebitzweg (Neubau)"]);
    if (w2 === w1) w2 = "keine";
    let vorname = pick(rnd, KIND_VORNAMEN);
    while (vergeben.has(`${vorname} ${name}`)) vorname = pick(rnd, KIND_VORNAMEN);
    vergeben.add(`${vorname} ${name}`);
    list.push({
      vormerk: `KV-${seitFinal.slice(0, 4)}-${String(1000 + i * 7 + Math.floor(rnd() * 6)).slice(-4)}`,
      name,
      vorname,
      geburt,
      gruppe: u3 ? "U3" : "Ü3",
      anschrift: `${pick(rnd, NORD_STRASSEN)} ${1 + Math.floor(rnd() * 58)}`,
      eltern: `${pick(rnd, ELTERN_VORNAMEN)} ${elternName}`,
      telefon: `040 66969-${100 + Math.floor(rnd() * 900)}`,
      seit: seitFinal,
      beginn,
      stunden: pick(rnd, [25, 35, 35, 45, 45, 45]),
      wunsch1: w1,
      wunsch2: w2,
      anspruch: "nein",
      hinweis: pick(rnd, KITA_HINWEISE),
    });
    anspruchRang.push(rnd());
  }
  // genau 31 Familien haben den Rechtsanspruch schriftlich geltend gemacht (wie in Vorlage V/2025/0412)
  [...anspruchRang.keys()].sort((a, b) => anspruchRang[a] - anspruchRang[b]).slice(0, 31).forEach((i) => (list[i].anspruch = "ja"));
  return list.sort((a, b) => (a.seit < b.seit ? -1 : a.seit > b.seit ? 1 : a.name.localeCompare(b.name, "de")));
}

const WARTELISTE = kitaWarteliste();

// ── Hallenbelegung Winterhalbjahr 2026/27 ──

type BelegungZeile = [tag: string, beginn: string, ende: string, teile: number, verein: string, gruppe: string, tn: number, std: number];

const HALLEN: { name: string; teile: number; rows: BelegungZeile[] }[] = [
  {
    name: "Sporthalle Gesamtschule Nord (3-fach)",
    teile: 3,
    rows: [
      ["Mo", "17:00", "18:30", 1, "TV Falkenbrück 1861 e. V.", "Kinderturnen 6–8 J.", 22, 1.5],
      ["Mo", "17:00", "18:30", 2, "Falkenbrücker Handballverein e. V.", "E-Jugend", 28, 1.5],
      ["Mo", "18:30", "20:00", 3, "Falkenbrücker Handballverein e. V.", "1. Herren", 18, 1.5],
      ["Mo", "20:00", "22:00", 3, "Falkenbrücker Handballverein e. V.", "2. Herren", 16, 2],
      ["Di", "17:00", "18:00", 1, "Behindertensportgemeinschaft Falkenbrück e. V.", "Rollstuhlbasketball Jugend", 9, 1],
      ["Di", "17:00", "18:00", 2, "SC Nordstadt e. V.", "Badminton Jugend", 20, 1],
      ["Di", "18:00", "19:30", 3, "Falkenbrücker Handballverein e. V.", "Damen", 17, 1.5],
      ["Di", "18:00", "19:30", 1, "Volleyballfreunde Lerchenfeld e. V.", "Mixed", 14, 1.5],
      ["Di", "19:30", "22:00", 3, "Behindertensportgemeinschaft Falkenbrück e. V.", "Rollstuhlbasketball", 12, 2.5],
      ["Mi", "17:00", "19:00", 3, "Falkenbrücker Handballverein e. V.", "C- und D-Jugend", 34, 2],
      ["Mi", "19:00", "22:00", 2, "Volleyballfreunde Lerchenfeld e. V.", "1. und 2. Damen", 24, 3],
      ["Mi", "19:00", "22:00", 1, "SC Nordstadt e. V.", "Freizeitsport", 15, 3],
      ["Do", "17:00", "18:30", 3, "TV Falkenbrück 1861 e. V.", "Leichtathletik Halle", 30, 1.5],
      ["Do", "18:30", "20:00", 3, "Falkenbrücker Handballverein e. V.", "1. Herren", 18, 1.5],
      ["Do", "20:00", "22:00", 2, "SC Nordstadt e. V.", "Badminton", 22, 2],
      ["Fr", "17:00", "19:00", 3, "Falkenbrücker Handballverein e. V.", "A- und B-Jugend", 31, 2],
      ["Fr", "19:00", "21:00", 2, "Basketballclub Falkenbrück 1998 e. V.", "Herren", 14, 2],
    ],
  },
  {
    name: "Sporthalle Am Sportpark (3-fach)",
    teile: 3,
    rows: [
      ["Mo", "17:00", "19:00", 3, "SV Südstadt 1920 e. V.", "Futsal Jugend", 36, 2],
      ["Mo", "19:00", "22:00", 3, "Basketballclub Falkenbrück 1998 e. V.", "1. Herren, 1. Damen", 26, 3],
      ["Di", "17:00", "19:00", 2, "TV Falkenbrück 1861 e. V.", "Geräteturnen", 25, 2],
      ["Di", "17:00", "19:00", 1, "Judo-Club Hafenviertel e. V.", "Kinder (Mattenaufbau)", 18, 2],
      ["Di", "19:00", "21:30", 3, "Volleyballfreunde Lerchenfeld e. V.", "Herren", 13, 2.5],
      ["Mi", "17:00", "19:00", 3, "Basketballclub Falkenbrück 1998 e. V.", "U12 bis U16", 38, 2],
      ["Mi", "19:00", "22:00", 3, "SV Südstadt 1920 e. V.", "Futsal Herren", 20, 3],
      ["Do", "17:00", "18:30", 3, "TV Falkenbrück 1861 e. V.", "Geräteturnen", 25, 1.5],
      ["Do", "18:30", "22:00", 3, "Basketballclub Falkenbrück 1998 e. V.", "1. Herren, 1. Damen", 26, 3.5],
      ["Fr", "17:00", "20:00", 3, "SV Südstadt 1920 e. V.", "Futsal Jugend", 40, 3],
    ],
  },
  {
    name: "Sporthalle Lindenstraße (2-fach)",
    teile: 2,
    rows: [
      ["Mo", "17:00", "18:30", 2, "TV Falkenbrück 1861 e. V.", "Eltern-Kind-Turnen", 24, 1.5],
      ["Mo", "18:30", "20:00", 2, "TV Falkenbrück 1861 e. V.", "Fitness 50 plus", 19, 1.5],
      ["Di", "17:00", "20:00", 2, "Judo-Club Hafenviertel e. V.", "Jugend und Erwachsene", 32, 3],
      ["Mi", "17:00", "19:00", 1, "Tanzsportgemeinschaft Weststadt e. V.", "Kindertanz", 16, 2],
      ["Mi", "17:00", "19:00", 1, "TV Falkenbrück 1861 e. V.", "Rückenfit", 14, 2],
      ["Do", "17:00", "21:00", 2, "Judo-Club Hafenviertel e. V.", "Wettkampfgruppe", 21, 4],
      ["Fr", "17:00", "19:00", 2, "Tanzsportgemeinschaft Weststadt e. V.", "Hip-Hop Jugend", 22, 2],
    ],
  },
  {
    name: "Turnhalle Grundschule Birkenallee",
    teile: 1,
    rows: [
      ["Mo", "17:00", "18:30", 1, "SC Nordstadt e. V.", "Kinderturnen", 18, 1.5],
      ["Mo", "18:30", "20:00", 1, "Behindertensportgemeinschaft Falkenbrück e. V.", "Sitzvolleyball", 10, 1.5],
      ["Di", "17:00", "19:00", 1, "Tanzsportgemeinschaft Weststadt e. V.", "Kindertanz Nord", 15, 2],
      ["Mi", "18:00", "20:00", 1, "SC Nordstadt e. V.", "Gymnastik", 12, 2],
      ["Do", "17:00", "18:30", 1, "TV Falkenbrück 1861 e. V.", "Ballschule", 20, 1.5],
      ["Fr", "17:00", "19:00", 1, "SC Nordstadt e. V.", "Kinderturnen", 19, 2],
    ],
  },
];

/** Zeilen des Blatts „Belegung“ (Datenzeilen ab Zeile 5) und Bereich je Halle. */
function hallenbelegung(): { rows: CellSpec[][]; ranges: { name: string; teile: number; from: number; to: number }[] } {
  const rows: CellSpec[][] = [];
  const ranges: { name: string; teile: number; from: number; to: number }[] = [];
  for (const h of HALLEN) {
    const from = 5 + rows.length;
    for (const r of h.rows) rows.push([h.name, ...r, { f: "E{r}*I{r}" }]);
    ranges.push({ name: h.name, teile: h.teile, from, to: 5 + rows.length - 1 });
  }
  return { rows, ranges };
}

const BELEGUNG = hallenbelegung();

export const documents: DocSpec[] = [
  // ── Amt 40: Schulentwicklungsplan Grundschulen (lang, mit zwei eingebauten Widersprüchen) ──
  {
    type: "word",
    id: "fb-schulentwicklungsplan-grundschulen-2026",
    title: "Schulentwicklungsplan Grundschulen – Fortschreibung 2026/27 bis 2031/32 (Entwurf)",
    kind: "Schulentwicklungsplan",
    fileName: "Schulentwicklungsplan Grundschulen Fortschreibung 2026-2031 Entwurf",
    org: "falkenbrueck",
    unit: "fb-amt40",
    author: "fb-steinbrink",
    date: "2026-02-09",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Planungsraum", "Grundschule Lerchenfeld", "§ 24 Abs. 4 SGB VIII", "44.230.000 €", "Schulbezirksgrenze"],
    summary:
      "Fortschreibung der Schulentwicklungsplanung für 24 Grundschulen: Bestand, Schülerprognose je Planungsraum, Raum- und Ganztagsbedarf, Maßnahmenpaket über 44,2 Mio. €. Eingebaute Widersprüche: Die Zusammenfassung nennt 18 fehlende Klassenräume, die Raumbilanz ergibt 22; die Auslastung der Grundschule Lerchenfeld steht im Text mit 125 %, in der Tabelle mit 117 %.",
    meta: [
      ["Aktenzeichen", "40.1-200.10/26"],
      ["Fassung", "Entwurf zur Beteiligung der Schulen"],
      ["Status", "öffentlich"],
    ],
    subject: "Schulentwicklungsplan für die Grundschulen der Stadt Falkenbrück – Fortschreibung für die Schuljahre 2026/27 bis 2031/32",
    blocks: [
      { t: "h1", text: "Zusammenfassung" },
      {
        t: "p",
        text: "Die Zahl der Schülerinnen und Schüler an den 24 städtischen Grundschulen steigt nach der vorliegenden Prognose von 5.644 im Schuljahr 2025/26 auf 5.968 im Schuljahr 2031/32 (+ 5,7 %). Der Anstieg verteilt sich sehr ungleich: Während die Südstadt und die Weststadt leicht verlieren, wachsen die Nordstadt (+ 9,4 %), Lerchenfeld (+ 12,8 %) und – mit dem Bezug der ersten Wohnungen im Mühlenviertel ab 2028 – das Mühlenviertel (+ 34,0 %) deutlich.",
      },
      {
        t: "p",
        text: "Bis zum Schuljahr 2031/32 fehlen in drei Planungsräumen insgesamt **18 Klassenräume**. Zugleich ist ab dem 01.08.2026 der Rechtsanspruch auf ganztägige Förderung von Grundschulkindern nach § 24 Abs. 4 SGB VIII schrittweise zu erfüllen; bis zum Schuljahr 2029/30 werden rund 913 zusätzliche Ganztagsplätze benötigt.",
      },
      {
        t: "p",
        text: "Die Verwaltung schlägt ein Maßnahmenpaket mit einem Investitionsvolumen von rund 44,2 Mio. € vor (Abschnitt 8). Kernstücke sind der Neubau einer Grundschule im Mühlenviertel, die Erweiterung der Grundschulen Birkenallee und Falkenweg, ein Modulbau an der Grundschule Lerchenfeld sowie eine Änderung der Schulbezirksgrenze zwischen Lerchenfeld und der Südstadt. Schulschließungen sind nicht vorgesehen.",
      },
      { t: "h1", text: "1 Anlass und Auftrag" },
      {
        t: "p",
        text: "Nach dem Schulgesetz (SchulG) sind die Schulträger verpflichtet, für ihr Gebiet eine mit den benachbarten Schulträgern abgestimmte Schulentwicklungsplanung zu betreiben und regelmäßig fortzuschreiben. Die Schulentwicklungsplanung ist Grundlage für die Errichtung, Erweiterung, Zusammenlegung und Auflösung von Schulen, für die Festlegung der Schulbezirke und für die Investitionsplanung im Schulbau.",
      },
      {
        t: "p",
        text: "Der letzte Schulentwicklungsplan für die Grundschulen wurde vom Rat am 23.09.2021 beschlossen (Vorlage V/2021/0298). Er ging für das Schuljahr 2025/26 von 5.310 Schülerinnen und Schülern aus; tatsächlich besuchen derzeit 5.644 Kinder die städtischen Grundschulen. Die Abweichung von rund 6 % erklärt sich vor allem durch höhere Zuzüge in die Neubaugebiete der Nordstadt und durch die Aufnahme geflüchteter Kinder seit dem Frühjahr 2022, die in der damaligen Prognose nicht absehbar war.",
      },
      {
        t: "p",
        text: "Der Schulausschuss hat die Verwaltung am 04.06.2025 beauftragt, den Plan vorzeitig fortzuschreiben. Dabei sollen insbesondere der Rechtsanspruch auf Ganztagsförderung ab dem Schuljahr 2026/27, die Entwicklung des Mühlenviertels (Bebauungsplan Nr. 52) und der bauliche Zustand der Schulgebäude berücksichtigt werden. Der vorliegende Entwurf ist zwischen Schulverwaltungsamt, Jugendamt (Abteilung Kindertagesbetreuung), Stadtplanungsamt und dem Zentralen Gebäudemanagement abgestimmt.",
      },
      { t: "h1", text: "2 Rechtliche und fachliche Grundlagen" },
      {
        t: "ul",
        items: [
          "**Schulgesetz (SchulG):** Pflicht zur Schulentwicklungsplanung; Errichtung, Änderung und Auflösung von Schulen; Festlegung von Schulbezirken für Grundschulen durch Satzung des Schulträgers; Anhörung der Schulkonferenzen.",
          "**Klassenbildungsverordnung des Landes:** Klassenrichtwert für Grundschulen 24, Mindestgröße 15, Höchstgröße 28 Schülerinnen und Schüler. In Klassen mit mehr als drei Kindern mit sonderpädagogischem Förderbedarf soll die Höchstgröße um zwei unterschritten werden.",
          "**§ 24 Abs. 4 SGB VIII** in der Fassung des Ganztagsförderungsgesetzes: Rechtsanspruch auf Förderung in einer Tageseinrichtung für Kinder im Grundschulalter im Umfang von acht Stunden an allen Werktagen. Der Anspruch beginnt am 01.08.2026 für die erste Klassenstufe und wächst jährlich um eine Klassenstufe auf, bis er ab dem Schuljahr 2029/30 alle vier Klassenstufen umfasst. Die Unterrichtszeit wird angerechnet; in den Ferien darf die Einrichtung höchstens vier Wochen schließen.",
          "**Schulbaurichtlinie des Landes (Musterraumprogramm):** Für eine dreizügige Grundschule sind 12 allgemeine Unterrichtsräume, 4 Differenzierungsräume, Fachräume für Musik und Kunst, eine Mensa sowie Räume für den Ganztag vorzusehen. Für jede weitere Klasse kommen ein Unterrichtsraum und anteilig Differenzierungsfläche hinzu.",
          "**Inklusion:** Gemeinsames Lernen findet an allen Grundschulen statt. Für Förderung, Therapie und Rückzug ist je Schule mindestens ein zusätzlicher Raum vorzuhalten.",
        ],
      },
      { t: "h1", text: "3 Datengrundlagen und Methodik" },
      {
        t: "p",
        text: "Grundlage der Prognose sind die Einwohnermeldedaten zum Stichtag 30.09.2025 (Kinder der Geburtsjahrgänge 2016 bis 2025 nach Wohnadresse und Planungsraum), die amtliche Schulstatistik zum Stichtag 15.10.2025 sowie die Wohnungsbauprognose des Stadtplanungsamts (Stand November 2025). Die Prognose wurde in folgenden Schritten erstellt:",
      },
      {
        t: "ol",
        items: [
          "Fortschreibung der Geburtsjahrgänge je Planungsraum unter Berücksichtigung der durchschnittlichen Wanderungssalden der Jahre 2021 bis 2025.",
          "Übergangsquote in die städtischen Grundschulen: 91,8 % eines Jahrgangs (Mittel der Jahre 2021 bis 2025). Rund 6,1 % der schulpflichtigen Kinder werden zurückgestellt und gehen in den Folgejahrgang ein; die übrigen Kinder besuchen eine Schule in freier Trägerschaft, eine Förderschule oder eine Schule außerhalb des Stadtgebiets.",
          "Zuschlag für Neubaugebiete: 0,25 Grundschulkinder je neuer Wohneinheit im Geschosswohnungsbau und 0,45 je Wohneinheit in Ein- und Zweifamilienhäusern, jeweils in den ersten zehn Jahren nach Bezug.",
          "Klassenbildung: Klassenbedarf = Schülerzahl des Planungsraums geteilt durch den Richtwert 24, aufgerundet. Je Klasse wird ein allgemeiner Unterrichtsraum angesetzt.",
        ],
      },
      {
        t: "p",
        text: "Die Prognose ist für die ersten drei Schuljahre belastbar, weil die Kinder bereits geboren sind und in Falkenbrück wohnen. Ab dem Schuljahr 2029/30 beruhen die Werte auf geschätzten Geburten und auf der Wohnungsbauprognose und sind entsprechend unsicherer; die Schwankungsbreite wird auf ± 4 % geschätzt.",
      },
      {
        t: "table",
        header: ["Geburtsjahr", "Geburten in Falkenbrück", "Regulärer Schulbeginn"],
        rows: [
          ["2019", "1.682", "2025/26"],
          ["2020", "1.641", "2026/27"],
          ["2021", "1.703", "2027/28"],
          ["2022", "1.598", "2028/29"],
          ["2023", "1.547", "2029/30"],
          ["2024", "1.512", "2030/31"],
          ["2025 (Hochrechnung)", "1.490", "2031/32"],
        ],
        widths: [3, 3, 3],
      },
      {
        t: "p",
        text: "Trotz sinkender Geburtenzahlen steigt die Schülerzahl, weil die Zuzüge von Familien mit Kindern im Grundschulalter den Rückgang der Geburten mehr als ausgleichen. Allein die Baugebiete „Am Kiebitzweg“ und „Lerchenfeld II“ haben seit 2021 rund 640 Wohneinheiten geschaffen. Bis 2031 sind nach der Wohnungsbauprognose weitere 1.180 Wohneinheiten zu erwarten, davon rund 850 im Mühlenviertel, 190 in Lerchenfeld („Lerchenfeld III“) und 140 als Nachverdichtung im Hafenviertel.",
      },
      { t: "h1", text: "4 Bestand" },
      { t: "h2", text: "4.1 Schulen, Klassen und Räume" },
      {
        t: "p",
        text: "Die Stadt Falkenbrück ist Trägerin von 24 Grundschulen in sieben Planungsräumen. Im Schuljahr 2025/26 werden 5.644 Schülerinnen und Schüler in 242 Klassen unterrichtet; im Durchschnitt sind das 23,3 Kinder je Klasse. Hinzu kommen zwei Grundschulen in freier Trägerschaft mit zusammen rund 410 Kindern, die in dieser Planung nur nachrichtlich berücksichtigt sind. 37 Kinder aus Gemeinden des Landkreises Altmoorland besuchen als Gastschulkinder eine städtische Grundschule, überwiegend in der Weststadt.",
      },
      {
        t: "p",
        text: "Rechnerisch stehen den 242 Klassen genau 242 allgemeine Unterrichtsräume gegenüber. Die Verteilung ist jedoch ungleich: Sechs Schulen haben mehr Klassen als Räume und behelfen sich mit umgewidmeten Fach-, Differenzierungs- oder Betreuungsräumen. Am stärksten betroffen ist die Grundschule Lerchenfeld, die mit 14 Klassen in 12 Räumen zu **125 %** ausgelastet ist. Dort wird der Musikraum seit dem Schuljahr 2024/25 als Klassenraum genutzt, und der Ganztag weicht nachmittags in die Turnhalle aus.",
      },
      {
        t: "table",
        header: ["Schule", "Planungsraum", "Züge", "Klassen", "Schüler", "Räume", "Auslastung"],
        rows: [
          ["Grundschule Am Wall", "I Altstadt", "2", "8", "189", "9", "89 %"],
          ["Grundschule Brunnenstraße", "I Altstadt", "3", "12", "283", "12", "100 %"],
          ["Grundschule An der Stadtmauer", "I Altstadt", "2", "9", "211", "8", "113 %"],
          ["Grundschule Birkenallee", "II Nordstadt", "3", "14", "331", "12", "117 %"],
          ["Grundschule Nordstadt", "II Nordstadt", "4", "16", "384", "16", "100 %"],
          ["Grundschule Am Schwanenteich", "II Nordstadt", "2", "9", "218", "8", "113 %"],
          ["Grundschule Falkenweg", "II Nordstadt", "3", "13", "302", "12", "108 %"],
          ["Grundschule Holunderweg", "II Nordstadt", "2", "8", "196", "8", "100 %"],
          ["Grundschule Südstadt", "III Südstadt", "3", "12", "276", "13", "92 %"],
          ["Grundschule Lindenstraße", "III Südstadt", "3", "12", "262", "12", "100 %"],
          ["Grundschule Am Sportpark", "III Südstadt", "2", "8", "181", "10", "80 %"],
          ["Grundschule Kastanienhof", "III Südstadt", "2", "8", "187", "8", "100 %"],
          ["Grundschule Weststadt", "IV Weststadt", "3", "12", "281", "12", "100 %"],
          ["Grundschule Am Hohen Ufer", "IV Weststadt", "2", "8", "179", "9", "89 %"],
          ["Grundschule Rosenweg", "IV Weststadt", "3", "12", "268", "12", "100 %"],
          ["Grundschule Ahornplatz", "IV Weststadt", "2", "7", "161", "8", "88 %"],
          ["Grundschule Lerchenfeld", "V Lerchenfeld", "3", "14", "336", "12", "117 %"],
          ["Grundschule Am Wiesenhang", "V Lerchenfeld", "2", "9", "219", "8", "113 %"],
          ["Grundschule Heideweg", "V Lerchenfeld", "2", "8", "194", "8", "100 %"],
          ["Grundschule Hafenviertel", "VI Hafenviertel", "3", "12", "279", "12", "100 %"],
          ["Grundschule Speicherstraße", "VI Hafenviertel", "2", "8", "184", "8", "100 %"],
          ["Grundschule Am Kai", "VI Hafenviertel", "2", "7", "152", "8", "88 %"],
          ["Grundschule Mühlenviertel", "VII Mühlenviertel", "2", "8", "191", "8", "100 %"],
          ["Grundschule Am Mühlenteich", "VII Mühlenviertel", "2", "8", "180", "9", "89 %"],
          ["Summe", "", "", "242", "5.644", "242", "100 %"],
        ],
        widths: [5, 3, 1, 1, 1, 1, 2],
      },
      {
        t: "note",
        text: "Auslastung = Klassen je allgemeinem Unterrichtsraum. Werte über 100 % bedeuten, dass Fach- oder Differenzierungsräume dauerhaft als Klassenräume genutzt werden. Quelle: Schulstatistik zum 15.10.2025, Raumbuch des Zentralen Gebäudemanagements.",
      },
      { t: "h2", text: "4.2 Baulicher Zustand" },
      {
        t: "p",
        text: "Das Zentrale Gebäudemanagement hat 2024 alle Schulgebäude nach einem einheitlichen Schema bewertet. Danach befinden sich neun Grundschulen in gutem, elf in befriedigendem und vier in sanierungsbedürftigem Zustand (Grundschulen Am Kai, Speicherstraße, Ahornplatz und Am Hohen Ufer). Der Sanierungsbedarf aller Grundschulgebäude wird auf rund 31,5 Mio. € geschätzt; davon entfallen 12,8 Mio. € auf die vier sanierungsbedürftigen Schulen. Dieser Bedarf ist nicht Gegenstand des Maßnahmenpakets in Abschnitt 8, sondern wird im Gebäudesanierungsprogramm gesondert dargestellt. Kapazitätserweiterungen sollen jedoch, wo möglich, mit anstehenden Sanierungen verbunden werden.",
      },
      { t: "h2", text: "4.3 Ganztag" },
      {
        t: "p",
        text: "An allen 24 Grundschulen besteht ein offenes Ganztagsangebot, das von fünf freien Trägern im Auftrag der Stadt durchgeführt wird. Im Schuljahr 2025/26 sind 3.780 Plätze belegt; das entspricht einer Teilnahmequote von 67,0 %. Die Spanne reicht von 48 % an der Grundschule Am Wall bis 89 % an der Grundschule Holunderweg. Auf der Warteliste für den offenen Ganztag stehen 214 Kinder, davon 131 in der Nordstadt und in Lerchenfeld.",
      },
      {
        t: "p",
        text: "Eigene Räume für den Ganztag gibt es nur an neun Schulen. An den übrigen Schulen werden Klassenräume nachmittags mitgenutzt („Doppelnutzung“), was von Schulleitungen und Trägern gleichermaßen als belastend beschrieben wird. Neun Mensen sind zu klein, um alle Kinder in höchstens drei Essensschichten zu versorgen.",
      },
      { t: "h1", text: "5 Prognose der Schülerzahlen" },
      {
        t: "table",
        header: ["Planungsraum", "2025/26 (Ist)", "2027/28", "2029/30", "2031/32", "Veränderung"],
        rows: [
          ["I Altstadt", "683", "690", "701", "694", "+ 1,6 %"],
          ["II Nordstadt", "1.431", "1.489", "1.547", "1.566", "+ 9,4 %"],
          ["III Südstadt", "906", "889", "871", "858", "– 5,3 %"],
          ["IV Weststadt", "889", "872", "851", "840", "– 5,5 %"],
          ["V Lerchenfeld", "749", "788", "826", "845", "+ 12,8 %"],
          ["VI Hafenviertel", "615", "631", "652", "668", "+ 8,6 %"],
          ["VII Mühlenviertel", "371", "376", "418", "497", "+ 34,0 %"],
          ["Stadt gesamt", "5.644", "5.735", "5.866", "5.968", "+ 5,7 %"],
        ],
        widths: [3, 2, 2, 2, 2, 2],
      },
      { t: "h2", text: "5.1 Entwicklung in den Planungsräumen" },
      {
        t: "p",
        text: "**Planungsraum I – Altstadt:** Die Schülerzahl bleibt nahezu stabil. Zuzüge in sanierte Altbauwohnungen gleichen die rückläufigen Geburten aus. Die Grundschule An der Stadtmauer ist bereits heute überbelegt; die benachbarte Grundschule Am Wall hat einen freien Raum. Eine Feinsteuerung über die Aufnahme von Kindern aus dem Überschneidungsbereich Wallstraße/Brunnenstraße reicht aus.",
      },
      {
        t: "p",
        text: "**Planungsraum II – Nordstadt:** Der Zuwachs von 135 Kindern bis 2031/32 geht fast vollständig auf die Neubaugebiete „Am Kiebitzweg“ und „Lerchenfeld II“ zurück, deren Bewohnerinnen und Bewohner überwiegend junge Familien sind. Die Kinder, die heute in den Kindertageseinrichtungen der Nordstadt betreut werden oder auf der Warteliste stehen, kommen ab 2027 in die Grundschulen. Drei der fünf Grundschulen sind schon jetzt überbelegt. Ohne bauliche Erweiterung müssten ab 2028/29 Eingangsklassen mit 28 Kindern gebildet und Kinder in andere Planungsräume gelenkt werden.",
      },
      {
        t: "p",
        text: "**Planungsraum III – Südstadt:** Die Schülerzahl sinkt bis 2031/32 um 48 Kinder. Die Grundschulen Südstadt und Am Sportpark verfügen dann über freie Räume. Diese Reserve wird für die Entlastung von Lerchenfeld genutzt (Abschnitt 8.2).",
      },
      {
        t: "p",
        text: "**Planungsraum IV – Weststadt:** Die Weststadt verliert bis 2031/32 rund 5,5 % ihrer Grundschulkinder. Die Grundschule Ahornplatz wird voraussichtlich dauerhaft nur noch knapp zweizügig sein. Eine Zusammenlegung mit der Grundschule Am Hohen Ufer wurde geprüft, wird aber wegen der Schulwege über die Ringstraße und wegen der Gastschulkinder aus dem Landkreis derzeit nicht empfohlen. Die Entwicklung wird bei der nächsten Fortschreibung erneut bewertet.",
      },
      {
        t: "p",
        text: "**Planungsraum V – Lerchenfeld:** Mit + 12,8 % wächst Lerchenfeld relativ am stärksten unter den bestehenden Stadtteilen. Neben dem Bezug von „Lerchenfeld II“ wirken sich ab 2029 die rund 190 Wohneinheiten in „Lerchenfeld III“ aus. Die Grundschulen Lerchenfeld und Am Wiesenhang sind bereits überbelegt; die Grundschule Heideweg ist voll ausgelastet.",
      },
      {
        t: "p",
        text: "**Planungsraum VI – Hafenviertel:** Die Nachverdichtung im Hafenviertel führt zu einem moderaten Anstieg um 53 Kinder. Die vorhandenen 28 Räume reichen rechnerisch aus. Die Grundschule Am Kai ist jedoch sanierungsbedürftig; bei der Sanierung sollte die Erweiterung um einen Raum für den Ganztag mitgeplant werden.",
      },
      {
        t: "p",
        text: "**Planungsraum VII – Mühlenviertel:** Auf dem Gelände der ehemaligen Mühlenwerke entstehen nach dem Bebauungsplan Nr. 52 „Mühlenviertel“ rund 850 Wohneinheiten, überwiegend im Geschosswohnungsbau. Die ersten Wohnungen sollen 2028 bezogen werden. Die Prognose rechnet mit einem Anstieg von 371 auf 497 Kinder im Schuljahr 2031/32; der Höhepunkt wird erst nach 2032 erwartet, wenn alle Bauabschnitte bezogen sind.",
      },
      { t: "h1", text: "6 Raumbedarf" },
      {
        t: "table",
        header: ["Planungsraum", "Schüler 2031/32", "Klassenbedarf (Richtwert 24)", "Vorhandene Räume", "Saldo"],
        rows: [
          ["I Altstadt", "694", "29", "29", "0"],
          ["II Nordstadt", "1.566", "66", "56", "– 10"],
          ["III Südstadt", "858", "36", "43", "+ 7"],
          ["IV Weststadt", "840", "35", "41", "+ 6"],
          ["V Lerchenfeld", "845", "36", "28", "– 8"],
          ["VI Hafenviertel", "668", "28", "28", "0"],
          ["VII Mühlenviertel", "497", "21", "17", "– 4"],
          ["Stadt gesamt", "5.968", "251", "242", "– 9"],
        ],
        widths: [3, 2, 3, 2, 2],
      },
      {
        t: "p",
        text: "Stadtweit ergibt sich rechnerisch ein Fehlbedarf von 9 Räumen. Die Überhänge in der Süd- und Weststadt können den Mangel in der Nordstadt wegen der Entfernungen und der Schulwege für Grundschulkinder aber nicht ausgleichen. Maßgeblich ist deshalb der Fehlbedarf in den drei wachsenden Planungsräumen Nordstadt, Lerchenfeld und Mühlenviertel: zusammen 22 Klassenräume.",
      },
      {
        t: "p",
        text: "Hinzu kommt ein qualitativer Bedarf: An 14 Schulen fehlt mindestens ein Differenzierungsraum nach dem Musterraumprogramm, an sechs Schulen gibt es keinen barrierefreien Zugang zum Obergeschoss. Diese Bedarfe sollen bei Erweiterungen und Sanierungen mit erfüllt werden; sie sind in der Raumbilanz nicht enthalten.",
      },
      { t: "h1", text: "7 Ganztag und Rechtsanspruch" },
      {
        t: "p",
        text: "Mit dem Rechtsanspruch nach § 24 Abs. 4 SGB VIII wird die Nachfrage nach Ganztagsplätzen weiter steigen. Erfahrungen aus Kommunen mit bereits hoher Ganztagsquote zeigen eine Teilnahme von 75 bis 85 %. Die Planung legt eine Zielquote von 80 % zugrunde. Der Rechtsanspruch ist eine Aufgabe der Kinder- und Jugendhilfe; die Planung wird deshalb mit dem Jugendhilfeausschuss abgestimmt.",
      },
      {
        t: "table",
        header: ["Schuljahr", "Klassenstufen mit Rechtsanspruch", "Schüler (Prognose)", "Teilnahmequote", "Benötigte Plätze"],
        rows: [
          ["2025/26", "–", "5.644", "67 %", "3.780 (Ist)"],
          ["2027/28", "1 und 2", "5.735", "73 %", "4.187"],
          ["2029/30", "1 bis 4", "5.866", "80 %", "4.693"],
          ["2031/32", "1 bis 4", "5.968", "80 %", "4.774"],
        ],
        widths: [2, 3, 2, 2, 2],
      },
      {
        t: "p",
        text: "Bis zum Schuljahr 2029/30 sind damit rund 913 zusätzliche Plätze zu schaffen, bis 2031/32 rund 994. Räumlich soll der Ausbau vorrangig über Mehrfachnutzung erfolgen: Klassenräume werden so ausgestattet, dass sie nachmittags für den Ganztag geeignet sind (Stauraum, Ruhezonen, flexible Möblierung). Zusätzlich werden an neun Schulen Mensen erweitert und Ruheräume geschaffen. Das größte Risiko liegt nicht im Raum, sondern im Personal: Die fünf Träger des Ganztags melden schon heute 23 unbesetzte Stellen für pädagogische Fachkräfte.",
      },
      {
        t: "p",
        text: "Für die Ferien bietet die Stadt gemeinsam mit den Trägern ab Sommer 2026 an sechs Standorten eine zentrale Ferienbetreuung an, damit die Schließzeit von höchstens vier Wochen eingehalten werden kann. Die Kosten dafür sind im Teilhaushalt 51 veranschlagt.",
      },
      { t: "h1", text: "8 Maßnahmen" },
      { t: "h2", text: "8.1 Planungsraum II – Nordstadt" },
      {
        t: "ul",
        items: [
          "**Erweiterung der Grundschule Birkenallee** um vier Klassenräume, zwei Differenzierungsräume und eine vergrößerte Mensa (Anbau auf dem Schulhof Nord; der Schulhof wird auf dem angrenzenden städtischen Grundstück ersetzt). Fertigstellung zum Schuljahr 2029/30.",
          "**Erweiterung der Grundschule Falkenweg** um vier Klassenräume in Modulbauweise. Die Module sind auf eine Nutzungsdauer von mindestens 25 Jahren ausgelegt. Fertigstellung zum Schuljahr 2027/28.",
          "**Umnutzung in der Grundschule Nordstadt:** Zwei bisher von der Stadtteilbibliothek genutzte Räume im Erdgeschoss werden nach deren Umzug in Klassenräume umgebaut (2026).",
        ],
      },
      {
        t: "p",
        text: "Mit diesen drei Maßnahmen entstehen in der Nordstadt zehn zusätzliche Klassenräume; der Fehlbedarf wird damit vollständig gedeckt. Die Grundschule Am Schwanenteich bleibt bis zur Fertigstellung der Erweiterung Birkenallee überbelegt.",
      },
      { t: "h2", text: "8.2 Planungsraum V – Lerchenfeld" },
      {
        t: "ul",
        items: [
          "**Modulbau an der Grundschule Lerchenfeld** mit vier Klassenräumen und zwei Räumen für den Ganztag auf der Erweiterungsfläche an der Heidestraße. Fertigstellung zum Schuljahr 2027/28.",
          "**Änderung der Schulbezirksgrenze:** Die Straßen südlich der Heidestraße (derzeit rund 120 Kinder im Grundschulalter) werden ab dem Schuljahr 2027/28 aufwachsend dem Schulbezirk der Grundschule Am Sportpark (Südstadt) zugeordnet. Der Schulweg verlängert sich für die betroffenen Kinder um höchstens 600 Meter; eine sichere Querung der Heidestraße wird mit dem Tiefbauamt bis Sommer 2027 hergestellt.",
        ],
      },
      {
        t: "p",
        text: "Die neue Schulbezirksgrenze entlastet Lerchenfeld um rund vier Klassen; zusammen mit dem Modulbau wird der Fehlbedarf von acht Räumen gedeckt. Geschwisterkinder, deren ältere Geschwister bereits die Grundschule Heideweg besuchen, können auf Antrag dort aufgenommen werden.",
      },
      { t: "h2", text: "8.3 Planungsraum VII – Mühlenviertel" },
      {
        t: "p",
        text: "Der Bebauungsplan Nr. 52 „Mühlenviertel“ setzt eine Fläche für den Gemeinbedarf mit der Zweckbestimmung Schule und Kindertageseinrichtung fest. Die Verwaltung schlägt vor, dort eine **neue Grundschule** zu errichten, die zunächst zweizügig mit acht Klassenräumen betrieben wird und baulich für eine Erweiterung auf drei Züge vorbereitet ist. Zum Raumprogramm gehören Ganztagsräume, eine Mensa für 180 Essensplätze und eine Einfeldsporthalle, die abends von Vereinen genutzt werden kann. Inbetriebnahme ist zum Schuljahr 2030/31 geplant. Bis dahin werden die Kinder aus den ersten Bauabschnitten von den Grundschulen Mühlenviertel und Am Mühlenteich aufgenommen, die dafür vorübergehend Fachräume als Klassenräume nutzen.",
      },
      { t: "h2", text: "8.4 Ganztagsausbau" },
      {
        t: "p",
        text: "An neun Schulen werden Mensen erweitert, Ruheräume geschaffen und Klassenräume für die Mehrfachnutzung umgerüstet. Die Reihenfolge richtet sich nach der Warteliste und nach dem Anteil von Kindern mit Unterstützungsbedarf. Die ersten drei Standorte (Grundschulen Holunderweg, Am Schwanenteich und Heideweg) sollen bis zum Schuljahr 2026/27 fertig sein.",
      },
      { t: "h2", text: "8.5 Kosten und Zeitplan" },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Räume", "Zeitraum", "Kosten"],
        rows: [
          ["1", "Erweiterung Grundschule Birkenallee", "4", "2027–2029", "7.400.000 €"],
          ["2", "Erweiterung Grundschule Falkenweg (Modulbau)", "4", "2026–2027", "2.950.000 €"],
          ["3", "Umnutzung Grundschule Nordstadt", "2", "2026", "380.000 €"],
          ["4", "Modulbau Grundschule Lerchenfeld", "4", "2026–2027", "3.100.000 €"],
          ["5", "Neubau Grundschule Mühlenviertel (zweizügig, erweiterbar)", "8", "2028–2030", "21.800.000 €"],
          ["6", "Ganztagsausbau an neun Schulen", "–", "2026–2029", "8.600.000 €"],
          ["", "Summe", "22", "", "44.230.000 €"],
        ],
        widths: [1, 6, 1, 2, 2],
      },
      {
        t: "p",
        text: "Im Haushalt 2026 und in der mittelfristigen Finanzplanung bis 2029 sind für Schulbaumaßnahmen bisher 26,5 Mio. € veranschlagt. Für das Ganztagsausbauprogramm erwartet die Verwaltung Fördermittel von voraussichtlich 4,3 Mio. €. Die verbleibende Finanzierungslücke von rund 13,4 Mio. € ist mit der Kämmerei abzustimmen. Angesichts des geplanten Fehlbetrags im Haushalt 2026 von 38,6 Mio. € schlägt die Verwaltung vor, die Maßnahmen 1 bis 4 und 6 vorrangig zu finanzieren und für den Neubau im Mühlenviertel eine Finanzierung über die Erschließungs- und Folgekostenregelung im städtebaulichen Vertrag zu prüfen.",
      },
      {
        t: "note",
        text: "Die Kosten sind Kostenschätzungen nach DIN 276 auf Basis von Flächenkennwerten (Preisstand 3. Quartal 2025) und enthalten 15 % für Unvorhergesehenes. Sie werden mit der Vorplanung konkretisiert.",
      },
      { t: "h1", text: "9 Schulbezirke" },
      {
        t: "p",
        text: "Die Satzung über die Schulbezirke der Grundschulen ist zum Schuljahr 2027/28 zu ändern (Schulbezirksgrenze zwischen Lerchenfeld und Südstadt, Abschnitt 8.2). Für die neue Grundschule im Mühlenviertel wird rechtzeitig vor der Inbetriebnahme ein eigener Schulbezirk gebildet. Die Verwaltung legt die Satzungsänderung nach Abschluss der Anhörung gesondert vor.",
      },
      { t: "h1", text: "10 Beteiligung und weiteres Verfahren" },
      {
        t: "ul",
        items: [
          "Anhörung der Schulkonferenzen der 24 Grundschulen bis 20.03.2026",
          "Beteiligung des Stadtelternrats und der Schulaufsicht im März 2026",
          "Abstimmung mit dem Landkreis Altmoorland wegen der Gastschulkinder",
          "Vorberatung im Jugendhilfeausschuss (Ganztag) am 15.04.2026",
          "Beratung im Schulausschuss am 22.04.2026",
          "Beschluss des Rates am 07.05.2026",
        ],
      },
      {
        t: "p",
        text: "Die nächste reguläre Fortschreibung ist für 2029 vorgesehen. Die Verwaltung berichtet dem Schulausschuss jährlich im Herbst über die tatsächliche Entwicklung der Anmeldezahlen und den Stand der Maßnahmen.",
      },
      { t: "signature", lines: ["Dr. Carolin Siebert", "Beigeordnete, Dezernentin IV"] },
    ],
  },
  // ── Amt 61: Begründung Bebauungsplan Nr. 52 „Mühlenviertel“ (lang) ──
  {
    type: "word",
    id: "fb-bplan-52-muehlenviertel-begruendung",
    title: "Begründung zum Bebauungsplan Nr. 52 „Mühlenviertel“ – Entwurf zur Veröffentlichung",
    kind: "Begründung zum Bebauungsplan",
    fileName: "B-Plan 52 Muehlenviertel Begruendung Entwurf Veroeffentlichung",
    org: "falkenbrueck",
    unit: "fb-amt61",
    author: "fb-moeller",
    date: "2025-06-20",
    tags: [],
    keywords: ["Bebauungsplan Nr. 52", "urbanes Gebiet", "Quartiersgarage", "11,40 ha", "§ 9 Abs. 5 Nr. 3 BauGB"],
    summary:
      "Begründung (Teil A) zum Entwurf des Bebauungsplans für die Konversion der ehemaligen Mühlenwerke: rund 850 Wohnungen, urbanes Gebiet, Grundschule und Kita, Mühlbachpark, Quartiersgarage, Lärm, Altlasten, Flächenbilanz und Kosten. Geeignet für Zusammenfassungen, Leichte Sprache und Abgleich mit Beteiligungsergebnissen und Schulentwicklungsplan.",
    meta: [
      ["Aktenzeichen", "61.2-26-52"],
      ["Verfahrensstand", "Entwurf zur Veröffentlichung nach § 3 Abs. 2 BauGB"],
      ["Status", "öffentlich"],
    ],
    subject: "Bebauungsplan Nr. 52 „Mühlenviertel“ mit 41. Änderung des Flächennutzungsplans im Parallelverfahren – Begründung, Teil A",
    blocks: [
      { t: "h1", text: "1 Anlass, Ziele und Erforderlichkeit der Planung" },
      {
        t: "p",
        text: "Die Mühlenwerke Falkenbrück haben den Mahlbetrieb an der Mühlenstraße im Jahr 2019 endgültig eingestellt. Seitdem liegt das rund 11 ha große Gelände zwischen Mühlenstraße, Bahnstrecke und Mühlbach weitgehend brach. Die Mühlenquartier Falkenbrück GmbH & Co. KG (Vorhabenträgerin) hat die Flächen 2021 erworben; die Stadt ist Eigentümerin des ehemaligen Bauhofgeländes am Speicherweg, das in die Planung einbezogen wird.",
      },
      {
        t: "p",
        text: "Mit dem Bebauungsplan Nr. 52 „Mühlenviertel“ sollen die planungsrechtlichen Voraussetzungen für ein gemischt genutztes, autoarmes Stadtquartier geschaffen werden. Die Planung verfolgt folgende Ziele:",
      },
      {
        t: "ul",
        items: [
          "Schaffung von rund 850 Wohnungen in unterschiedlichen Größen und Wohnformen, davon mindestens 30 % öffentlich geförderter Wohnungsbau",
          "Nutzungsmischung entlang der Mühlenstraße mit Läden, Dienstleistungen und Arbeitsstätten in den Erdgeschossen",
          "Sicherung von Flächen für eine Grundschule und eine Kindertageseinrichtung",
          "Erhalt und Umnutzung des denkmalgeschützten Mühlengebäudes von 1911 als Mittelpunkt des Quartiers",
          "Anlage eines öffentlichen Parks entlang des Mühlbachs und Verbindung zum Grünzug Lerchenfeld",
          "Bündelung des ruhenden Verkehrs in einer Quartiersgarage und Vorrang für Fuß- und Radverkehr",
          "klimaangepasste Gestaltung (Dachbegrünung, Regenwasserrückhaltung, Photovoltaik, Wärmenetz)",
        ],
      },
      {
        t: "p",
        text: "Das Gelände liegt heute überwiegend im Geltungsbereich des Bebauungsplans Nr. 9 „Industriegebiet Mühlenstraße“ aus dem Jahr 1968, der ein Industriegebiet festsetzt. Eine Wohnnutzung ist danach unzulässig. Die Aufstellung eines neuen Bebauungsplans ist deshalb für die städtebauliche Entwicklung und Ordnung erforderlich (§ 1 Abs. 3 BauGB).",
      },
      { t: "h1", text: "2 Lage, Geltungsbereich und Bestand" },
      {
        t: "p",
        text: "Das Plangebiet liegt im Stadtteil Mühlenviertel, rund 1,2 km südöstlich der Altstadt. Es wird im Norden von der Mühlenstraße, im Osten von der Bahnstrecke, im Süden vom Mühlbach und im Westen vom Speicherweg begrenzt. Der Geltungsbereich umfasst die Flurstücke 41/2, 41/5, 42, 43/1, 44 bis 48 sowie Teile des Flurstücks 112 der Flur 23, Gemarkung Falkenbrück, und ist **11,40 ha** groß. Die genaue Abgrenzung ergibt sich aus der Planzeichnung.",
      },
      {
        t: "p",
        text: "Auf dem Gelände stehen das fünfgeschossige Mühlengebäude (Baudenkmal), drei Betonsilos mit einer Höhe von bis zu 38 m, mehrere Lagerhallen und ein Verwaltungsgebäude aus den 1960er-Jahren. Rund 78 % der Fläche sind versiegelt. Der Baumbestand umfasst 64 Bäume; 21 davon, überwiegend Schwarzerlen und Eschen am Mühlbach, sind nach dem Baumgutachten erhaltenswert.",
      },
      { t: "h1", text: "3 Planungsrechtliche Situation" },
      {
        t: "ul",
        items: [
          "**Regionalplan:** Das Plangebiet ist als Allgemeiner Siedlungsbereich dargestellt. Die Planung ist an die Ziele der Raumordnung angepasst.",
          "**Flächennutzungsplan:** Der wirksame Flächennutzungsplan stellt gewerbliche Bauflächen dar. Er wird mit der 41. Änderung im Parallelverfahren nach § 8 Abs. 3 BauGB geändert (Wohnbauflächen, gemischte Bauflächen, Fläche für den Gemeinbedarf, Grünfläche).",
          "**Bebauungsplan Nr. 9:** Die Festsetzungen werden im Geltungsbereich des Bebauungsplans Nr. 52 durch dessen Festsetzungen ersetzt.",
          "**Denkmalschutz:** Das Mühlengebäude ist in die Denkmalliste eingetragen und wird nachrichtlich übernommen (§ 9 Abs. 6 BauGB).",
          "**Überschwemmungsgebiet:** Der südliche Rand des Plangebiets liegt im festgesetzten Überschwemmungsgebiet des Mühlbachs (HQ100). Diese Fläche wird von Bebauung freigehalten und als Grünfläche festgesetzt.",
        ],
      },
      { t: "h1", text: "4 Verfahren" },
      {
        t: "p",
        text: "Der Bebauungsplan wird im Regelverfahren mit Umweltprüfung nach § 2 Abs. 4 BauGB aufgestellt. Ein beschleunigtes Verfahren nach § 13a BauGB scheidet aus, weil die zulässige Grundfläche deutlich mehr als 20.000 m² beträgt. Die Ergebnisse der Umweltprüfung sind im Umweltbericht (Teil B der Begründung) dargestellt.",
      },
      {
        t: "table",
        header: ["Verfahrensschritt", "Datum"],
        rows: [
          ["Aufstellungsbeschluss des Rates", "14.03.2024"],
          ["Frühzeitige Beteiligung der Öffentlichkeit (§ 3 Abs. 1 BauGB)", "18.11. bis 20.12.2024"],
          ["Informationsabend im Mühlengebäude", "26.11.2024"],
          ["Frühzeitige Beteiligung der Behörden (§ 4 Abs. 1 BauGB)", "18.11. bis 20.12.2024"],
          ["Beschluss über die Veröffentlichung im Ausschuss für Stadtentwicklung", "03.07.2025 (geplant)"],
          ["Veröffentlichung im Internet und Beteiligung der Behörden (§ 3 Abs. 2, § 4 Abs. 2 BauGB)", "14.07. bis 15.08.2025 (geplant)"],
          ["Satzungsbeschluss des Rates", "1. Quartal 2026 (geplant)"],
        ],
        widths: [6, 3],
      },
      {
        t: "p",
        text: "In der frühzeitigen Beteiligung sind 386 Beiträge aus der Öffentlichkeit eingegangen, überwiegend über die Beteiligungsplattform. Von 32 beteiligten Behörden und sonstigen Trägern öffentlicher Belange haben 19 eine Stellungnahme abgegeben. Die wesentlichen Änderungen gegenüber dem Vorentwurf sind: Der Hochpunkt am Mühlenplatz wird von neun auf sieben Geschosse reduziert, der Mühlbachpark wird von 1,40 ha auf 1,64 ha vergrößert, und die Quartiersgarage wird vom Mühlbach an die Bahnstrecke verlegt, wo sie zugleich als Lärmschutz dient.",
      },
      { t: "h1", text: "5 Städtebauliches Konzept" },
      {
        t: "p",
        text: "Grundlage des Bebauungsplans ist der Siegerentwurf des städtebaulichen Wettbewerbs 2023 (Planungsbüro Weidenhof & Partner), der nach der frühzeitigen Beteiligung überarbeitet wurde. Entlang der Mühlenstraße bildet eine geschlossene Blockrandbebauung mit fünf Geschossen eine Stadtkante; in den Erdgeschossen sind Läden, Gastronomie und Dienstleistungen vorgesehen. Nach Süden lockert sich die Bebauung zu offenen Wohnhöfen und dreigeschossigen Stadthäusern am Park auf.",
      },
      {
        t: "p",
        text: "Das Mühlengebäude bleibt erhalten und wird mit dem neuen Mühlenplatz zum Mittelpunkt des Quartiers. Vorgesehen sind dort ein Stadtteilbüro, Gastronomie, gemeinschaftlich nutzbare Arbeitsplätze und ein Veranstaltungsraum. Ein siebengeschossiger Hochpunkt an der Nordostecke des Platzes markiert den Eingang ins Quartier. Die Silos werden abgebrochen; der Siloturm 2 kann nach der Machbarkeitsstudie aus Kostengründen nicht erhalten werden.",
      },
      { t: "h1", text: "6 Begründung der Festsetzungen" },
      { t: "h2", text: "6.1 Art der baulichen Nutzung" },
      {
        t: "p",
        text: "Die Wohnbereiche werden als **allgemeine Wohngebiete** (WA1 bis WA4) nach § 4 BauNVO festgesetzt. Gartenbaubetriebe und Tankstellen sind nach § 1 Abs. 6 BauNVO ausgeschlossen, weil sie mit dem angestrebten Charakter eines dichten, verkehrsarmen Quartiers nicht vereinbar sind.",
      },
      {
        t: "p",
        text: "Die Blöcke entlang der Mühlenstraße werden als **urbanes Gebiet** (MU1 und MU2) nach § 6a BauNVO festgesetzt. Das urbane Gebiet erlaubt eine Mischung von Wohnen, Gewerbe und sozialen Einrichtungen, ohne dass die Nutzungen gleichgewichtig sein müssen. Im Erdgeschoss der zur Mühlenstraße orientierten Gebäude ist eine Wohnnutzung nach § 6a Abs. 4 Nr. 1 BauNVO unzulässig. Vergnügungsstätten sind ausgeschlossen.",
      },
      {
        t: "p",
        text: "Für die Grundschule und die Kindertageseinrichtung wird eine **Fläche für den Gemeinbedarf** mit der Zweckbestimmung „Schule und Kindertageseinrichtung“ festgesetzt (§ 9 Abs. 1 Nr. 5 BauGB). Die Fläche von 1,21 ha reicht für eine dreizügige Grundschule mit Ganztag und Einfeldsporthalle sowie eine Kindertageseinrichtung mit fünf Gruppen.",
      },
      { t: "h2", text: "6.2 Maß der baulichen Nutzung" },
      {
        t: "table",
        header: ["Baugebiet", "GRZ", "GFZ", "Vollgeschosse", "Höhe baulicher Anlagen (max.)"],
        rows: [
          ["WA1", "0,4", "1,2", "III bis IV", "14,5 m"],
          ["WA2", "0,4", "1,4", "IV", "14,5 m"],
          ["WA3", "0,4", "1,6", "IV bis V", "17,5 m"],
          ["WA4", "0,35", "0,9", "II bis III", "11,0 m"],
          ["MU1", "0,6", "2,4", "V", "18,5 m"],
          ["MU2", "0,6", "2,8", "V bis VII", "25,0 m"],
          ["Gemeinbedarf", "0,5", "–", "bis III", "13,5 m"],
        ],
        widths: [2, 1, 1, 2, 3],
      },
      {
        t: "p",
        text: "In den urbanen Gebieten werden die Orientierungswerte des § 17 BauNVO eingehalten. In den allgemeinen Wohngebieten WA2 und WA3 überschreitet die festgesetzte GFZ den Orientierungswert von 1,2. Die höhere Dichte ist in der Nähe der Altstadt und des künftigen Bahnhaltepunkts städtebaulich angemessen und dient dem sparsamen Umgang mit Grund und Boden (§ 1a Abs. 2 BauGB); gesunde Wohn- und Arbeitsverhältnisse werden durch die großen Innenhöfe, den angrenzenden Park und die Lärmschutzfestsetzungen gewahrt. Eine Überschreitung der GRZ durch Tiefgaragen bis zu einer GRZ von 0,8 ist zulässig, wenn die Tiefgaragen mit mindestens 60 cm Bodensubstrat überdeckt und begrünt werden.",
      },
      { t: "h2", text: "6.3 Bauweise und überbaubare Grundstücksflächen" },
      {
        t: "p",
        text: "Es wird eine abweichende Bauweise festgesetzt: Gebäude sind mit seitlichem Grenzabstand zu errichten, dürfen aber länger als 50 m sein, höchstens jedoch 65 m. Entlang der Mühlenstraße wird eine Baulinie festgesetzt, um die Stadtkante zu sichern. Im Übrigen werden die überbaubaren Grundstücksflächen durch Baugrenzen bestimmt, die ausreichend Spielraum für die Hochbauplanung lassen.",
      },
      { t: "h2", text: "6.4 Wohnungsbau und sozialer Wohnungsbau" },
      {
        t: "p",
        text: "Nach dem städtebaulichen Konzept entstehen rund 600 Wohnungen in den allgemeinen Wohngebieten und rund 250 Wohnungen in den urbanen Gebieten. Nach dem Baulandmodell der Stadt Falkenbrück verpflichtet sich die Vorhabenträgerin im städtebaulichen Vertrag, mindestens 30 % der Wohnfläche (rund 255 Wohnungen) im öffentlich geförderten Wohnungsbau mit einer Bindung von 25 Jahren zu errichten. Die Wohnungsbaugesellschaft Falkenbrück mbH übernimmt das Baufeld WA2 mit rund 180 Wohnungen. Mindestens 10 % der Wohnungen sollen barrierefrei sein.",
      },
      { t: "h2", text: "6.5 Verkehr und Mobilität" },
      {
        t: "p",
        text: "Das Quartier wird über zwei Anbindungen an die Mühlenstraße erschlossen. Die inneren Erschließungsstraßen werden als Verkehrsflächen besonderer Zweckbestimmung „verkehrsberuhigter Bereich“ festgesetzt. Durchgangsverkehr ist ausgeschlossen. Eine Fuß- und Radbrücke über den Mühlbach verbindet das Quartier mit Lerchenfeld.",
      },
      {
        t: "p",
        text: "Der ruhende Verkehr wird überwiegend in einer **Quartiersgarage** mit 420 Stellplätzen an der Bahnstrecke gebündelt (§ 9 Abs. 1 Nr. 4 BauGB). Zusammen mit 145 Stellplätzen in Tiefgaragen der urbanen Gebiete und 30 Besucherstellplätzen im öffentlichen Raum ergibt sich ein Stellplatzschlüssel von 0,7 Stellplätzen je Wohnung. Die Abweichung von der Stellplatzsatzung wird über ein Mobilitätskonzept begründet: Mobilitätsstation mit 12 Carsharing-Fahrzeugen und Lastenrädern, zwei Fahrradstellplätze je Wohnung, Bushaltestelle mit 10-Minuten-Takt und ein Haltepunkt der Regionalbahn, den das Land für 2029 in Aussicht gestellt hat.",
      },
      {
        t: "p",
        text: "Nach dem Verkehrsgutachten erzeugt das Quartier rund 3.400 zusätzliche Kfz-Fahrten am Tag. Der Knotenpunkt Mühlenstraße/Speicherweg wird dafür mit einer Lichtsignalanlage und einer zusätzlichen Linksabbiegespur ausgebaut. Die Kosten trägt die Vorhabenträgerin.",
      },
      { t: "h2", text: "6.6 Grünflächen und Begrünung" },
      {
        t: "ul",
        items: [
          "Öffentliche Grünfläche „Mühlbachpark“ mit 1,64 ha, darin zwei Spielplätze mit zusammen 2.500 m² und ein Bolzplatz",
          "Erhalt der 21 erhaltenswerten Bäume am Mühlbach (§ 9 Abs. 1 Nr. 25 b BauGB)",
          "Pflanzgebot: je angefangene 400 m² Grundstücksfläche ein standortgerechter Laubbaum",
          "extensive Begrünung aller Flachdächer und flach geneigten Dächer bis 15 Grad mit mindestens 10 cm Substrat, soweit sie nicht für technische Anlagen benötigt werden",
          "Fassadenbegrünung der Quartiersgarage auf mindestens 50 % der Fassadenfläche",
        ],
      },
      { t: "h2", text: "6.7 Wasserwirtschaft" },
      {
        t: "p",
        text: "Das Niederschlagswasser wird nach dem Prinzip der Schwammstadt im Gebiet zurückgehalten: Retentionsdächer, Mulden und Baumrigolen im Straßenraum und ein Regenrückhaltebecken am Mühlbach (Fläche für die Abwasserbeseitigung, 0,52 ha). Die Einleitung in den Mühlbach wird auf 10 Liter je Sekunde und Hektar gedrosselt. Das Schmutzwasser wird über einen neuen Kanal in der Mühlenstraße zum Klärwerk abgeleitet.",
      },
      { t: "h2", text: "6.8 Immissionsschutz" },
      {
        t: "p",
        text: "Nach dem Schallgutachten erreicht der Schienenverkehrslärm an der Ostseite des Plangebiets Beurteilungspegel von bis zu 68 dB(A) am Tag und 61 dB(A) in der Nacht. Die Orientierungswerte der DIN 18005 für allgemeine Wohngebiete (55 dB(A) tags, 45 dB(A) nachts) werden dort deutlich überschritten. Die Quartiersgarage wirkt als Lärmschutzriegel; dahinter sinken die Pegel um bis zu 12 dB(A). Für die verbleibenden Überschreitungen werden Lärmpegelbereiche nach DIN 4109 festgesetzt, schutzbedürftige Räume sind zur lärmabgewandten Seite zu orientieren, und Schlafräume erhalten schallgedämmte Lüftungseinrichtungen.",
      },
      { t: "h2", text: "6.9 Altlasten" },
      {
        t: "p",
        text: "Die Bodenuntersuchungen haben im Bereich der ehemaligen Betriebstankstelle und der Werkstatthalle Verunreinigungen mit Mineralölkohlenwasserstoffen und polyzyklischen aromatischen Kohlenwasserstoffen (PAK) ergeben. Diese Flächen werden nach § 9 Abs. 5 Nr. 3 BauGB als Flächen gekennzeichnet, deren Böden erheblich mit umweltgefährdenden Stoffen belastet sind. Vor einer Bebauung ist eine Sanierung nach dem mit der Unteren Bodenschutzbehörde abgestimmten Sanierungsplan durchzuführen. Die Kosten trägt die Vorhabenträgerin.",
      },
      { t: "h2", text: "6.10 Klimaschutz und Energie" },
      {
        t: "p",
        text: "Auf mindestens 50 % der Dachflächen sind Photovoltaikanlagen zu errichten (§ 9 Abs. 1 Nr. 23 b BauGB); eine Kombination mit Dachbegrünung ist zulässig und erwünscht. Die Wärmeversorgung erfolgt über ein Nahwärmenetz der Stadtwerke Falkenbrück GmbH, das eine Großwärmepumpe mit Abwärme aus dem Abwasserkanal nutzt. Das Quartier ist im Entwurf des kommunalen Wärmeplans als Wärmenetzgebiet vorgesehen.",
      },
      { t: "h1", text: "7 Flächenbilanz" },
      {
        t: "table",
        header: ["Fläche", "Größe", "Anteil"],
        rows: [
          ["Allgemeine Wohngebiete WA1 bis WA4", "4,92 ha", "43,2 %"],
          ["Urbane Gebiete MU1 und MU2", "1,38 ha", "12,1 %"],
          ["Fläche für den Gemeinbedarf (Schule, Kita)", "1,21 ha", "10,6 %"],
          ["Öffentliche Grünfläche (Mühlbachpark)", "1,64 ha", "14,4 %"],
          ["Verkehrsflächen einschließlich Quartiersgarage", "1,73 ha", "15,2 %"],
          ["Fläche für die Abwasserbeseitigung (Regenrückhaltung)", "0,52 ha", "4,6 %"],
          ["Geltungsbereich gesamt", "11,40 ha", "100,0 %"],
        ],
        widths: [5, 2, 2],
      },
      { t: "h1", text: "8 Umweltbelange (Kurzfassung)" },
      {
        t: "p",
        text: "Der Umweltbericht kommt zu dem Ergebnis, dass die Planung insgesamt zu einer Verbesserung der Umweltsituation führt: Der Versiegelungsgrad sinkt von rund 78 % auf rund 61 %, Altlasten werden saniert, und mit dem Mühlbachpark entsteht eine zusammenhängende Grünfläche. Erhebliche Beeinträchtigungen ergeben sich vor allem für den Artenschutz.",
      },
      {
        t: "p",
        text: "Im Mühlengebäude und in den Silos wurden Quartiere der Zwergfledermaus und Brutplätze von Mauerseglern nachgewiesen. Vor dem Abbruch der Silos werden deshalb als vorgezogene Ausgleichsmaßnahmen 40 Nistkästen für Mauersegler und 15 Fledermauskästen an Gebäuden in der Umgebung angebracht. Abbrucharbeiten sind nur außerhalb der Brutzeit zulässig. Ein Verstoß gegen die Verbote des § 44 BNatSchG ist bei Umsetzung dieser Maßnahmen nicht zu erwarten. Der Eingriff in Natur und Landschaft wird innerhalb des Plangebiets ausgeglichen.",
      },
      { t: "h1", text: "9 Soziale Infrastruktur" },
      {
        t: "p",
        text: "Bei rund 850 Wohnungen und durchschnittlich 2,2 Personen je Haushalt ist mit etwa 1.900 Bewohnerinnen und Bewohnern zu rechnen. Nach den Erfahrungswerten der Schulentwicklungsplanung werden im Quartier in den ersten zehn Jahren nach Bezug rund 210 Kinder im Grundschulalter leben. Die bestehenden Grundschulen im Mühlenviertel können diese Kinder nicht aufnehmen. Die Fläche für den Gemeinbedarf ermöglicht eine neue Grundschule; Zügigkeit und Zeitpunkt werden in der laufenden Fortschreibung des Schulentwicklungsplans festgelegt. Die Kindertageseinrichtung mit fünf Gruppen (rund 90 Plätze) errichtet die Vorhabenträgerin und überlässt sie der Stadt zur Nutzung.",
      },
      { t: "h1", text: "10 Kosten, Finanzierung und Bodenordnung" },
      {
        t: "p",
        text: "Die Stadt schließt mit der Vorhabenträgerin vor dem Satzungsbeschluss einen städtebaulichen Vertrag nach § 11 BauGB. Darin verpflichtet sich die Vorhabenträgerin insbesondere zur Übernahme der Planungs- und Gutachterkosten, zur Herstellung der öffentlichen Erschließungsanlagen (geschätzt 6,9 Mio. €) und des Mühlbachparks (2,1 Mio. €), zur Altlastensanierung, zum Bau der Kindertageseinrichtung sowie zu einem Folgekostenbeitrag für die Grundschule von 3,2 Mio. €. Die öffentlichen Flächen werden nach Fertigstellung unentgeltlich an die Stadt übertragen.",
      },
      {
        t: "p",
        text: "Der Stadt entstehen Kosten für den Bau der Grundschule, soweit sie nicht durch den Folgekostenbeitrag gedeckt sind, sowie für die dauerhafte Unterhaltung der öffentlichen Straßen und Grünflächen (geschätzt 185.000 € jährlich). Eine Umlegung ist nicht erforderlich; der Tausch des ehemaligen Bauhofgeländes gegen die Fläche für den Gemeinbedarf wird vertraglich geregelt.",
      },
      { t: "h1", text: "11 Rechtsgrundlagen" },
      {
        t: "ul",
        items: [
          "Baugesetzbuch (BauGB) in der Fassung der Bekanntmachung vom 03.11.2017, zuletzt geändert durch Gesetz vom 20.12.2023",
          "Baunutzungsverordnung (BauNVO) in der Fassung der Bekanntmachung vom 21.11.2017, zuletzt geändert durch Gesetz vom 03.07.2023",
          "Planzeichenverordnung (PlanZV) vom 18.12.1990, zuletzt geändert durch Gesetz vom 14.06.2021",
          "Bundesnaturschutzgesetz (BNatSchG)",
          "Landesbauordnung (LBauO) und Kommunalverfassung (KV) in der jeweils geltenden Fassung",
        ],
      },
      { t: "signature", lines: ["Im Auftrag", "Lars Möller", "Stadtplanungsamt"] },
    ],
  },
  // ── Amt 63: Gesprächsnotiz Bauberatung (kurz, unstrukturiert; Bezug zum Verlauf Lohmann) ──
  {
    type: "word",
    id: "fb-gespraechsnotiz-bauberatung-heideweg-9",
    title: "Gesprächsnotiz Bauberatung Anbau und Carport Heideweg 9",
    kind: "Gesprächsnotiz",
    fileName: "2025-03-18 Gespraechsnotiz Bauberatung Heideweg 9",
    org: "falkenbrueck",
    unit: "fb-amt63",
    author: "fb-lindhorst",
    date: "2025-03-18",
    tags: ["unstrukturiert"],
    keywords: ["Heideweg 9", "Bebauungsplan Nr. 31", "Doppelcarport", "Befreiung", "Walnuss"],
    summary:
      "Stichpunktartige Notiz einer Bauberatung mit Bauherr Marc Lohmann zu Anbau, Dachterrasse und Doppelcarport: GRZ, Baugrenze, Stellplätze, Unterlagen, geschützter Walnussbaum. Wichtig für den Abgleich mit dem späteren Mailverlauf: Damals war ausdrücklich keine zweite Wohnung geplant.",
    meta: [
      ["Aktenzeichen", "63.0-BB-0211/25"],
      ["Status", "intern"],
    ],
    subject: "Bauberatung Heideweg 9 – Anbau Wohnzimmer, Dachterrasse, Doppelcarport",
    blocks: [
      { t: "p", text: "18.03.25, 10:00–10:40, Zi. 3.07 – Hr. Marc Lohmann (Bauherr), Fr. Lindhorst" },
      { t: "p", text: "Heideweg 9, Lerchenfeld (Flur 4, Flst. 233, ca. 612 m²), EFH Bj. 1987, 1 WE" },
      { t: "p", text: "**Vorhaben** (Handskizze, keine Pläne):" },
      {
        t: "ul",
        items: [
          "Anbau Wohnzimmer hinten, 1-geschossig, ca. 6,5 x 5,8 m, Flachdach mit Dachterrasse",
          "Doppelcarport an Grenze zu Nr. 11, ca. 7,5 m lang",
        ],
      },
      { t: "p", text: "**Planungsrecht:**" },
      {
        t: "ul",
        items: [
          "Bebauungsplan Nr. 31 „Lerchenfeld-Süd“: WA, GRZ 0,3, I Vollgeschoss, hintere Baugrenze 15 m",
          "GRZ überschlägig 0,25; mit Carport/Zufahrt/Terrasse ca. 0,41 (bis 0,45 ok) – knapp!",
          "Anbau ragt ca. 1,20 m über Baugrenze → Befreiung § 31 Abs. 2 BauGB schriftl. beantragen + begründen, Nachbarzustimmung hilfreich",
          "Dachterrasse: Geländer zählt bei Abstandsflächen mit (3 m)",
          "Carport an Grenze ok (max. 9 m, Wandhöhe 3 m)",
        ],
      },
      { t: "p", text: "**Stellplätze:** bleibt 1 WE → kein zusätzl. Stellplatz. **Falls 2. WE (Einlieger): + 1 Stellplatz, im Lageplan nachweisen!** – Hr. L.: „Nein, keine zweite Wohnung geplant.“" },
      { t: "p", text: "**Unterlagen:** Entwurfsverfasser/in mit Bauvorlageberechtigung, amtl. Lageplan (max. 6 Monate alt!), Bauzeichnungen 1:100, Baubeschreibung, GRZ-Berechnung, Standsicherheitsnachweis, ggf. Befreiungsantrag" },
      {
        t: "ul",
        items: [
          "Walnuss hinten, Umfang ca. 1,30 m, 3 m vom Anbau → Baumschutzsatzung! Hr. L.: „Der kommt eh weg.“ → Fällung genehmigungspflichtig (Amt 67)",
          "Bearbeitung z. Zt. ca. 3 Monate – Hr. L. unzufrieden, Handwerker ab Juni",
          "Keine verbindliche Auskunft; Bauvoranfrage empfohlen – Hr. L. will gleich Bauantrag stellen",
        ],
      },
      { t: "p", text: "gez. Lindhorst" },
    ],
  },
  // ── Amt 67: Bescheid zum Baumfällantrag (kurz, mit Rechtsbehelfsbelehrung; Anhang im Verlauf Horn) ──
  {
    type: "word",
    id: "fb-bescheid-baumfaellung-amselweg-17",
    title: "Bescheid zum Antrag auf Fällung eines Bergahorns (Amselweg 17)",
    kind: "Bescheid",
    fileName: "2026-02-04 Bescheid Baumfaellantrag Amselweg 17",
    org: "falkenbrueck",
    unit: "fb-amt67",
    author: "fb-friedrich",
    date: "2026-02-04",
    tags: ["personendaten"],
    keywords: ["Amselweg 17", "Bergahorn", "Baumschutzsatzung", "Widerspruch", "67.3-BS-0034/26"],
    summary:
      "Ablehnung der Fällung eines geschützten Bergahorns im Garten einer Bürgerin, verbunden mit der Erlaubnis für einen Pflegeschnitt; mit Begründung und Rechtsbehelfsbelehrung. Gut für Anonymisierung und Leichte Sprache.",
    meta: [["Aktenzeichen", "67.3-BS-0034/26"]],
    recipient: ["Frau", "Elisabeth Horn", "Amselweg 17", "00421 Falkenbrück"],
    subject: "Antrag auf Fällung eines Bergahorns auf dem Grundstück Amselweg 17 (Gemarkung Südstadt, Flur 6, Flurstück 88) – Ihr Antrag vom 11.01.2026",
    blocks: [
      { t: "p", text: "Sehr geehrte Frau Horn," },
      { t: "p", text: "auf Ihren Antrag vom 11.01.2026 ergeht folgender Bescheid:" },
      {
        t: "ol",
        items: [
          "Die Erlaubnis zur Fällung des Bergahorns (Stammumfang 186 cm in 1 m Höhe) im rückwärtigen Garten des Grundstücks Amselweg 17 wird **abgelehnt**.",
          "Erlaubt wird ein fachgerechter Pflegeschnitt: Entfernen des Totholzes und Einkürzen der über das Gartenhaus ragenden Äste um höchstens 2 m. Der Schnitt ist bis zum 28.02.2026 oder ab dem 01.10.2026 auszuführen.",
          "Für diesen Bescheid wird eine Verwaltungsgebühr von 45,00 € erhoben.",
        ],
      },
      { t: "h3", text: "Begründung" },
      {
        t: "p",
        text: "Der Baum ist nach § 3 der Baumschutzsatzung der Stadt Falkenbrück geschützt, weil sein Stammumfang mehr als 80 cm beträgt. Bei der Ortsbesichtigung am 20.01.2026 wurde er als vital und verkehrssicher eingestuft. Der im Dezember abgebrochene Ast ist ein Einzelschaden, der mit dem Pflegeschnitt behoben wird. Laubfall, Samenflug und Verschattung sind nach § 6 Abs. 3 der Satzung keine Gründe für eine Ausnahme. Wir verstehen, dass die Gartenpflege für Sie mühsam ist; eine Fällung lässt sich damit rechtlich aber nicht begründen.",
      },
      { t: "h3", text: "Rechtsbehelfsbelehrung" },
      {
        t: "p",
        text: "Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch erhoben werden. Der Widerspruch ist schriftlich oder zur Niederschrift bei der Stadt Falkenbrück, Amt 67 – Grünflächen und Umwelt, Rathausplatz 1, 00417 Falkenbrück, einzulegen.",
      },
      { t: "p", text: "Mit freundlichen Grüßen" },
      { t: "signature", lines: ["Im Auftrag", "Moritz Friedrich"] },
    ],
  },
  // ── Amt 53 mit Stabsstelle Klimaschutz: Hitzeaktionsplan (mittel) ──
  {
    type: "word",
    id: "fb-hitzeaktionsplan-2025",
    title: "Hitzeaktionsplan der Stadt Falkenbrück 2025",
    kind: "Hitzeaktionsplan",
    fileName: "Hitzeaktionsplan Falkenbrueck 2025",
    org: "falkenbrueck",
    unit: "fb-amt53",
    author: "fb-bauer",
    date: "2025-05-12",
    tags: [],
    keywords: ["Hitzewarnstufe 2", "Kühle Orte", "Hitzetelefon", "Koordinierungsgruppe Hitze", "185.000 €"],
    summary:
      "Gemeinsamer Plan von Gesundheitsamt und Stabsstelle Klimaschutz: gefährdete Gruppen mit Zahlen, Warnstufen und Maßnahmen, Kühle Orte, Trinkbrunnen, Hitzetelefon, Kosten 2025/2026. Gut für Leichte Sprache, Checklisten für Kitas oder eine Pressemitteilung.",
    meta: [
      ["Aktenzeichen", "53.4-120.30/25"],
      ["Federführung", "Gesundheitsamt mit Stabsstelle Klimaschutz"],
      ["Status", "öffentlich"],
    ],
    subject: "Hitzeaktionsplan – Schutz der Gesundheit bei Hitze (Fassung 2025, zur Beschlussfassung im Verwaltungsvorstand am 20.05.2025)",
    blocks: [
      { t: "h1", text: "1 Anlass" },
      {
        t: "p",
        text: "Hitze ist in Deutschland das größte klimabedingte Gesundheitsrisiko. Auch in Falkenbrück nehmen heiße Tage zu: Im Mittel der Jahre 1991 bis 2020 wurden an der städtischen Messstation 8,6 Tage mit mindestens 30 °C gezählt, im Jahr 2018 waren es 21, 2022 19 und 2024 14. In der Altstadt und im Hafenviertel kühlt es in solchen Phasen auch nachts kaum ab; dort wurden 2024 elf Tropennächte mit mindestens 20 °C gemessen.",
      },
      {
        t: "p",
        text: "Nach Schätzungen des Gesundheitsamts sind in Falkenbrück in heißen Sommern rund zehn zusätzliche Sterbefälle auf Hitze zurückzuführen, ganz überwiegend bei Menschen über 75 Jahren. Hinzu kommen Rettungsdiensteinsätze wegen Kreislaufproblemen und Austrocknung: Im Juli und August 2024 verzeichnete die Leitstelle 312 solcher Einsätze, fast doppelt so viele wie in den kühleren Sommermonaten 2021.",
      },
      {
        t: "p",
        text: "Der Rat hat mit dem Klimaanpassungskonzept am 18.04.2024 beschlossen, einen Hitzeaktionsplan aufzustellen. Der vorliegende Plan wurde vom Gesundheitsamt gemeinsam mit der Stabsstelle Klimaschutz erarbeitet und mit den beteiligten Ämtern, den Wohlfahrtsverbänden und dem Seniorenbeirat abgestimmt.",
      },
      { t: "h1", text: "2 Ziele" },
      {
        t: "ul",
        items: [
          "hitzebedingte Erkrankungen und Todesfälle vermeiden",
          "besonders gefährdete Menschen gezielt erreichen und schützen",
          "die Bevölkerung rechtzeitig und verständlich informieren",
          "das Handeln von Stadtverwaltung, Einrichtungen und Diensten bei Hitze abstimmen",
          "die Stadt langfristig an Hitze anpassen (Grün, Verschattung, Entsiegelung)",
        ],
      },
      { t: "h1", text: "3 Besonders gefährdete Gruppen" },
      {
        t: "table",
        header: ["Gruppe", "Anzahl in Falkenbrück", "Erreichbar über"],
        rows: [
          ["Menschen ab 75 Jahren", "22.840", "Seniorenbüros, Hausarztpraxen, Apotheken"],
          ["Bewohnerinnen und Bewohner von Pflegeheimen", "2.310 (31 Einrichtungen)", "Heimaufsicht, Einrichtungsleitungen"],
          ["Ambulant versorgte Pflegebedürftige", "rund 6.900", "46 ambulante Pflegedienste"],
          ["Kinder unter 3 Jahren", "4.950", "Kitas, Kindertagespflege, Hebammen"],
          ["Wohnungslose Menschen", "rund 260", "Streetwork, Tagestreff Hafenviertel"],
          ["Städtische Beschäftigte im Außendienst", "rund 480", "Ämter 66 und 67, Ordnungsdienst"],
        ],
        widths: [4, 3, 4],
      },
      { t: "h1", text: "4 Organisation" },
      {
        t: "p",
        text: "Die **Koordinierungsgruppe Hitze** wird vom Gesundheitsamt geleitet. Ihr gehören die Stabsstelle Klimaschutz, das Sozialamt, das Jugendamt (Kindertagesbetreuung), das Schulverwaltungsamt, das Sportamt, das Ordnungsamt, die Feuerwehr mit dem Rettungsdienst, das Amt für Grünflächen und Umwelt sowie die Pressestelle an. Sie tagt jährlich im April zur Vorbereitung und im September zur Auswertung. Ab Hitzewarnstufe 2 findet werktags um 9:00 Uhr eine kurze Telefonkonferenz statt.",
      },
      { t: "h1", text: "5 Warnstufen und Maßnahmen" },
      {
        t: "table",
        header: ["Stufe", "Auslöser", "Maßnahmen"],
        rows: [
          ["Stufe 0 – Vorbereitung", "Hitzesaison 1. Mai bis 30. September", "Information aller Einrichtungen, Trinkbrunnen in Betrieb, Kühle-Orte-Karte online"],
          ["Stufe 1 – Vorwarnung", "Vorhersage: gefühlte Temperatur über 32 °C an zwei Tagen in Folge", "Hinweise an Kitas, Schulen und Pflegeeinrichtungen, Pressemitteilung, Hitzetelefon besetzt"],
          ["Hitzewarnstufe 2 – starke Wärmebelastung", "amtliche Hitzewarnung", "längere Öffnungszeiten der Kühlen Orte, Wasserausgabe an Wohnungslose, Außendienst in die Morgenstunden, Sport im Freien nach 15 Uhr absagen"],
          ["Hitzewarnstufe 3 – extreme Hitze", "gefühlte Temperatur über 38 °C", "tägliche Lagebesprechung, Telefonkette des Besuchsdienstes für Alleinlebende, Rettungsdienst verstärken, Großveranstaltungen prüfen"],
        ],
        widths: [3, 4, 6],
      },
      { t: "h1", text: "6 Maßnahmen im Einzelnen" },
      { t: "h2", text: "6.1 Information und Hitzetelefon" },
      {
        t: "p",
        text: "Ab Stufe 1 ist das **Hitzetelefon** des Gesundheitsamts unter 069 90009-575 montags bis freitags von 8 bis 18 Uhr besetzt. Es berät zu Trinken, Kühlen und Medikamenten und vermittelt den Besuchsdienst. Informationen gibt es in sechs Sprachen und in Leichter Sprache, auf www.falkenbrueck.example/hitze und als Aushang in Apotheken und Arztpraxen.",
      },
      { t: "h2", text: "6.2 Kühle Orte" },
      {
        t: "p",
        text: "Im Sommer 2025 stehen 17 **Kühle Orte** zur Verfügung: die Zentrale der Stadtbibliothek und vier Stadtteilbibliotheken, das Foyer des Rathauses, drei Seniorentreffs, der Tagestreff Hafenviertel und sieben Kirchen. Sie bieten Sitzplätze, Wasser und Ruhe ohne Konsumzwang. Bei Hitzewarnstufe 2 verlängern die Bibliotheken ihre Öffnungszeiten bis 20 Uhr.",
      },
      { t: "h2", text: "6.3 Trinkbrunnen" },
      {
        t: "p",
        text: "Nach § 50 Abs. 1 WHG gehört die Bereitstellung von Trinkwasser an öffentlichen Orten zur Daseinsvorsorge. Derzeit betreiben die Stadtwerke 14 Trinkbrunnen. Bis 2027 kommen zehn weitere hinzu, vorrangig in der Altstadt, im Hafenviertel und an Spielplätzen.",
      },
      { t: "h2", text: "6.4 Kitas, Schulen und Sport" },
      {
        t: "p",
        text: "Alle Kitas und Schulen erhalten eine Checkliste Hitzeschutz (Lüften am frühen Morgen, Verschattung, Trinkpausen, Sonnenschutz im Außengelände). Das Sportamt informiert die Vereine; Hallen und Plätze werden bei Hitzewarnstufe 2 nachmittags nur für Training ohne hohe Belastung freigegeben.",
      },
      { t: "h2", text: "6.5 Pflege, Wohnungslose und Beschäftigte" },
      {
        t: "ul",
        items: [
          "Die Heimaufsicht prüft bei Regelbegehungen die Hitzeschutzkonzepte der Pflegeheime.",
          "Streetwork verteilt Wasser, Sonnenschutz und Kopfbedeckungen; der Tagestreff Hafenviertel öffnet an Hitzetagen auch nachmittags.",
          "Für Beschäftigte im Außendienst gilt eine mit dem Gesamtpersonalrat abgestimmte Regelung: Arbeitsbeginn ab 6 Uhr, Pausen im Schatten, Getränke werden gestellt.",
        ],
      },
      { t: "h2", text: "6.6 Langfristige Anpassung" },
      {
        t: "p",
        text: "Die Stabsstelle Klimaschutz erstellt bis Ende 2025 eine Hitzekarte für das Stadtgebiet. Sie ist Grundlage für Entsiegelung, Baumpflanzungen (Ziel: 1.000 zusätzliche Straßenbäume bis 2030) und ein Förderprogramm für Dach- und Fassadenbegrünung.",
      },
      { t: "h1", text: "7 Kosten" },
      {
        t: "table",
        header: ["Maßnahme", "2025", "2026"],
        rows: [
          ["Hitzetelefon (Aushilfen, Technik)", "18.000 €", "20.000 €"],
          ["Informationsmaterial, Übersetzungen", "22.000 €", "9.000 €"],
          ["Trinkbrunnen (je fünf neue Brunnen)", "95.000 €", "145.000 €"],
          ["Ausstattung Kühle Orte", "31.000 €", "12.000 €"],
          ["Aufsuchende Hilfe für Wohnungslose", "19.000 €", "19.000 €"],
          ["Summe", "185.000 €", "205.000 €"],
        ],
        widths: [5, 2, 2],
      },
      {
        t: "p",
        text: "Die Mittel für 2025 sind im Teilhaushalt 53 und im Budget der Stabsstelle Klimaschutz veranschlagt.",
      },
      { t: "h1", text: "8 Auswertung" },
      {
        t: "p",
        text: "Nach jeder Hitzesaison wertet die Koordinierungsgruppe aus: Zahl der Hitzewarnungen, hitzebedingte Rettungsdiensteinsätze, Anrufe beim Hitzetelefon und Besuche der Kühlen Orte. Der Bericht wird im November dem Ausschuss für Soziales und Gesundheit vorgelegt.",
      },
      { t: "signature", lines: ["Dr. Konstantin Bauer", "Leiter Gesundheitsamt", "", "Hanna König", "Klimaschutzmanagerin"] },
    ],
  },
  // ── Amt 51 ASD: Vermerk Fallberatung (personendaten, teils Mitschrift) ──
  {
    type: "word",
    id: "fb-asd-vermerk-fallberatung-8a",
    title: "Vermerk über eine Fallberatung nach § 8a SGB VIII (ASD Nordstadt)",
    kind: "Vermerk",
    fileName: "2026-04-22 Vermerk Fallberatung 8a ASD Nordstadt",
    org: "falkenbrueck",
    unit: "fb-amt51-asd",
    author: "fb-oltmanns",
    date: "2026-04-22",
    tags: ["personendaten", "unstrukturiert"],
    keywords: ["§ 8a Abs. 1 SGB VIII", "Brettschneider", "Schutzplan", "Kita Sonnenblume", "51.3-ASD-N-2026-0147"],
    summary:
      "Vermerk über die kollegiale Gefährdungseinschätzung zu einer Familie mit zwei Kindern: erfundene Familiendaten, Meldungen von Kita und Schule, Mitschrift in Stichpunkten, Ergebnis und vereinbarte Schritte. Für Anonymisierungs- und Strukturierungsübungen.",
    meta: [
      ["Aktenzeichen", "51.3-ASD-N-2026-0147"],
      ["Status", "vertraulich – Sozialdaten (§ 65 SGB VIII)"],
    ],
    subject: "Fallberatung zur Gefährdungseinschätzung im Zusammenwirken mehrerer Fachkräfte (§ 8a Abs. 1 SGB VIII) – Familie Brettschneider",
    blocks: [
      {
        t: "table",
        header: ["Angabe", "Inhalt"],
        rows: [
          ["Datum, Zeit", "21.04.2026, 13:30 bis 14:45 Uhr"],
          ["Ort", "Besprechungsraum ASD Nordstadt, Birkenallee 2"],
          ["Teilnehmende", "Svenja Oltmanns (fallführend), Melanie Pietsch (Abteilungsleitung), Jens Dahlke (ASD Nordstadt), Aylin Toprak (ASD Südstadt)"],
          ["Anlass", "Mitteilung der Kita Sonnenblume vom 14.04.2026, Mitteilung der Grundschule Birkenallee vom 16.04.2026"],
        ],
        widths: [2, 7],
      },
      { t: "h2", text: "Familie" },
      {
        t: "table",
        header: ["Name", "Geburtsdatum", "Anmerkung"],
        rows: [
          ["Nadine Brettschneider", "14.07.1993", "Mutter, allein sorgeberechtigt, seit 10/2025 ohne Arbeit (Bürgergeld)"],
          ["Dennis Hartwig", "02.03.1990", "Lebensgefährte der Mutter seit 2024, lebt überwiegend im Haushalt"],
          ["Leon Brettschneider", "03.02.2017", "3. Klasse Grundschule Birkenallee"],
          ["Mila Brettschneider", "21.09.2021", "Kita Sonnenblume, Gruppe „Igel“"],
          ["Tobias Lenz", "11.10.1988", "Vater beider Kinder, wohnt in Altmoor, Umgang unregelmäßig"],
        ],
        widths: [3, 2, 6],
      },
      { t: "p", text: "Anschrift des Haushalts: Birkenallee 41, 3. OG links, 00419 Falkenbrück. Telefon der Mutter: 040 66969-482. Der Familie ist der ASD bekannt (Beratung nach der Trennung, beendet im November 2023)." },
      { t: "h2", text: "Mitteilungen" },
      {
        t: "ul",
        items: [
          "**Kita:** Mila kommt seit März mehrfach ohne Frühstück und in nicht wettergerechter Kleidung. Am 13.04. Hämatom am linken Oberarm (Foto in der Kita-Akte). Mila auf Nachfrage: „Dennis war böse.“ Mutter beim Abholen: Sturz vom Hochbett.",
          "**Schule:** Leon seit Februar 23 Fehltage, davon 15 unentschuldigt. Wirkt müde, in den Pausen aggressiv. Mutter telefonisch kaum erreichbar, auf zwei Briefe keine Reaktion.",
        ],
      },
      { t: "h2", text: "Mitschrift Beratung (Stichpunkte)" },
      {
        t: "ul",
        items: [
          "Ressourcen: Mutter 2023 kooperativ, Bindung Mutter–Kinder von Kita als gut beschrieben, Oma mütterlicherseits in der Südstadt (Kontakt? klären), Kitaplatz stabil",
          "Risiken: Rolle Hr. Hartwig unklar; Kita: Mutter „roch nach Alkohol“ beim Abholen (1x, 09.04.); Schulabsentismus; Hämatom ungeklärt; Mietrückstand (hat Mutter im Herbst selbst erwähnt)",
          "Hypothesen: Überforderung (Arbeitslosigkeit, Schulden)? Gewalt durch Partner? eher Vernachlässigung als Misshandlung?",
          "Fr. Pietsch: Hämatom ernst nehmen → kinderärztliche Vorstellung, Schweigepflichtentbindung",
          "Hr. Dahlke: erst Hausbesuch, dann Hilfe anbieten – Mutter nicht überrollen",
          "offen: Kindesvater einbeziehen ja/nein → erst mit Mutter besprechen",
        ],
      },
      { t: "h2", text: "Ergebnis der Gefährdungseinschätzung" },
      {
        t: "p",
        text: "Es liegen gewichtige Anhaltspunkte für eine Gefährdung des Wohls beider Kinder vor (ungeklärtes Hämatom, Schulabsentismus, Hinweise auf Vernachlässigung). Eine akute Gefährdung, die eine Inobhutnahme nach § 42 SGB VIII erfordert, sehen die Fachkräfte derzeit nicht. Einschätzung: **latente Kindeswohlgefährdung mit Hilfe- und Schutzbedarf.**",
      },
      { t: "h2", text: "Vereinbarte Schritte" },
      {
        t: "table",
        header: ["Was", "Wer", "Bis"],
        rows: [
          ["Unangekündigter Hausbesuch zu zweit", "Oltmanns, Dahlke", "24.04.2026"],
          ["Gespräch mit der Mutter, Schutzplan (täglicher Kitabesuch, Schulbesuch Leon, Vorstellung bei der Kinderärztin)", "Oltmanns", "30.04.2026"],
          ["Kinderärztliche Untersuchung Mila, Schweigepflichtentbindung", "Mutter, Oltmanns", "08.05.2026"],
          ["Angebot Sozialpädagogische Familienhilfe nach § 31 SGB VIII (6 Fachleistungsstunden je Woche), Hilfeplangespräch", "Oltmanns", "15.05.2026"],
          ["Rückmeldung an Kita und Schule (nur Ergebnis, keine Einzelheiten)", "Oltmanns", "30.04.2026"],
          ["Erneute Fallberatung", "Team Nordstadt", "19.05.2026"],
        ],
        widths: [6, 2, 2],
      },
      {
        t: "p",
        text: "Verweigert die Mutter den Kontakt oder ergeben sich neue Hinweise auf Gewalt, wird sofort die Abteilungsleitung informiert; dann ist die Anrufung des Familiengerichts nach § 8a Abs. 2 SGB VIII zu prüfen.",
      },
      { t: "signature", lines: ["Svenja Oltmanns", "Sozialarbeiterin ASD", "", "Kenntnis genommen: Pietsch, 22.04.2026"] },
    ],
  },
  // ── Amt 41: Kulturförderrichtlinie (Entwurf mit eingebauten Widersprüchen) ──
  {
    type: "word",
    id: "fb-kulturfoerderrichtlinie-entwurf",
    title: "Kulturförderrichtlinie der Stadt Falkenbrück – Entwurf",
    kind: "Richtlinie",
    fileName: "Kulturfoerderrichtlinie Entwurf Stand 2025-09-23",
    org: "falkenbrueck",
    unit: "fb-amt41",
    author: "fb-haas",
    date: "2025-09-23",
    tags: ["widersprueche"],
    keywords: ["Kulturförderrichtlinie", "Fehlbedarfsfinanzierung", "Kulturbeirat", "Stadtteilkulturfonds", "zuwendungsfähigen Ausgaben"],
    summary:
      "Entwurf einer neuen Förderrichtlinie für Kunst und Kultur mit Merkblatt zu den Fördertöpfen 2026. Eingebaute Widersprüche: Förderquote und Höchstbetrag (§ 5: 50 % und 15.000 €, Merkblatt: 60 % und 12.000 €), Antragsfrist (§ 6: 31. Oktober, Merkblatt: 30.09.) und eine falsche Summe im Merkblatt (1.761.000 € statt 1.771.000 €).",
    meta: [
      ["Aktenzeichen", "41.0-310.00/25"],
      ["Stand", "Entwurf für den Kulturausschuss am 21.10.2025"],
      ["Status", "öffentlich"],
    ],
    subject: "Richtlinie der Stadt Falkenbrück zur Förderung von Kunst und Kultur (Kulturförderrichtlinie)",
    blocks: [
      {
        t: "p",
        text: "Die Stadt Falkenbrück fördert ein vielfältiges, offenes und zugängliches kulturelles Leben in allen Stadtteilen. Diese Richtlinie fasst die bisherigen Richtlinien zur Kulturförderung vom 12.12.2013 und die Vergaberegeln für den Stadtteilkulturfonds vom 06.05.2019 zusammen, vereinfacht die Antragstellung und macht die Entscheidungen nachvollziehbarer.",
      },
      { t: "h2", text: "§ 1 Zweck und Rechtsgrundlage" },
      {
        t: "ol",
        items: [
          "Die Stadt gewährt Zuwendungen für kulturelle Vorhaben und Einrichtungen als freiwillige Leistung nach Maßgabe dieser Richtlinie.",
          "Ein Rechtsanspruch auf Förderung besteht nicht. Die Stadt entscheidet nach pflichtgemäßem Ermessen im Rahmen der verfügbaren Haushaltsmittel.",
          "Ergänzend gelten die Gemeindehaushaltsverordnung (GemHVO) und die Allgemeinen Nebenbestimmungen für Zuwendungen der Stadt Falkenbrück (ANBest-F).",
        ],
      },
      { t: "h2", text: "§ 2 Gegenstand der Förderung" },
      {
        t: "ol",
        items: [
          "**Projektförderung:** zeitlich begrenzte Vorhaben aller Sparten (Musik, Theater, Tanz, Literatur, bildende Kunst, Film, kulturelle Bildung, Soziokultur).",
          "**Institutionelle Förderung:** dauerhafte Unterstützung von Kultureinrichtungen mit überörtlicher oder stadtweiter Bedeutung auf Grundlage einer Zielvereinbarung.",
          "**Stadtteilkulturfonds:** kleine Vorhaben in den Stadtteilen, insbesondere von Nachbarschaftsinitiativen und Laiengruppen.",
          "**Atelierförderung:** Zuschüsse zur Miete von Arbeitsräumen professioneller bildender Künstlerinnen und Künstler.",
        ],
      },
      { t: "h2", text: "§ 3 Zuwendungsempfänger" },
      {
        t: "p",
        text: "Gefördert werden gemeinnützige Vereine, freie Gruppen und Initiativen sowie Künstlerinnen und Künstler mit Wohnsitz oder Arbeitsschwerpunkt in Falkenbrück. Nicht gefördert werden kommerzielle Veranstalter, Parteien und ihre Untergliederungen sowie Schulen; für Schulen gilt das Budget für kulturelle Bildung des Schulverwaltungsamts.",
      },
      { t: "h2", text: "§ 4 Fördervoraussetzungen" },
      {
        t: "ul",
        items: [
          "Das Vorhaben findet in Falkenbrück statt und ist öffentlich zugänglich.",
          "Die Gesamtfinanzierung ist unter Berücksichtigung der beantragten Zuwendung gesichert.",
          "Mit dem Vorhaben wurde vor der Bewilligung nicht begonnen. Ein vorzeitiger Maßnahmebeginn kann auf Antrag zugelassen werden.",
        ],
      },
      { t: "h2", text: "§ 5 Art, Umfang und Höhe der Zuwendung" },
      {
        t: "ol",
        items: [
          "Die Zuwendung wird als nicht rückzahlbarer Zuschuss im Wege der **Fehlbedarfsfinanzierung** gewährt, soweit nachfolgend nichts anderes bestimmt ist.",
          "Projektförderung: höchstens **50 % der zuwendungsfähigen Ausgaben**, höchstens **15.000 €** je Projekt. Ehrenamtliche Arbeit kann mit 15 € je Stunde bis zu 20 % der Gesamtausgaben als Eigenleistung angerechnet werden.",
          "Stadtteilkulturfonds: bis zu 1.500 € je Vorhaben als Festbetrag; ein Eigenanteil ist nicht erforderlich.",
          "Atelierförderung: 50 % der Kaltmiete, höchstens 150 € im Monat, für längstens drei Jahre.",
          "Institutionelle Förderung: Fehlbedarf nach dem genehmigten Wirtschaftsplan; die Zielvereinbarung wird für drei Jahre geschlossen.",
        ],
      },
      { t: "h2", text: "§ 6 Antragsverfahren" },
      {
        t: "ol",
        items: [
          "Anträge werden über das Onlineformular auf www.falkenbrueck.example/kulturfoerderung oder schriftlich beim Kulturamt gestellt.",
          "Antragsfristen: Projektförderung für das Folgejahr bis zum **31. Oktober**; institutionelle Förderung bis zum 30. Juni für das Folgejahr; Stadtteilkulturfonds und Atelierförderung laufend, Stadtteilkulturfonds spätestens sechs Wochen vor Beginn des Vorhabens.",
          "Dem Antrag sind eine Vorhabenbeschreibung, ein Kosten- und Finanzierungsplan und bei Vereinen die Satzung sowie der letzte Freistellungsbescheid des Finanzamts beizufügen.",
        ],
      },
      { t: "h2", text: "§ 7 Kulturbeirat" },
      {
        t: "p",
        text: "Anträge auf Projektförderung über 5.000 € bewertet der **Kulturbeirat**. Ihm gehören vier sachkundige Personen aus der Kulturszene und drei vom Kulturausschuss benannte Mitglieder an. Bewertet werden künstlerische Qualität, Bezug zur Stadtgesellschaft, Teilhabe und Barrierefreiheit sowie Nachhaltigkeit. Der Beirat gibt eine Empfehlung ab; über Förderungen bis 10.000 € entscheidet das Kulturamt, darüber der Kulturausschuss.",
      },
      { t: "h2", text: "§ 8 Bewilligung, Auszahlung und Verwendungsnachweis" },
      {
        t: "ol",
        items: [
          "Die Förderung wird durch Zuwendungsbescheid bewilligt. Die Mittel werden nur ausgezahlt, soweit sie innerhalb von zwei Monaten nach der Auszahlung benötigt werden.",
          "Der Verwendungsnachweis ist innerhalb von drei Monaten nach Abschluss des Vorhabens vorzulegen. Bei Zuwendungen bis 5.000 € genügt ein einfacher Verwendungsnachweis (Sachbericht und zahlenmäßige Übersicht).",
          "Das Rechnungsprüfungsamt ist berechtigt, die Verwendung zu prüfen. Für Widerruf und Erstattung gelten §§ 49 und 49a VwVfG.",
        ],
      },
      { t: "h2", text: "§ 9 Öffentlichkeitsarbeit" },
      {
        t: "p",
        text: "In allen Veröffentlichungen zum geförderten Vorhaben ist auf die Förderung mit dem Hinweis „Gefördert von der Stadt Falkenbrück“ und dem Stadtlogo hinzuweisen.",
      },
      { t: "h2", text: "§ 10 Inkrafttreten" },
      { t: "p", text: "Diese Richtlinie tritt am 01.01.2026 in Kraft. Die in der Präambel genannten Richtlinien treten zum selben Zeitpunkt außer Kraft." },
      { t: "pagebreak" },
      { t: "h2", text: "Anlage: Merkblatt Fördertöpfe 2026" },
      {
        t: "table",
        header: ["Fördertopf", "Ansatz 2026", "Förderhöhe", "Antragsfrist"],
        rows: [
          ["Projektförderung", "210.000 €", "bis zu 60 % der Ausgaben, höchstens 12.000 €", "30.09. für das Folgejahr"],
          ["Institutionelle Förderung", "1.480.000 €", "nach Wirtschaftsplan", "30.06. für das Folgejahr"],
          ["Stadtteilkulturfonds", "45.000 €", "bis 1.500 € je Vorhaben", "laufend, 6 Wochen vor Beginn"],
          ["Atelierförderung", "36.000 €", "50 % der Kaltmiete, max. 150 € im Monat", "laufend"],
          ["Summe", "1.761.000 €", "", ""],
        ],
        widths: [3, 2, 4, 3],
      },
      { t: "note", text: "Beratung: Kulturamt, Sprechzeiten dienstags und donnerstags 9 bis 12 Uhr, kulturfoerderung@falkenbrueck.example" },
    ],
  },
  // ── Amt 67: Baumkataster (lang, deterministisch erzeugt) ──
  {
    type: "excel",
    id: "fb-baumkataster-regelkontrolle-nordstadt-2025",
    title: "Baumkataster Nordstadt – Auszug Regelkontrolle Sommer 2025",
    kind: "Kontrollliste",
    fileName: "Baumkataster Nordstadt Auszug Regelkontrolle 2025",
    org: "falkenbrueck",
    unit: "fb-amt67",
    author: "fb-stratmann",
    date: "2025-08-28",
    tags: ["zahlen"],
    keywords: ["Regelkontrolle", "Verkehrssicher", "Kronensicherung", "Stammfußfäule", "NS-0207"],
    summary:
      "Auszug aus dem Baumkataster mit 94 Straßenbäumen der Nordstadt: Art, Maße, Vitalität, Befund, Verkehrssicherheit, Maßnahme und Frist; dazu Auswertungen nach Maßnahme (mit Kosten) und Straße. Für Filter-, Priorisierungs- und Diagrammübungen.",
    sheets: [
      {
        name: "Kontrolle",
        title: "Baumkataster Nordstadt – Regelkontrolle Sommer 2025",
        subtitle: "Kontrollbezirk N 2 · Sichtkontrolle vom Boden aus · Stand 22.07.2025 · Vitalität 0 = sehr gut bis 4 = absterbend",
        columns: [
          { header: "Baum-Nr.", width: 10 },
          { header: "Straße", width: 18 },
          { header: "Standort", width: 18 },
          { header: "Baumart", width: 16 },
          { header: "Pflanzjahr", width: 10 },
          { header: "Stammumfang (cm)", width: 11, fmt: "int" },
          { header: "Höhe (m)", width: 8, fmt: "int" },
          { header: "Kontrolle am", width: 12, fmt: "date" },
          { header: "Vitalität", width: 9, fmt: "int" },
          { header: "Befund", width: 40 },
          { header: "Verkehrssicher", width: 13 },
          { header: "Maßnahme", width: 28 },
          { header: "Dringlichkeit", width: 20 },
          { header: "Nächste Kontrolle", width: 14, fmt: "date" },
        ],
        rows: BAEUME.map((b) => [
          b.nr,
          b.street,
          b.standort,
          b.art,
          String(b.planted),
          b.umfang,
          b.hoehe,
          { date: b.date },
          b.vital,
          b.befund.text,
          b.befund.sicher,
          b.befund.massnahme,
          b.befund.dringlichkeit,
          b.next === "–" ? null : { date: b.next },
        ]),
        notes: [
          "Bäume mit Dringlichkeit „sofort“ wurden noch am Kontrolltag abgesperrt und dem Betriebshof gemeldet.",
          "Wurzelschäden an Gehwegen sind an das Tiefbauamt (Amt 66) weitergegeben. Bei Bäumen, die gefällt werden, ist keine nächste Kontrolle eingetragen.",
        ],
      },
      {
        name: "Maßnahmen",
        title: "Maßnahmen und Kosten",
        subtitle: "Einheitskosten nach Rahmenvertrag Baumpflege 2025, Los Nord (netto, ohne Verkehrssicherung)",
        columns: [
          { header: "Maßnahme", width: 32 },
          { header: "Anzahl Bäume", width: 13, fmt: "int" },
          { header: "Einheitskosten", width: 15, fmt: "eur0" },
          { header: "Kosten", width: 14, fmt: "eur0" },
        ],
        rows: [
          ...BAUM_KOSTEN.map(([m, k]): CellSpec[] => [m, BAEUME.filter((b) => b.befund.massnahme === m).length, k, { f: "B{r}*C{r}" }]),
          { total: true, cells: ["Summe", { f: "SUM(B{first}:B{last})" }, null, { f: "SUM(D{first}:D{last})" }] },
        ],
        notes: [
          "Fällungen: Ersatzpflanzung je Baum rund 1.400 € (gesondert, Haushaltsstelle Stadtbäume).",
          "Kosten der Gehwegreparaturen trägt das Tiefbauamt.",
        ],
      },
      {
        name: "Straßen",
        title: "Ergebnis nach Straße",
        columns: [
          { header: "Straße", width: 20 },
          { header: "Bäume", width: 9, fmt: "int" },
          { header: "ohne Befund", width: 12, fmt: "int" },
          { header: "mit Befund", width: 12, fmt: "int" },
          { header: "Anteil mit Befund", width: 14, fmt: "pct" },
          { header: "nicht verkehrssicher", width: 14, fmt: "int" },
        ],
        rows: [
          ...BAUM_STRASSEN.map(({ street }): CellSpec[] => {
            const t = BAEUME.filter((b) => b.street === street);
            return [street, t.length, t.filter((b) => b.befund === OHNE_BEFUND).length, { f: "B{r}-C{r}" }, { f: "D{r}/B{r}" }, t.filter((b) => b.befund.sicher === "nein").length];
          }),
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "D{r}/B{r}" }, { f: "SUM(F{first}:F{last})" }],
          },
        ],
      },
    ],
  },
  // ── Amt 52: Hallenbelegungsplan (Doppelbelegung und fehlerhafte Summe eingebaut) ──
  {
    type: "excel",
    id: "fb-hallenbelegung-winterhalbjahr-2026-27",
    title: "Hallenbelegungsplan Vereinssport Winterhalbjahr 2026/27 (Entwurf)",
    kind: "Belegungsplan",
    fileName: "Hallenbelegung Vereinssport Winterhalbjahr 2026-27 Entwurf",
    org: "falkenbrueck",
    unit: "fb-amt52",
    author: "fb-wessels",
    date: "2026-07-10",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Hallenteil-Std.", "Sporthalle Gesamtschule Nord", "Volleyballfreunde Lerchenfeld", "Auslastung", "Vergabebesprechung"],
    summary:
      "Belegung von vier städtischen Sporthallen durch Vereine mit Auswertung der Auslastung. Eingebaute Fehler: Dienstag 18:00–19:30 sind in der Dreifachhalle Gesamtschule Nord vier Hallenteile vergeben, obwohl laut Hinweis alle Überschneidungen bereinigt sind; die Summe für die Sporthalle Lindenstraße im Blatt „Auslastung“ lässt die letzte Belegung weg.",
    sheets: [
      {
        name: "Belegung",
        title: "Hallenbelegung Vereinssport – Winterhalbjahr 2026/27",
        subtitle: "Gültig 05.10.2026 bis 26.03.2027 · montags bis freitags 17 bis 22 Uhr · Entwurf nach der Vergabebesprechung am 07.07.2026",
        columns: [
          { header: "Halle", width: 34 },
          { header: "Tag", width: 6 },
          { header: "Beginn", width: 8 },
          { header: "Ende", width: 8 },
          { header: "Hallenteile", width: 10, fmt: "int" },
          { header: "Verein", width: 40 },
          { header: "Gruppe", width: 26 },
          { header: "Teilnehmende", width: 12, fmt: "int" },
          { header: "Stunden", width: 9, fmt: "dec" },
          { header: "Hallenteil-Std.", width: 13, fmt: "dec" },
        ],
        rows: [
          ...BELEGUNG.rows,
          { total: true, cells: ["Summe", null, null, null, null, null, null, { f: "SUM(H{first}:H{last})" }, { f: "SUM(I{first}:I{last})" }, { f: "SUM(J{first}:J{last})" }] },
        ],
        notes: [
          "Alle Überschneidungen aus den Anträgen wurden in der Vergabebesprechung bereinigt.",
          "Schulsport hat bis 16:30 Uhr Vorrang; die Hallen werden ab 16:45 Uhr für den Vereinssport geöffnet.",
          "Turnhalle Grundschule Weststadt: wegen Erneuerung des Hallenbodens bis 31.12.2026 gesperrt, daher nicht aufgeführt.",
        ],
      },
      {
        name: "Auslastung",
        title: "Auslastung je Halle",
        subtitle: "Verfügbar: 25 Stunden je Hallenteil und Woche (montags bis freitags, 17 bis 22 Uhr)",
        columns: [
          { header: "Halle", width: 36 },
          { header: "Hallenteile", width: 10, fmt: "int" },
          { header: "Verfügbare Hallenteil-Std.", width: 14, fmt: "dec" },
          { header: "Belegte Hallenteil-Std.", width: 14, fmt: "dec" },
          { header: "Auslastung", width: 11, fmt: "pct" },
          { header: "Anträge ohne Zuteilung", width: 13, fmt: "int" },
        ],
        rows: [
          ...BELEGUNG.ranges.map((h, i): CellSpec[] => [
            h.name,
            h.teile,
            { f: "B{r}*25" },
            // Fehler (gewollt): Bei der Sporthalle Lindenstraße endet der Bereich eine Zeile zu früh.
            { f: `SUM(Belegung!J${h.from}:J${h.name.includes("Lindenstraße") ? h.to - 1 : h.to})` },
            { f: "D{r}/C{r}" },
            [6, 2, 3, 4][i],
          ]),
          { total: true, cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "D{r}/C{r}" }, { f: "SUM(F{first}:F{last})" }] },
        ],
        notes: [
          "Offene Anträge u. a.: Tanzsportgemeinschaft Weststadt (2 Std. Turniertraining), SC Nordstadt (Inklusionssportgruppe), Basketballclub Falkenbrück (U18).",
          "Ab 01.01.2027 steht die Turnhalle Grundschule Weststadt wieder zur Verfügung (25 Hallenteil-Std.).",
        ],
      },
    ],
  },
  // ── Amt 50: Wohngeld – Eingänge, Erledigungen, Rückstände (kurz) ──
  {
    type: "excel",
    id: "fb-wohngeld-bearbeitungsstand-2025",
    title: "Wohngeld – Antragseingänge, Erledigungen und Rückstände 2025",
    kind: "Controllingbericht",
    fileName: "Wohngeld Bearbeitungsstand Dezember 2025",
    org: "falkenbrueck",
    unit: "fb-amt50",
    author: "fb-behrendt",
    date: "2026-01-21",
    tags: ["zahlen"],
    keywords: ["Weiterleistungsanträge", "Offen am Monatsende", "Erledigungen je VZÄ", "2.140"],
    summary:
      "Monatliche Eingänge, Erledigungen und offene Wohngeldanträge 2025 mit Bearbeitungszeit und Personaleinsatz. Für Diagramme, Trendaussagen und eine kurze Lagemeldung an die Amtsleitung.",
    sheets: [
      {
        name: "2025",
        title: "Wohngeld – Bearbeitungsstand 2025",
        subtitle: "Quelle: Fachverfahren Wohngeld, Monatsauswertungen · Anfangsbestand 31.12.2024: 2.140 offene Anträge",
        columns: [
          { header: "Monat", width: 16 },
          { header: "Erstanträge", width: 11, fmt: "int" },
          { header: "Weiterleistungsanträge", width: 14, fmt: "int" },
          { header: "Eingang gesamt", width: 11, fmt: "int" },
          { header: "Erledigt", width: 10, fmt: "int" },
          { header: "Offen am Monatsende", width: 12, fmt: "int" },
          { header: "Ø Bearbeitungszeit (Wochen)", width: 14, fmt: "dec" },
          { header: "Besetzte Stellen (VZÄ)", width: 12, fmt: "dec" },
          { header: "Erledigungen je VZÄ", width: 12, fmt: "dec" },
        ],
        rows: (
          [
            ["Januar", 612, 488, 905, 9.5, 14.5],
            ["Februar", 548, 455, 921, 10.2, 14.5],
            ["März", 501, 470, 978, 10.8, 15],
            ["April", 433, 452, 1012, 10.6, 15],
            ["Mai", 402, 431, 958, 10.1, 14],
            ["Juni", 389, 418, 902, 9.7, 13.5],
            ["Juli", 377, 440, 846, 9.4, 13],
            ["August", 364, 429, 801, 9.6, 12.5],
            ["September", 395, 447, 905, 9.1, 14],
            ["Oktober", 418, 462, 931, 8.8, 15.5],
            ["November", 406, 451, 948, 8.5, 15.5],
            ["Dezember", 372, 423, 870, 8.3, 15],
          ] as [string, number, number, number, number, number][]
        )
          .map(([m, erst, weiter, erl, wochen, vzae], i): CellSpec[] => [
            `${m} 2025`,
            erst,
            weiter,
            { f: "B{r}+C{r}" },
            erl,
            { f: i === 0 ? "2140+D{r}-E{r}" : `F${4 + i}+D{r}-E{r}` },
            wochen,
            vzae,
            { f: "E{r}/H{r}" },
          ])
          .concat([
            [
              "Summe / Durchschnitt",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "F{last}" },
              { f: "AVERAGE(G{first}:G{last})" },
              { f: "AVERAGE(H{first}:H{last})" },
              { f: "AVERAGE(I{first}:I{last})" },
            ],
          ])
          .map((cells, i) => (i === 12 ? { total: true, cells } : cells)),
        notes: [
          "Wohngelderhöhung zum 01.01.2025: deutlicher Anstieg der Erstanträge im ersten Quartal.",
          "Zielwert Bearbeitungszeit: 6 Wochen. Stellenplan: 16,0 VZÄ; zwei Neueinstellungen zum 01.10.2025.",
        ],
      },
    ],
  },
  // ── Amt 51, Kindertagesbetreuung: Warteliste Nordstadt (lang, personendaten) ──
  {
    type: "excel",
    id: "fb-kita-warteliste-nordstadt-2025",
    title: "Kita-Warteliste Nordstadt – Stand 30.09.2025",
    kind: "Warteliste",
    fileName: "Kita-Warteliste Nordstadt Stand 2025-09-30",
    org: "falkenbrueck",
    unit: "fb-amt51-kita",
    author: "fb-szymanska",
    date: "2025-10-01",
    tags: ["personendaten"],
    keywords: ["Vormerk-Nr.", "Kita Sonnenblume", "Rechtsanspruch geltend gemacht", "128 Plätze", "Kinderhaus Falkenweg"],
    summary:
      "Warteliste der zentralen Platzvergabe mit 97 erfundenen Kindern aus der Nordstadt (Name, Geburtsdatum, Anschrift, Eltern, Telefon, Wunsch-Kita, Rechtsanspruch) und Auswertung nach Einrichtung. Passt zur Beschlussvorlage Kita Kiebitzweg (97 Kinder, 31 geltend gemachte Ansprüche); ideal zum Anonymisieren und Auswerten.",
    sheets: [
      {
        name: "Warteliste",
        title: "Zentrale Platzvergabe – Warteliste Nordstadt",
        subtitle: "Stand 30.09.2025 · nur für den Dienstgebrauch · Altersgruppe bezogen auf den 01.08.2026",
        columns: [
          { header: "Nr.", width: 5, fmt: "int" },
          { header: "Vormerk-Nr.", width: 13 },
          { header: "Name", width: 14 },
          { header: "Vorname", width: 11 },
          { header: "Geburtsdatum", width: 12, fmt: "date" },
          { header: "Altersgruppe", width: 11 },
          { header: "Anschrift", width: 20 },
          { header: "Sorgeberechtigte Person", width: 22 },
          { header: "Telefon", width: 16 },
          { header: "Vorgemerkt seit", width: 12, fmt: "date" },
          { header: "Gewünschter Beginn", width: 12, fmt: "date" },
          { header: "Std./Woche", width: 9, fmt: "int" },
          { header: "1. Wunsch", width: 20 },
          { header: "2. Wunsch", width: 24 },
          { header: "Rechtsanspruch geltend gemacht", width: 14 },
          { header: "Hinweise", width: 34 },
        ],
        rows: WARTELISTE.map((w, i) => [
          i + 1,
          w.vormerk,
          w.name,
          w.vorname,
          { date: w.geburt },
          w.gruppe,
          w.anschrift,
          w.eltern,
          w.telefon,
          { date: w.seit },
          { date: w.beginn },
          w.stunden,
          w.wunsch1,
          w.wunsch2,
          w.anspruch,
          w.hinweis,
        ]),
        notes: [
          "Vergabe nach den Kriterien der Satzung über die Kindertagesbetreuung (Rechtsanspruch, Geschwisterkinder, Berufstätigkeit, Alleinerziehende, Wartezeit).",
          "Datenschutz: Weitergabe an Träger nur auszugsweise und nur für die Platzvergabe (§ 64 SGB VIII).",
        ],
      },
      {
        name: "Auswertung",
        title: "Auswertung nach 1. Wunsch",
        columns: [
          { header: "Einrichtung", width: 24 },
          { header: "U3", width: 8, fmt: "int" },
          { header: "Ü3", width: 8, fmt: "int" },
          { header: "Gesamt", width: 9, fmt: "int" },
          { header: "davon Rechtsanspruch geltend gemacht", width: 16, fmt: "int" },
          { header: "Plätze in der Einrichtung", width: 13, fmt: "int" },
        ],
        rows: [
          ...KITA_NORD.map((k): CellSpec[] => {
            const w = WARTELISTE.filter((x) => x.wunsch1 === k);
            return [k, w.filter((x) => x.gruppe === "U3").length, w.filter((x) => x.gruppe === "Ü3").length, { f: "B{r}+C{r}" }, w.filter((x) => x.anspruch === "ja").length, KITA_PLAETZE[k]];
          }),
          {
            total: true,
            cells: ["Nordstadt gesamt", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "SUM(F{first}:F{last})" }],
          },
        ],
        notes: [
          "Fehlbedarf laut Kita-Bedarfsplanung (Stand 30.06.2025): 128 Plätze, davon 44 für Kinder unter drei Jahren.",
          "Neubau Kita Kiebitzweg (110 Plätze, Vorlage V/2025/0412) frühestens zum Kindergartenjahr 2027/28.",
        ],
      },
    ],
  },
  // ── Amt 66: Straßenzustand und Sanierungsprogramm ──
  {
    type: "excel",
    id: "fb-strassenzustand-sanierungsprogramm-2026-2027",
    title: "Straßenzustand 2025 und Sanierungsprogramm 2026/2027",
    kind: "Investitionsplanung",
    fileName: "Strassenzustand 2025 und Sanierungsprogramm 2026-2027",
    org: "falkenbrueck",
    unit: "fb-amt66",
    author: "fb-dreesen",
    date: "2026-03-12",
    tags: ["zahlen"],
    keywords: ["Zustandsklasse", "Mühlenstraße", "Querungshilfe", "Eigenanteil", "Hocheinbau"],
    summary:
      "Zustand des städtischen Straßennetzes nach Zustandsklassen, Entwicklung seit 2015 und priorisiertes Sanierungsprogramm mit Kosten, Förderung und Eigenanteil. Bezüge zu Mühlenviertel, Schulweg Heidestraße und Baumwurzelschäden in der Birkenallee; die Programmkosten liegen in beiden Jahren über den Haushaltsansätzen (Übung: Priorisieren).",
    sheets: [
      {
        name: "Zustand",
        title: "Zustand des Straßennetzes 2025",
        subtitle: "Messfahrzeug-Befahrung Mai/Juni 2025 · Länge in km · Zustandsklasse 1 = sehr gut bis 5 = sehr schlecht",
        columns: [
          { header: "Kategorie", width: 30 },
          { header: "Länge gesamt", width: 11, fmt: "dec" },
          { header: "Zustandsklasse 1", width: 11, fmt: "dec" },
          { header: "Zustandsklasse 2", width: 11, fmt: "dec" },
          { header: "Zustandsklasse 3", width: 11, fmt: "dec" },
          { header: "Zustandsklasse 4", width: 11, fmt: "dec" },
          { header: "Zustandsklasse 5", width: 11, fmt: "dec" },
          { header: "Anteil Klasse 4 und 5", width: 12, fmt: "pct" },
        ],
        rows: [
          ["Hauptverkehrsstraßen", { f: "SUM(C{r}:G{r})" }, 9.8, 24.1, 27.6, 16.2, 8.7, { f: "(F{r}+G{r})/B{r}" }],
          ["Sammelstraßen", { f: "SUM(C{r}:G{r})" }, 11.2, 30.5, 38.9, 21.8, 10.3, { f: "(F{r}+G{r})/B{r}" }],
          ["Anliegerstraßen", { f: "SUM(C{r}:G{r})" }, 38.6, 96.4, 141.2, 82.5, 42.6, { f: "(F{r}+G{r})/B{r}" }],
          ["Wirtschaftswege", { f: "SUM(C{r}:G{r})" }, 2.1, 6.4, 11.8, 9.9, 8.7, { f: "(F{r}+G{r})/B{r}" }],
          ["Selbständige Geh- und Radwege", { f: "SUM(C{r}:G{r})" }, 7.5, 16.8, 21.4, 12.3, 6.2, { f: "(F{r}+G{r})/B{r}" }],
          {
            total: true,
            cells: [
              "Netz gesamt",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "(F{r}+G{r})/B{r}" },
            ],
          },
        ],
      },
      {
        name: "Entwicklung",
        title: "Entwicklung des Netzzustands",
        columns: [
          { header: "Erfassung", width: 12 },
          { header: "Anteil Klasse 4 und 5", width: 14, fmt: "pct" },
          { header: "Investitionen Straßenerneuerung je Jahr", width: 20, fmt: "eur0" },
        ],
        rows: [
          ["2015", 0.224, 2100000],
          ["2019", 0.263, 2600000],
          ["2025", { f: "Zustand!H10" }, 2900000],
        ],
        notes: ["Zur Stabilisierung des Netzzustands wären nach dem Erhaltungsmanagement jährlich rund 7,5 Mio. € erforderlich."],
      },
      {
        name: "Programm 2026-2027",
        title: "Sanierungsprogramm 2026/2027",
        subtitle: "Priorisiert nach Zustand, Verkehrsbedeutung und Abstimmung mit Leitungsträgern · Beträge brutto",
        columns: [
          { header: "Nr.", width: 5, fmt: "int" },
          { header: "Straße", width: 26 },
          { header: "Abschnitt", width: 30 },
          { header: "Stadtteil", width: 14 },
          { header: "Länge (m)", width: 9, fmt: "int" },
          { header: "Zustandsnote", width: 10, fmt: "dec" },
          { header: "Maßnahme", width: 32 },
          { header: "Kosten 2026", width: 13, fmt: "eur0" },
          { header: "Kosten 2027", width: 13, fmt: "eur0" },
          { header: "Gesamt", width: 13, fmt: "eur0" },
          { header: "Förderung", width: 13, fmt: "eur0" },
          { header: "Eigenanteil", width: 13, fmt: "eur0" },
          { header: "Abstimmung", width: 36 },
        ],
        rows: [
          ...(
            [
              ["Mühlenstraße", "Speicherweg bis Bahnübergang", "Mühlenviertel", 820, 4.8, "Vollausbau mit Radfahrstreifen", 950000, 1850000, 1400000, "Kanal Stadtwerke 2026; Erschließung B-Plan Nr. 52"],
              ["Nordring", "Birkenallee bis Falkenweg", "Nordstadt", 640, 4.6, "Deckenerneuerung (Fräsen 8 cm)", 410000, 0, 0, "Stadtwerke: keine Leitungsarbeiten bis 2030"],
              ["Hafenstraße", "Kaiweg bis Speicherstraße", "Hafenviertel", 510, 4.4, "Deckenerneuerung", 330000, 0, 0, "abgestimmt"],
              ["Lindenstraße", "Nr. 1 bis 58", "Südstadt", 690, 4.1, "Hocheinbau Deckschicht", 210000, 0, 0, "abgestimmt"],
              ["Heidestraße", "Höhe Grundschule Heideweg", "Lerchenfeld", 120, 3.9, "Querungshilfe und Gehwegvorstreckung (Schulweg)", 0, 185000, 92500, "Schulverwaltungsamt: neue Schulbezirksgrenze ab 2027/28"],
              ["Ringstraße", "Abschnitt 2 (Weststadt)", "Weststadt", 1150, 4.5, "Deckenerneuerung zweilagig", 0, 1120000, 0, "Glasfaserausbau 2026 abwarten"],
              ["Kastanienallee", "gesamt", "Südstadt", 430, 4.7, "Vollausbau (Wurzelschäden)", 380000, 560000, 0, "Amt 67: Baumstandorte erweitern"],
              ["Birkenallee", "Gehwege beidseitig", "Nordstadt", 900, 3.8, "Gehwegsanierung (Wurzelanhebungen)", 160000, 0, 0, "Amt 67: Baumkataster Nordstadt 2025"],
              ["Speicherweg", "Mühlenstraße bis Mühlbach", "Mühlenviertel", 380, 4.2, "Umbau zur Fahrradstraße", 0, 640000, 480000, "Radverkehrskonzept"],
              ["Wirtschaftsweg Lerchenfeld-Ost", "gesamt", "Lerchenfeld", 1400, 4.9, "Hocheinbau Asphalt", 290000, 0, 0, "Landwirtschaft informiert"],
              ["Markt", "Pflasterflächen", "Altstadt", 260, 3.7, "Pflasterreparatur", 120000, 0, 0, "Marktbeschicker, Ordnungsamt"],
              ["Falkenweg", "gesamt", "Nordstadt", 560, 4, "Deckenerneuerung", 0, 340000, 0, "nur bei Mittelverfügbarkeit"],
              ["Mühlbachbrücke Lerchenstieg", "Bauwerk 14", "Lerchenfeld", 24, 3, "Instandsetzung der Brückenkappen", 260000, 0, 0, "Bauwerksprüfung 2025"],
            ] as [string, string, string, number, number, string, number, number, number, string][]
          ).map(([s, a, t, l, n, m, k26, k27, f, ab], i): CellSpec[] => [i + 1, s, a, t, l, n, m, k26, k27, { f: "H{r}+I{r}" }, f, { f: "J{r}-K{r}" }, ab]),
          {
            total: true,
            cells: [
              null,
              "Summe",
              null,
              null,
              { f: "SUM(E{first}:E{last})" },
              null,
              null,
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              { f: "SUM(J{first}:J{last})" },
              { f: "SUM(K{first}:K{last})" },
              { f: "SUM(L{first}:L{last})" },
              null,
            ],
          },
        ],
        notes: [
          "Haushaltsansätze Teilfinanzhaushalt 66, Straßenerneuerung: 2026 3.100.000 €, 2027 4.200.000 € (Entwurf der Finanzplanung).",
          "Förderung: Mühlenstraße und Speicherweg aus dem Landesprogramm für kommunalen Straßen- und Radwegebau, Querungshilfe Heidestraße aus Mitteln der Schulwegsicherung (50 %).",
        ],
      },
    ],
  },
  // ── Stabsstelle Klimaschutz: Zwischenbericht Klimaschutzkonzept ──
  {
    type: "powerpoint",
    id: "fb-klimaschutzkonzept-zwischenbericht-2026",
    title: "Klimaschutzkonzept Falkenbrück 2040 – Zwischenbericht 2026",
    kind: "Präsentation",
    fileName: "Klimaschutzkonzept 2040 Zwischenbericht 2026",
    org: "falkenbrueck",
    unit: "fb-klima",
    author: "fb-koenig",
    date: "2026-05-28",
    tags: ["zahlen"],
    keywords: ["Klimaneutralität 2040", "1,41 Mio. t", "Kommunale Wärmeplanung", "4.870 kWp", "48 Maßnahmen"],
    summary:
      "Zwischenbericht für den Fachausschuss: Treibhausgasbilanz 2019 bis 2024 nach Sektoren, Umsetzungsstand der 48 Maßnahmen, Photovoltaik, Wärmeplanung, Erfolge und Probleme, Vorschläge. Für Kurzfassungen, Diagrammprüfung und Pressetexte.",
    slides: [
      { t: "title", title: "Klimaschutzkonzept Falkenbrück 2040", subtitle: "Zwischenbericht 2026 · Ausschuss für Umwelt, Klima und Mobilität am 11.06.2026" },
      {
        t: "bullets",
        title: "Wo wir stehen",
        bullets: [
          "Ziel: **Klimaneutralität 2040** (Ratsbeschluss vom 16.06.2022)",
          { text: "48 Maßnahmen in sechs Handlungsfeldern", sub: ["Energie und Gebäude, Mobilität, Wirtschaft, Stadtverwaltung, Klimaanpassung, Beteiligung"] },
          "Treibhausgasemissionen 2024: 1,41 Mio. t CO₂e – 16,1 % weniger als 2019 (1,68 Mio. t)",
          "Pro Kopf: 6,5 t CO₂e (2019: 7,8 t)",
          "Für den Zielpfad wären bis 2024 minus 22 % nötig gewesen",
        ],
        notes:
          "Bilanz nach der bundesweit üblichen Bilanzierungssystematik für Kommunen (endenergiebasiert, Territorialprinzip). Die Daten für 2025 liegen erst im Herbst vor. Wichtig: Wir sind auf dem Weg, aber zu langsam.",
      },
      {
        t: "chart",
        title: "Treibhausgasemissionen nach Sektoren",
        chart: {
          type: "line",
          categories: ["2019", "2020", "2021", "2022", "2023", "2024"],
          series: [
            { name: "Private Haushalte", values: [512, 498, 505, 471, 452, 431] },
            { name: "Wirtschaft", values: [698, 641, 662, 640, 602, 562] },
            { name: "Verkehr", values: [421, 372, 398, 405, 401, 379] },
            { name: "Kommunale Einrichtungen", values: [49, 46, 45, 43, 41, 38] },
          ],
          unit: "Tsd. t CO₂e",
        },
        caption: "Quelle: Treibhausgasbilanz der Stadt Falkenbrück, Fortschreibung April 2026",
        notes: "Der Rückgang 2020 ist ein Pandemieeffekt. Der Verkehr liegt 2024 nur 10 % unter 2019 – hier fehlt der Durchbruch.",
      },
      {
        t: "chart",
        title: "Umsetzungsstand der 48 Maßnahmen",
        chart: {
          type: "pie",
          categories: ["umgesetzt", "in Umsetzung", "in Vorbereitung", "zurückgestellt"],
          series: [{ name: "Maßnahmen", values: [12, 21, 9, 6] }],
          unit: "Maßnahmen",
        },
        caption: "Stand: 15.05.2026",
      },
      {
        t: "table",
        title: "Ausgewählte Maßnahmen",
        header: ["Maßnahme", "Ziel", "Stand 05/2026", "Bewertung"],
        rows: [
          ["Photovoltaik auf städtischen Dächern", "8.000 kWp bis 2030", "4.870 kWp", "im Plan"],
          ["LED-Straßenbeleuchtung", "100 % bis 2028", "71 %", "im Plan"],
          ["E-Fahrzeuge im Fuhrpark", "50 % bis 2028", "38 %", "im Plan"],
          ["Kommunale Wärmeplanung", "Beschluss bis 30.06.2026", "Ratsbeschluss am 09.07.2026", "knapp verzögert"],
          ["Radverkehrsnetz", "60 km bis 2030", "17 km", "verzögert"],
          ["Zusätzliche Stadtbäume", "1.000 bis 2030", "286", "verzögert"],
          ["Sanierung städtischer Gebäude", "2 % der Fläche je Jahr", "0,9 %", "kritisch"],
        ],
        notes: "Die Gebäudesanierung ist das größte Sorgenkind: Es fehlen Personal im Hochbau und Mittel im Haushalt.",
      },
      {
        t: "chart",
        title: "Photovoltaik auf städtischen Dächern",
        chart: {
          type: "bar",
          categories: ["2021", "2022", "2023", "2024", "2025"],
          series: [{ name: "installierte Leistung", values: [1250, 1780, 2640, 3910, 4870] }],
          unit: "kWp",
        },
        caption: "Jeweils zum Jahresende; 2025 inklusive Schulzentrum Süd und Betriebshof",
      },
      {
        t: "bullets",
        title: "Kommunale Wärmeplanung",
        bullets: [
          "Pflicht nach dem Wärmeplanungsgesetz (WPG): Großstädte bis 30.06.2026",
          "Ergebnis: Wärmenetze können künftig rund 38 % des Wärmebedarfs decken (heute 14 %)",
          { text: "Wärmenetzgebiete", sub: ["Altstadt und Hafenviertel (Ausbau Bestandsnetz)", "Mühlenviertel (neues Netz, Bebauungsplan Nr. 52)"] },
          "Lerchenfeld, Weststadt, Südstadt: überwiegend dezentrale Wärmepumpen",
          "Ratsbeschluss am 09.07.2026 – eine Woche nach der gesetzlichen Frist",
        ],
        notes: "Die Fristüberschreitung ist mit dem Ministerium abgestimmt; Rechtsfolgen entstehen nach Auskunft der Kommunalaufsicht nicht. Bitte nicht kleinreden, aber auch nicht dramatisieren.",
      },
      {
        t: "twocol",
        title: "Was gut läuft – wo es hakt",
        left: {
          heading: "Gut",
          bullets: ["Photovoltaik und LED im Plan", "1.240 geförderte Steckersolargeräte seit 2024", "Fuhrpark: 38 % elektrisch", "Klimaschutz in allen neuen Bebauungsplänen"],
        },
        right: {
          heading: "Schwierig",
          bullets: ["Gebäudesanierung: zu wenig Personal und Geld", "Radwege: Grunderwerb dauert", "Verkehr: kaum Rückgang", "Klimaschutzteam: 1,5 von 6 Stellen unbesetzt"],
        },
        notes: "Haushaltslage beachten: geplanter Fehlbetrag 2026 von 38,6 Mio. €. Neue Maßnahmen nur mit Förderung oder Einsparung an anderer Stelle.",
      },
      {
        t: "bullets",
        title: "Vorschläge für 2026 und 2027",
        bullets: [
          "Sanierungsfahrplan für städtische Gebäude, Schulen zuerst",
          "Klimacheck in allen Beschlussvorlagen ab 01.01.2027",
          "Photovoltaikpflicht in allen neuen Bebauungsplänen beibehalten",
          "Förderprogramm Dach- und Fassadenbegrünung (mit dem Hitzeaktionsplan)",
          "Jährlicher Kurzbericht statt Zwischenbericht alle zwei Jahre",
        ],
      },
      { t: "end", title: "Vielen Dank!", lines: ["Hanna König · Klimaschutzmanagerin", "Telefon 069 90009-680 · klimaschutz@falkenbrueck.example"] },
    ],
  },
  // ── Amt 42: Open Library (kurz) ──
  {
    type: "powerpoint",
    id: "fb-stadtbibliothek-open-library-pilot",
    title: "Open Library in der Stadtbibliothek – Ergebnisse des Pilotbetriebs",
    kind: "Präsentation",
    fileName: "Open Library Stadtteilbibliothek Lerchenfeld Ergebnisse Pilot",
    org: "falkenbrueck",
    unit: "fb-amt42",
    author: "fb-meinke",
    date: "2025-11-19",
    tags: [],
    keywords: ["Open Library", "Lerchenfeld", "86.000 €", "Digitale Kommune"],
    summary:
      "Kurze Präsentation für den Kulturausschuss: Prinzip der Open Library, Besuchszahlen im Pilot Lerchenfeld, Kosten und Förderung, Vorschlag zur Ausweitung auf die Nordstadt. Gut für eine Pressemitteilung oder Leichte Sprache.",
    slides: [
      { t: "title", title: "Open Library", subtitle: "Pilot in der Stadtteilbibliothek Lerchenfeld · Kulturausschuss am 25.11.2025" },
      {
        t: "bullets",
        title: "Was ist Open Library?",
        bullets: [
          "Eintritt mit Bibliotheksausweis und PIN – auch ohne Personal",
          "Lerchenfeld: täglich 8 bis 22 Uhr statt 26 Stunden pro Woche",
          "Ausleihe und Rückgabe an Selbstbedienungsgeräten",
          "Kamera nur im Eingangsbereich, Löschung nach 72 Stunden",
        ],
      },
      {
        t: "chart",
        title: "Besuche in Lerchenfeld 2025",
        chart: {
          type: "bar",
          categories: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt"],
          series: [{ name: "Besuche", values: [1420, 1380, 1610, 2050, 2120, 2010, 1890, 1940, 2230, 2310] }],
          unit: "Besuche",
        },
        caption: "Start der Open Library am 10.03.2025",
        notes: "Im Schnitt April bis Oktober rund 2.080 Besuche im Monat – fast 50 % mehr als im Januar und Februar.",
      },
      {
        t: "table",
        title: "Kosten und Förderung",
        header: ["Position", "Betrag"],
        rows: [
          ["Zutrittssystem und Technik", "48.000 €"],
          ["Selbstverbuchung", "27.000 €"],
          ["Umbau Eingang", "11.000 €"],
          ["Summe", "86.000 €"],
          ["Förderung „Digitale Kommune“ (75 %)", "64.500 €"],
          ["Eigenanteil", "21.500 €"],
        ],
      },
      {
        t: "bullets",
        title: "Vorschlag",
        bullets: [
          "Open Library in der Stadtteilbibliothek Nordstadt nach dem Umzug ins Nordstadt-Zentrum (Herbst 2026)",
          "Förderantrag bis 31.03.2026",
          "Dienstvereinbarung zur Kameratechnik mit dem Personalrat ist abgeschlossen",
        ],
      },
      { t: "end", title: "Vielen Dank!", lines: ["Anja Meinke · Leiterin Stadtbibliothek"] },
    ],
  },
  // ── Amt 61: Ergebnisse der frühzeitigen Beteiligung Mühlenviertel ──
  {
    type: "powerpoint",
    id: "fb-muehlenviertel-buergerbeteiligung-ergebnisse",
    title: "Mühlenviertel – Ergebnisse der frühzeitigen Bürgerbeteiligung",
    kind: "Präsentation",
    fileName: "Muehlenviertel Ergebnisse fruehzeitige Beteiligung B-Plan 52",
    org: "falkenbrueck",
    unit: "fb-amt61",
    author: "fb-heinrichs",
    date: "2025-02-13",
    tags: [],
    keywords: ["Frühzeitige Beteiligung", "386 Beiträge", "Hochpunkt", "Quartiersgarage", "Mühlbachpark"],
    summary:
      "Auswertung der frühzeitigen Öffentlichkeitsbeteiligung zum Bebauungsplan Nr. 52: Formate, Beiträge nach Themen, Zustimmung und Kritik, Umgang mit den Anregungen. Passt zur Begründung des Bebauungsplans (Abgleich, Leichte Sprache, Bürgerinfo).",
    slides: [
      { t: "title", title: "Mühlenviertel: Was die Bürgerinnen und Bürger sagen", subtitle: "Frühzeitige Beteiligung zum Bebauungsplan Nr. 52 · Ausschuss für Stadtentwicklung am 20.02.2025" },
      {
        t: "bullets",
        title: "So haben wir beteiligt",
        bullets: [
          "Zeitraum: 18.11. bis 20.12.2024",
          "Infoabend im Mühlengebäude am 26.11.2024 mit rund 210 Gästen",
          "Stadtteilspaziergang am 30.11.2024 mit 45 Teilnehmenden",
          "Online-Beteiligung: 1.140 Besuche",
          "Beteiligung von zwei Klassen der Grundschule Mühlenviertel",
          { text: "Insgesamt **386 Beiträge**", sub: ["291 online", "63 auf Karten beim Infoabend", "32 per Brief oder E-Mail"] },
        ],
      },
      {
        t: "chart",
        title: "Beiträge nach Themen",
        chart: {
          type: "bar",
          categories: ["Verkehr und Parken", "Grün und Freiraum", "Bezahlbares Wohnen", "Schule und Kita", "Gebäudehöhen", "Lärm der Bahn", "Sonstiges"],
          series: [{ name: "Beiträge", values: [112, 87, 64, 41, 38, 22, 22] }],
          unit: "Beiträge",
        },
        notes: "Mehrfachnennungen wurden dem Hauptthema zugeordnet. Verkehr und Parken dominiert – vor allem Sorgen der Anwohnenden in Mühlenstraße und Speicherweg.",
      },
      {
        t: "twocol",
        title: "Zustimmung und Kritik",
        left: {
          heading: "Das gefällt",
          bullets: ["Erhalt des Mühlengebäudes", "Park am Mühlbach", "Läden und Cafés an der Mühlenstraße", "geförderte Wohnungen"],
        },
        right: {
          heading: "Das wird kritisiert",
          bullets: ["Hochpunkt mit neun Geschossen", "Parkdruck in den Nachbarstraßen", "mehr Verkehr auf der Mühlenstraße", "fehlende Grundschulplätze", "Baulärm über viele Jahre"],
        },
      },
      {
        t: "table",
        title: "Anregungen und Vorschlag der Verwaltung",
        header: ["Anregung", "Vorschlag der Verwaltung"],
        rows: [
          ["Hochpunkt zu hoch", "von neun auf sieben Geschosse reduzieren"],
          ["Parkdruck", "Quartiersgarage mit 420 Stellplätzen, Bewohnerparken in Nachbarstraßen prüfen"],
          ["Mehr Grün", "Mühlbachpark von 1,40 ha auf 1,64 ha vergrößern"],
          ["Garage am Mühlbach stört", "Quartiersgarage an die Bahnstrecke verlegen (zugleich Lärmschutz)"],
          ["Grundschule fehlt", "Fläche für Schule und Kita sichern (1,21 ha)"],
          ["40 % Sozialwohnungen", "nicht gefolgt: 30 % nach dem Baulandmodell"],
        ],
        notes: "Die Forderung nach 40 % geförderten Wohnungen kam vor allem von der Sozialen Liste und einer Mieterinitiative. Die Vorhabenträgerin hält mehr als 30 % für nicht wirtschaftlich.",
      },
      {
        t: "chart",
        title: "Wer hat sich online beteiligt?",
        chart: {
          type: "pie",
          categories: ["unter 30", "30 bis 49", "50 bis 64", "65 und älter"],
          series: [{ name: "Anteil", values: [18, 41, 26, 15] }],
          unit: "%",
        },
        caption: "Freiwillige Angaben von 244 Teilnehmenden",
      },
      {
        t: "bullets",
        title: "Nächste Schritte",
        bullets: [
          "Entwurf überarbeiten bis Mai 2025",
          "Veröffentlichung nach § 3 Abs. 2 BauGB im Sommer 2025",
          "Satzungsbeschluss Anfang 2026",
          "Alle Beiträge mit Antwort der Verwaltung auf www.falkenbrueck.example/muehlenviertel",
        ],
      },
      { t: "end", title: "Vielen Dank!", lines: ["Katrin Heinrichs · Leiterin Stadtplanungsamt", "Telefon 069 90009-610"] },
    ],
  },
  // ── Amt 53: Ergebnisse der Schuleingangsuntersuchungen ──
  {
    type: "powerpoint",
    id: "fb-schuleingangsuntersuchungen-2026",
    title: "Schuleingangsuntersuchungen 2026 – Ergebnisse",
    kind: "Präsentation",
    fileName: "Schuleingangsuntersuchungen 2026 Ergebnisse Ausschuss",
    org: "falkenbrueck",
    unit: "fb-amt53",
    author: "fb-wachsmuth",
    date: "2026-09-10",
    tags: ["zahlen"],
    keywords: ["1.587 Kinder", "Sprachförderbedarf", "Masern", "Kita-Besuch", "Rückstellung"],
    summary:
      "Ergebnisse der Schuleingangsuntersuchungen für den Einschulungsjahrgang 2026/27: Auffälligkeiten im Dreijahresvergleich, Sprachförderbedarf nach Stadtteil und nach Dauer des Kita-Besuchs, Impfschutz, Folgerungen. Für Diagrammübungen und Argumentation zum Kita-Ausbau.",
    slides: [
      { t: "title", title: "Schuleingangsuntersuchungen 2026", subtitle: "Einschulungsjahrgang 2026/27 · Ausschuss für Soziales und Gesundheit am 17.09.2026" },
      {
        t: "bullets",
        title: "Überblick",
        bullets: [
          "**1.587 Kinder** untersucht (Januar bis Juni 2026)",
          "Sehen, Hören, Motorik, Sprache, Gewicht, Impfstatus",
          "Empfehlung zur Rückstellung bei 6,4 % der Kinder (2025: 6,0 %)",
          "Sprachförderbedarf bei 27,3 % – höchster Wert seit Beginn der Auswertung",
        ],
        notes: "Die Untersuchung ist nach dem Schulgesetz Pflicht. Die Rückstellungsempfehlung ist eine Empfehlung an die Schulleitung; entschieden wird dort.",
      },
      {
        t: "chart",
        title: "Auffälligkeiten im Vergleich",
        chart: {
          type: "bar",
          categories: ["Sprache", "Feinmotorik", "Übergewicht", "Sehen", "Hören"],
          series: [
            { name: "2024", values: [24.1, 14.2, 11.2, 9.4, 3.1] },
            { name: "2025", values: [25.8, 15, 11.8, 9.1, 2.9] },
            { name: "2026", values: [27.3, 16.1, 12.4, 9.6, 3] },
          ],
          unit: "% der Kinder",
        },
      },
      {
        t: "chart",
        title: "Sprachförderbedarf nach Stadtteil",
        chart: {
          type: "bar",
          categories: ["Altstadt", "Nordstadt", "Südstadt", "Weststadt", "Lerchenfeld", "Hafenviertel", "Mühlenviertel"],
          series: [{ name: "Sprachförderbedarf", values: [21, 35, 24, 19, 31, 38, 26] }],
          unit: "% der Kinder",
        },
        notes: "Nordstadt und Hafenviertel liegen deutlich über dem Durchschnitt. In der Nordstadt fehlen zugleich die meisten Kitaplätze.",
      },
      {
        t: "table",
        title: "Kita-Besuch und Sprachförderbedarf",
        header: ["Dauer des Kita-Besuchs", "Kinder", "mit Sprachförderbedarf", "Anteil"],
        rows: [
          ["kein Kita-Besuch", "64", "41", "64 %"],
          ["unter 2 Jahren", "212", "98", "46 %"],
          ["2 bis 3 Jahre", "395", "118", "30 %"],
          ["über 3 Jahre", "916", "176", "19 %"],
          ["Gesamt", "1.587", "433", "27 %"],
        ],
        notes: "Je länger ein Kind eine Kita besucht hat, desto seltener besteht Sprachförderbedarf. Das ist ein starkes Argument für den Kita-Ausbau in der Nordstadt.",
      },
      {
        t: "bullets",
        title: "Impfschutz",
        bullets: [
          "Masern, zwei Impfungen: 93,8 % (Ziel: 95 %)",
          "Impfpass vorgelegt: 91 %",
          "Fehlender Masernschutz: 23 Meldungen nach § 20 Abs. 9 IfSG an die Schulen",
        ],
      },
      {
        t: "twocol",
        title: "Was wir vorschlagen",
        left: {
          heading: "Gesundheitsamt",
          bullets: ["Sprachscreening in Kitas ab vier Jahren (Nordstadt, Hafenviertel)", "Impfsprechstunden in Stadtteilzentren", "Elternabende zu Ernährung und Bewegung"],
        },
        right: {
          heading: "Partner",
          bullets: ["Kitas: alltagsintegrierte Sprachbildung", "Grundschulen: Förderunterricht in Klasse 1", "Sportvereine: Bewegungsangebote mit dem Sportamt"],
        },
      },
      { t: "end", title: "Vielen Dank!", lines: ["Dr. Leonie Wachsmuth · Kinder- und Jugendgesundheitsdienst", "Telefon 069 90009-571"] },
    ],
  },
];

export const threads: ThreadSpec[] = [
  // ── Amt 63: Nachforderung beim Bauherrn (personendaten, Anhang Gesprächsnotiz) ──
  {
    id: "fb-bauantrag-heideweg-9-nachforderung",
    title: "Bauantrag Heideweg 9 – Nachforderung von Unterlagen",
    subject: "Bauantrag Az. 63.2-0418/25 – Anbau und Doppelcarport Heideweg 9 – fehlende Unterlagen",
    org: "falkenbrueck",
    unit: "fb-amt63",
    date: "2025-04-14",
    tags: ["personendaten"],
    keywords: ["63.2-0418/25", "Einliegerwohnung", "Standsicherheitsnachweis", "23.05.2025", "Stellplatzsatzung"],
    summary:
      "Die Bauaufsicht fordert vom Bauherrn Unterlagen nach; er beruft sich verärgert auf die Bauberatung und bittet um Fristverlängerung. Intern wird die Gesprächsnotiz weitergeleitet. Übung: Mail und Notiz abgleichen (in der Beratung war keine zweite Wohnung geplant), Personendaten schwärzen, Antwort entwerfen.",
    mails: [
      {
        from: "fb-lindhorst",
        to: ["ext-lohmann"],
        cc: ["ext-fbb-rautenberg"],
        date: "2025-04-09T10:12",
        body: `Sehr geehrter Herr Lohmann,

Ihr Bauantrag für den Anbau eines Wohnraums mit Dachterrasse und einer Einliegerwohnung sowie für einen Doppelcarport auf dem Grundstück Heideweg 9 ist am 31.03.2025 bei uns eingegangen. Er wird unter dem Aktenzeichen **63.2-0418/25** geführt.

Angaben laut Antrag:
Bauherr: Marc Lohmann, geb. 02.11.1984, Heideweg 9, 00423 Falkenbrück
Entwurfsverfasserin: Dipl.-Ing. Stefanie Rautenberg, Architekturbüro Rautenberg
Grundstück: Gemarkung Lerchenfeld, Flur 4, Flurstück 233

Bei der Prüfung auf Vollständigkeit hat sich ergeben, dass folgende Unterlagen fehlen oder nachzubessern sind:

1. Standsicherheitsnachweis für Anbau und Dachterrasse
2. Antrag auf Befreiung von der hinteren Baugrenze des Bebauungsplans Nr. 31 nach § 31 Abs. 2 BauGB mit Begründung
3. Stellplatznachweis: Mit der Einliegerwohnung entsteht eine zweite Wohneinheit. Nach der Stellplatzsatzung ist dafür ein zusätzlicher Stellplatz nachzuweisen; bitte im Lageplan darstellen.
4. Amtlicher Lageplan: Der eingereichte Lageplan stammt vom 14.06.2019. Er darf nicht älter als sechs Monate sein.
5. Darstellung des Walnussbaums im hinteren Garten mit Kronentraufe; der Baum ist nach der Baumschutzsatzung geschützt.

Bitte reichen Sie die Unterlagen bis zum **09.05.2025** ein. Werden die Mängel innerhalb dieser Frist nicht behoben, gilt der Antrag nach der Landesbauordnung als zurückgenommen.

Für Rückfragen erreichen Sie mich dienstags bis donnerstags von 8 bis 12 Uhr.

Mit freundlichen Grüßen
Im Auftrag
Katja Lindhorst`,
      },
      {
        from: "ext-lohmann",
        to: ["fb-lindhorst"],
        cc: ["ext-fbb-rautenberg"],
        date: "2025-04-12T21:37",
        body: `Sehr geehrte Frau Lindhorst,

ehrlich gesagt bin ich ziemlich sauer. Ich war am 18.03. extra bei Ihnen in der Bauberatung, und da wurde mir ausdrücklich gesagt, das ich keinen zusätzlichen Stellplatz brauche. Jetzt soll ich doch einen nachweisen?? Die Einliegerwohnung ist nur für meine Schwiegermutter, die ist 81 und hat gar kein Auto. Das ist doch keine richtige zweite Wohnung.

Und dass die Baugrenze ein Problem ist, hätte man mir auch gleich deutlicher sagen können. Der Lageplan war beim Kaufvertrag dabei, ich wusste nicht, dass der zu alt ist.

Unser Handwerker hat uns ab 16. Juni eingeplant. Wenn wir das verschieben müssen, ist er bis nächstes Jahr weg. Die Frist bis 9. Mai schaffen wir nie, der Vermesser hat frühestens Ende April einen Termin und der Statiker braucht auch noch.

Ich bitte daher um Verlängerung der Frist und um einen Rückruf. Tagsüber bin ich schlecht zu erreichen, am besten abends unter 040 66969-371.

Mit freundlichen Grüßen
Marc Lohmann
Heideweg 9
00423 Falkenbrück`,
      },
      {
        from: "fb-lindhorst",
        to: ["fb-brandt"],
        date: "2025-04-14T08:52",
        subject: "WG: Bauantrag Az. 63.2-0418/25 – Anbau und Doppelcarport Heideweg 9 – fehlende Unterlagen",
        attachments: ["fb-gespraechsnotiz-bauberatung-heideweg-9"],
        body: `Hallo Jonas,

kannst du kurz draufschauen? Herr Lohmann beruft sich auf die Bauberatung vom 18.03. Meine Gesprächsnotiz hänge ich an: Ich habe ihm damals gesagt, dass bei einer zweiten Wohnung ein Stellplatz dazukommt – da hieß es noch „keine zweite Wohnung geplant“. Jetzt steht die Einliegerwohnung im Antrag.

Vorschlag:
- Frist bis 23.05. verlängern (Vermesser und Statik sind realistisch nicht früher zu schaffen)
- Stellplatz: Der Doppelcarport hat zwei Plätze, damit wäre der Nachweis erfüllt – er muss nur im Lageplan so dargestellt werden.

Ist das für dich in Ordnung? Dann antworte ich ihm heute noch.

Danke und Gruß
Katja`,
      },
      {
        from: "fb-brandt",
        to: ["fb-lindhorst"],
        date: "2025-04-14T11:26",
        body: `Hi Katja,

passt so. Verlängerung bis 23.05. ist ok. Die Schwiegermutter hilft ihm baurechtlich nicht weiter (Wohneinheit ist Wohneinheit), aber mit dem Carport ist der Nachweis ja kein Hexenwerk. Bitte schreib ihm auch, dass die Bearbeitungszeit erst ab Vollständigkeit läuft – nicht dass er im Juni wieder anruft.

Die Befreiung von der Baugrenze sehe ich bei 1,20 m eher positiv, wenn die Nachbarn unterschreiben. Kannst du ihm so andeuten, aber ohne Zusage.

Gruß
Jonas`,
      },
      {
        from: "fb-lindhorst",
        to: ["ext-lohmann"],
        cc: ["ext-fbb-rautenberg"],
        date: "2025-04-14T14:48",
        quote: false,
        body: `Sehr geehrter Herr Lohmann,

vielen Dank für Ihre Nachricht vom Samstag. Ich verlängere die Frist zur Vorlage der Unterlagen bis zum **23.05.2025**.

Zum Stellplatz: In der Bauberatung am 18.03.2025 war nur von einer Wohnung die Rede; dafür war kein zusätzlicher Stellplatz nötig. Mit der Einliegerwohnung entsteht baurechtlich eine zweite Wohneinheit – unabhängig davon, wer dort wohnt. Den zusätzlichen Stellplatz können Sie aber mit Ihrem Doppelcarport nachweisen; Frau Rautenberg muss ihn nur im Lageplan entsprechend darstellen.

Zur Baugrenze: Eine Befreiung ist nicht ausgeschlossen. Hilfreich wäre die schriftliche Zustimmung Ihrer Nachbarn in Nr. 7 und Nr. 11. Verbindlich kann ich mich erst nach Prüfung des vollständigen Antrags äußern.

Bitte beachten Sie: Die Bearbeitung beginnt erst, wenn alle Unterlagen vorliegen, und dauert derzeit etwa drei Monate. Einen Baubeginn am 16. Juni kann ich Ihnen deshalb leider nicht in Aussicht stellen.

Gern rufe ich Sie morgen gegen 17 Uhr an.

Mit freundlichen Grüßen
Im Auftrag
Katja Lindhorst`,
      },
    ],
  },
  // ── Amt 40: WLAN und Tablets an der Gesamtschule ──
  {
    id: "fb-gesamtschule-nord-wlan-tablets",
    title: "WLAN-Probleme und Tabletklassen an der Gesamtschule Falkenbrück-Nord",
    subject: "WLAN Gebäude C und Tabletklassen – dringend",
    org: "falkenbrueck",
    unit: "fb-amt40",
    date: "2025-09-17",
    tags: ["zahlen"],
    keywords: ["Gebäude C", "Access Points", "214 Geräte", "9.600 €", "Herbstferien"],
    summary:
      "Die Schulleiterin beschwert sich über das überlastete WLAN und fehlende Tablets; Schulverwaltung und IT-Amt klären Ursachen, Übergangslösung, Kosten und Termin, die Amtsleiterin entscheidet. Für Zusammenfassungen, Entscheidungsvorlagen und eine Elterninformation.",
    mails: [
      {
        from: "ext-hauschild",
        to: ["fb-roth"],
        cc: ["fb-engel"],
        date: "2025-09-15T07:41",
        body: `Sehr geehrter Herr Roth,

ich muss mich leider schon wieder wegen des WLANs melden. Seit Schuljahresbeginn ist das Netz in **Gebäude C** praktisch nicht nutzbar. Seit dem 01.09. arbeiten unsere Jahrgänge 5 und 6 in Tabletklassen (acht Klassen, 214 Schülerinnen und Schüler). Sobald mehr als zwei Klassen gleichzeitig online sind, bricht die Verbindung ab. Letzte Woche mussten zwei Lernstandserhebungen abgebrochen werden.

Dazu kommt die Lieferung: Bestellt waren 240 Geräte (214 für die Kinder, 26 für Lehrkräfte und Reserve), angekommen sind **214 Geräte**, davon 9 mit defektem Ladeanschluss. Wir können also derzeit nur 205 funktionierende Geräte ausgeben, die Lehrkräfte haben noch gar keine. Das ist gegenüber den Eltern kaum zu vermitteln, die Ausstattung wurde beim Elternabend groß angekündigt.

Ich bitte dringend um eine Lösung bis zu den Herbstferien. Der Schulelternrat hat bereits angekündigt, sich an den Schulausschuss zu wenden.

Mit freundlichen Grüßen
Birgit Hauschild`,
      },
      {
        from: "fb-roth",
        to: ["ext-hauschild"],
        cc: ["fb-engel", "fb-yildiz"],
        date: "2025-09-16T10:31",
        body: `Sehr geehrte Frau Hauschild,

vielen Dank für die ausführliche Schilderung, und entschuldigen Sie die Probleme. Ich habe gestern mit dem Netzwerkteam die Auswertung des WLAN-Controllers angesehen:

- In Gebäude C hängen 22 Unterrichtsräume an 6 Access Points aus dem Jahr 2017. Sie waren für Präsentationstechnik ausgelegt, nicht für 30 Tablets je Raum.
- Der vollständige Ausbau (ein Access Point je Raum, neue Verkabelung) ist im Medienentwicklungsplan für 2026 vorgesehen, Kosten rund 68.000 €.
- Als Übergangslösung schlage ich 8 zusätzliche Access Points in den Räumen der Tabletklassen vor. Kosten einschließlich Montage rund **9.600 €**.

Zur Lieferung: Der Lieferant hat die fehlenden 26 Geräte für den 10.10. zugesagt. Die 9 defekten Geräte gehen heute als Garantiefall zurück; Ersatz kommt innerhalb von zehn Arbeitstagen.

Könnten Sie mir bitte eine Liste der Räume mit Tabletklassen und den Stundenplan schicken? Dann planen wir die Montage so, dass möglichst wenig Unterricht ausfällt.

Mit freundlichen Grüßen
Simon Roth`,
      },
      {
        from: "fb-yildiz",
        to: ["fb-roth"],
        cc: ["ext-hauschild", "fb-engel"],
        date: "2025-09-16T15:47",
        body: `Hallo Herr Roth, hallo Frau Hauschild,

kurz aus Sicht von Amt 12: Die Glasfaseranbindung der Schule (1 Gbit/s) reicht aus. Das Nadelöhr sind die Access Points – und der Adressbereich im Schülernetz. Der ist mit 254 Adressen zu klein für 214 Tablets plus Geräte der Lehrkräfte und Präsentationstechnik. Den erweitern wir morgen früh per Fernwartung, das dürfte schon spürbar helfen.

Die Montage der zusätzlichen Access Points schaffen wir personell erst in den Herbstferien (13. bis 24.10.). Vorher ist das Team mit dem Umzug des Bürgerbüros Nord ausgelastet – tut mir leid.

Viele Grüße
Murat Yıldız`,
      },
      {
        from: "fb-engel",
        to: ["fb-roth", "ext-hauschild"],
        cc: ["fb-yildiz", "fb-siebert"],
        date: "2025-09-17T08:14",
        body: `Liebe Frau Hauschild, lieber Herr Roth,

danke für die schnelle Abstimmung. Ich habe entschieden:

1. Die 8 zusätzlichen Access Points werden beauftragt. Die rund 9.600 € gehen zulasten des Budgets Medienentwicklung; dort sind für 2025 noch 31.000 € verfügbar.
2. Die Montage erfolgt in den Herbstferien, wie von Herrn Yıldız vorgeschlagen.
3. Herr Roth informiert Sie wöchentlich über den Stand der Geräteauslieferung.

Frau Hauschild, für den Schulausschuss am 30.09. bereite ich eine kurze Information vor. Gern können Sie den Schulelternrat vorab auf diesen Zeitplan hinweisen.

Mit freundlichen Grüßen
Christiane Engel`,
      },
    ],
  },
  // ── Amt 51: Betriebskostenzuschuss Kinderwelt (Zahlen widersprechen sich) ──
  {
    id: "fb-kinderwelt-betriebskostenzuschuss-2025",
    title: "Kinderwelt Falkenbrück – Abrechnung des Betriebskostenzuschusses 2025",
    subject: "Verwendungsnachweis 2025 – Betriebskostenzuschuss Kinderwelt Falkenbrück gGmbH",
    org: "falkenbrueck",
    unit: "fb-amt51-kita",
    date: "2026-06-19",
    tags: ["widersprueche", "zahlen"],
    keywords: ["Verwendungsnachweis 2025", "769.700 €", "Gastkinder", "Abschlag", "Verwaltungskostenpauschale"],
    summary:
      "Kita-Träger und Jugendamt rechnen den Betriebskostenzuschuss 2025 ab und kommen zu entgegengesetzten Ergebnissen (Nachzahlung 769.700 € gegenüber Überzahlung 145.246 €). Widersprüche: drei oder vier Abschläge, Zahlungseingang 18.12.2025 oder 07.01.2026, 14 oder 11 Gastkinder; außerdem ergeben Personal- und Sachkosten nicht die angegebenen Gesamtkosten.",
    mails: [
      {
        from: "ext-fbb-sommerfeld",
        to: ["fb-tiemann"],
        cc: ["ext-gruen"],
        date: "2026-06-08T09:12",
        body: `Sehr geehrter Herr Tiemann,

wie besprochen übersende ich Ihnen vorab die Eckdaten unseres **Verwendungsnachweis 2025** für unsere fünf Einrichtungen in Falkenbrück. Das unterschriebene Original geht heute per Post an Sie.

Kosten 2025:
- Personalkosten: 5.912.300 €
- Sachkosten: 1.140.800 €
- Gesamtkosten: 7.017.100 €

abzüglich:
- Landeszuweisung nach KiTaG: 3.284.000 €
- Elternbeiträge: 812.500 €
- Trägeranteil 5 %: 350.900 €

= Zuschussbedarf Stadt Falkenbrück: 2.569.700 €
abzüglich erhaltene Abschläge 2025 (3 x 600.000 €): 1.800.000 €
= **Nachzahlung: 769.700 €**

Die durchschnittliche Belegung lag 2025 bei 412 Plätzen (Vorjahr 398). Wir bitten um Auszahlung des Restbetrags bis Ende Juli, da wir die Tariferhöhung zum 01.04.2026 vorfinanzieren müssen.

Mit freundlichen Grüßen
Karla Sommerfeld`,
      },
      {
        from: "fb-tiemann",
        to: ["ext-fbb-sommerfeld"],
        cc: ["ext-gruen", "fb-lindner"],
        date: "2026-06-12T13:40",
        body: `Sehr geehrte Frau Sommerfeld,

vielen Dank für die Unterlagen. Nach unserer Prüfung können wir eine Nachzahlung in dieser Höhe nicht bestätigen. Im Einzelnen:

1. **Abschläge:** Die Stadt hat 2025 vier Abschläge zu je 600.000 € gezahlt, also 2.400.000 €. Der vierte Abschlag wurde am 15.12.2025 angewiesen.
2. **Verwaltungskosten:** In den Personalkosten sind Verwaltungskosten enthalten, die die vereinbarte Verwaltungskostenpauschale von 8 % um 96.400 € übersteigen. Dieser Betrag ist nicht zuwendungsfähig.
3. **Gastkinder:** Nach unserer Platzvergabe waren im Jahresdurchschnitt 14 der 412 Plätze mit Kindern aus Gemeinden des Landkreises Altmoorland belegt. Diese Kosten sind über den Kostenausgleich mit den Wohnsitzgemeinden abzurechnen, nicht über den städtischen Zuschuss.

Unsere Berechnung:
- anerkannte Kosten: 7.017.100 € – 96.400 € = 6.920.700 €
- abzüglich Anteil Gastkinder (14/412): 235.169 €
- verbleiben: 6.685.531 €
- abzüglich Landeszuweisung 3.284.000 €, Elternbeiträge 812.500 € und Trägeranteil 5 % (334.277 €)
- = Zuschuss der Stadt: 2.254.754 €
- abzüglich Abschläge: 2.400.000 €
- = **Überzahlung: 145.246 €**

Bevor wir einen Rückforderungsbescheid vorbereiten, gebe ich Ihnen Gelegenheit zur Stellungnahme bis zum 26.06.2026.

Mit freundlichen Grüßen
Bernd Tiemann`,
      },
      {
        from: "ext-gruen",
        to: ["fb-tiemann"],
        cc: ["fb-wehling", "ext-fbb-sommerfeld"],
        date: "2026-06-17T18:05",
        body: `Sehr geehrter Herr Tiemann,

Ihre Mail hat bei uns, gelinde gesagt, Erstaunen ausgelöst.

Zum vierten Abschlag: Der ist auf unserem Konto am 07.01.2026 eingegangen und gehört damit in unser Wirtschaftsjahr 2026. Wir rechnen nach Zufluss ab, das ist seit Jahren mit Ihrem Haus so abgestimmt.

Zu den Gastkindern: Frau Lindner hat uns 2024 ausdrücklich gebeten, freie Plätze in der Kita Birkenhof auch an Familien aus Brackenhain zu vergeben, weil die Gemeinde nicht genug Krippenplätze hatte. Dass die Stadt uns diese Kosten jetzt streicht, ist nicht nachvollziehbar. Außerdem waren es nach unserer Liste 11 Kinder, nicht 14.

Eine Rückforderung von 145.000 € würde uns in eine ernste Liquiditätslage bringen. Ich bitte um einen Gesprächstermin mit Herrn Wehling noch vor dem 26.06.

Mit freundlichen Grüßen
Matthias Grün`,
      },
      {
        from: "fb-wehling",
        to: ["ext-gruen"],
        cc: ["fb-tiemann", "fb-lindner", "ext-fbb-sommerfeld"],
        date: "2026-06-19T10:22",
        body: `Sehr geehrter Herr Grün,

danke für Ihre Rückmeldung. Ich schlage ein Gespräch am Dienstag, 30.06.2026, um 10 Uhr im Jugendamt, Raum 1.12, vor. Die Frist zur Stellungnahme verlängern wir bis zum 10.07.2026.

Vorab drei Punkte, damit wir uns gut vorbereiten können:
- Nach Auskunft der Stadtkasse wurde der vierte Abschlag am 18.12.2025 auf Ihr Konto DE00 2105 3170 4044 3109 87 überwiesen. Bitte prüfen Sie Ihre Kontoauszüge; möglicherweise ist die Zahlung bei Ihnen erst im Januar gebucht worden.
- Zur Zahl der Gastkinder bitten wir um Ihre Liste mit Geburtsdatum und Wohnort der Kinder; wir gleichen sie mit unserer Platzvergabe ab.
- Frau Lindner nimmt an dem Gespräch teil und kann zu der Absprache aus 2024 Stellung nehmen.

Zu Ihrer Sorge um die Liquidität: Sollte am Ende eine Rückforderung stehen, ist eine Stundung oder Verrechnung mit den Abschlägen 2026 grundsätzlich möglich – auch unter der seit 02.06.2026 geltenden Haushaltssperre. Das besprechen wir am 30.06.

Mit freundlichen Grüßen
Torsten Wehling`,
      },
    ],
  },
  // ── Amt 67: Baumfällantrag einer Bürgerin (personendaten, Anhang Bescheid) ──
  {
    id: "fb-baumfaellung-amselweg-17-horn",
    title: "Baumfällantrag Amselweg 17 – Schriftwechsel mit einer Bürgerin",
    subject: "Antrag Fällung Ahorn Amselweg 17",
    org: "falkenbrueck",
    unit: "fb-amt67",
    date: "2026-02-07",
    tags: ["personendaten"],
    keywords: ["Amselweg 17", "Ortstermin", "28. Februar", "Bergahorn", "Widerspruch"],
    summary:
      "Eine 78-jährige Bürgerin möchte einen Ahorn in ihrem Garten fällen lassen; das Grünflächenamt lehnt nach Ortstermin ab und erlaubt einen Pflegeschnitt (Bescheid als Anhang). Die Bürgerin reagiert enttäuscht und legt per E-Mail Widerspruch ein. Übungen: Antwort entwerfen, Form des Widerspruchs prüfen, Personendaten anonymisieren.",
    mails: [
      {
        from: "ext-horn",
        to: ["fb-friedrich"],
        date: "2026-01-11T20:47",
        body: `Sehr geehrte Damen und Herren,

hiermit beantrage ich die Fällung von dem großen Ahornbaum in meinem Garten (Amselweg 17). Der Baum ist bestimmt 20 Meter hoch und steht direkt hinter dem Gartenhaus. Bei dem Sturm kurz vor Weihnachten ist ein dicker Ast abgebrochen und auf das Dach vom Gartenhaus gefallen, das Dach ist jetzt kaputt. Ich habe seitdem jede Nacht Angst wenn es windig ist.

Ausserdem schaffe ich das Laub nicht mehr, ich bin 78 und mein Rücken macht nicht mehr mit. Im Frühjahr wachsen überall die kleinen Ahornpflanzen im Beet und auf dem Rasen, und die Dachrinne ist ständig verstopft.

Meine Tochter sagt, im eigenen Garten braucht man für sowas gar keine Genehmigung? Ich wollte aber lieber fragen, bevor ich Ärger bekomme. Ein Gärtner aus der Nachbarschaft könnte den Baum Ende Januar fällen.

Sie erreichen mich am besten vormittags unter 040 66969-214.

Mit freundlichen Grüßen
Elisabeth Horn
Amselweg 17
00421 Falkenbrück`,
      },
      {
        from: "fb-friedrich",
        to: ["ext-horn"],
        date: "2026-01-13T10:22",
        body: `Sehr geehrte Frau Horn,

vielen Dank für Ihre Nachricht. Wir behandeln sie als Antrag auf Fällung nach der Baumschutzsatzung (Aktenzeichen 67.3-BS-0034/26).

Ihre Tochter hat leider nicht recht: Bäume mit einem Stammumfang von mehr als 80 cm, gemessen in 1 m Höhe, sind auch auf Privatgrundstücken geschützt. Bitte lassen Sie den Baum deshalb auf keinen Fall vor unserer Entscheidung fällen – das könnte ein Bußgeld nach sich ziehen.

Ich würde mir den Baum gern gemeinsam mit unserem Baumkontrolleur Herrn Stratmann ansehen. Passt Ihnen ein **Ortstermin** am Dienstag, 20.01.2026, um 9:30 Uhr? Falls Sie Fotos von dem Schaden am Gartenhaus haben, legen Sie diese bitte bereit.

Bitte beachten Sie: Fällungen und starke Rückschnitte sind wegen des Vogelschutzes nur bis zum **28. Februar** erlaubt. Wir entscheiden deshalb zügig.

Mit freundlichen Grüßen
Moritz Friedrich`,
      },
      {
        from: "ext-horn",
        to: ["fb-friedrich"],
        date: "2026-01-27T16:58",
        body: `Sehr geehrter Herr Friedrich,

danke nochmal das Sie mit Ihrem Kollegen da waren. Ich habe aber nicht ganz verstanden, was jetzt passiert. Ihr Kollege hat gesagt der Baum ist „vital“, aber er hat doch selbst gesehen, wie der Ast das Dach kaputt gemacht hat. Wenn noch mal so ein Ast runterkommt und mein Enkel spielt im Garten, wer haftet dann?

Bei Familie Kortmann zwei Häuser weiter wurde im letzten Jahr auch eine große Birke gefällt, da ging das doch auch.

Bitte geben Sie mir bald Bescheid, der Gärtner will wissen ob er kommen soll. Er hat nur noch bis Mitte Februar Zeit.

Mit freundlichen Grüßen
E. Horn`,
      },
      {
        from: "fb-friedrich",
        to: ["ext-horn"],
        cc: ["fb-berger"],
        date: "2026-02-04T11:40",
        attachments: ["fb-bescheid-baumfaellung-amselweg-17"],
        body: `Sehr geehrte Frau Horn,

anbei erhalten Sie unseren Bescheid zu Ihrem Antrag. Das Original geht Ihnen zusätzlich per Post zu.

Ich weiß, dass das Ergebnis nicht das ist, was Sie sich gewünscht haben: Eine Fällung können wir nicht genehmigen. Der **Bergahorn** ist gesund und standsicher; der abgebrochene Ast war nach unserer Einschätzung ein Einzelschaden durch den Sturm. Erlaubt ist aber ein Pflegeschnitt: Ihr Gärtner darf das Totholz entfernen und die Äste über dem Gartenhaus um bis zu 2 Meter einkürzen. Damit sinkt das Risiko weiterer Astabbrüche deutlich. Der Schnitt muss bis zum 28. Februar erledigt sein.

Zur Fällung bei Ihren Nachbarn kann ich aus Datenschutzgründen nichts sagen; jeder Antrag wird einzeln geprüft.

Wenn Sie Fragen zum Bescheid haben, rufen Sie mich gern an.

Mit freundlichen Grüßen
Moritz Friedrich`,
      },
      {
        from: "ext-horn",
        to: ["fb-friedrich"],
        cc: ["fb-lassberg"],
        date: "2026-02-07T19:12",
        body: `Sehr geehrter Herr Friedrich,

ich bin wirklich enttäuscht. Ich zahle seit 46 Jahren Steuern in dieser Stadt und jetzt darf ich in meinem eigenen Garten nicht mal entscheiden, ob ein Baum stehen bleibt. Für den Pflegeschnitt hat mir der Gärtner 680 Euro genannt, das kann ich von meiner Rente nicht einfach so bezahlen. Und dann soll ich noch 45 Euro Gebühr bezahlen für eine Ablehnung??

Ich lege hiermit **Widerspruch** ein. Ich setze auch die Frau Oberbürgermeisterin in Kopie, vielleicht kann sie mir ja helfen.

Elisabeth Horn`,
      },
    ],
  },
];
