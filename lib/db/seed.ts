import type { EffortMap, ModelCapabilities } from "@/lib/shared/types";

export interface SeedModel {
  id: string;
  provider: "anthropic" | "openai";
  modelId: string;
  displayName: string;
  description: string;
  isDefault?: boolean;
  sortOrder: number;
  capabilities: ModelCapabilities;
  effortMap: EffortMap;
  defaultEffort: "low" | "medium" | "high" | "max";
  maxOutputTokens: number;
  priceIn: number;
  priceOut: number;
  priceCacheRead: number;
  priceCacheWrite: number;
}

const CLAUDE_CAPS: ModelCapabilities = {
  vision: true,
  pdf: true,
  webSearch: true,
  tools: true,
  reasoning: true,
  perMessageEffort: true,
  fallbacks: true,
};

const GPT6_CAPS: ModelCapabilities = {
  vision: true,
  pdf: true,
  webSearch: true,
  tools: true,
  reasoning: true,
  // GPT-6: configuration_update-Items ändern den Effort ohne Präfix-Änderung
  perMessageEffort: true,
  fallbacks: false,
};

const FULL_EFFORT: EffortMap = { low: "low", medium: "medium", high: "high", max: "max" };

// Preise in USD pro 1 Mio. Tokens (Listenpreise Oktober 2026). Im Admin-Bereich änderbar.
export const SEED_MODELS: SeedModel[] = [
  {
    id: "claude-sonnet-5-5",
    provider: "anthropic",
    modelId: "claude-sonnet-5-5",
    displayName: "Claude Sonnet 5.5",
    description: "Der Allrounder für Texte, Analysen und Code – unser Standard.",
    isDefault: true,
    sortOrder: 10,
    capabilities: CLAUDE_CAPS,
    effortMap: FULL_EFFORT,
    defaultEffort: "medium",
    maxOutputTokens: 64000,
    priceIn: 2,
    priceOut: 10,
    priceCacheRead: 0.2,
    priceCacheWrite: 2.5,
  },
  {
    id: "claude-opus-5-5",
    provider: "anthropic",
    modelId: "claude-opus-5-5",
    displayName: "Claude Opus 5.5",
    description: "Für anspruchsvolle Aufgaben, lange Dokumente und knifflige Analysen.",
    sortOrder: 20,
    capabilities: CLAUDE_CAPS,
    effortMap: FULL_EFFORT,
    defaultEffort: "medium",
    maxOutputTokens: 64000,
    priceIn: 4,
    priceOut: 20,
    priceCacheRead: 0.2,
    priceCacheWrite: 5,
  },
  {
    id: "claude-haiku-5-5",
    provider: "anthropic",
    modelId: "claude-haiku-5-5",
    displayName: "Claude Haiku 5.5",
    description: "Schnell und günstig für einfache Aufgaben.",
    sortOrder: 30,
    capabilities: { ...CLAUDE_CAPS, fallbacks: false, anthropicWebTools: "basic" },
    effortMap: FULL_EFFORT,
    defaultEffort: "medium",
    maxOutputTokens: 32000,
    priceIn: 0.1,
    priceOut: 0.5,
    priceCacheRead: 0.01,
    priceCacheWrite: 0.125,
  },
  {
    id: "gpt-6-1-sol",
    provider: "openai",
    modelId: "gpt-6.1-sol",
    displayName: "GPT-6.1 Sol",
    description: "OpenAIs ausgewogenes Modell zwischen Intelligenz und Kosten.",
    sortOrder: 40,
    capabilities: GPT6_CAPS,
    effortMap: FULL_EFFORT,
    defaultEffort: "medium",
    maxOutputTokens: 64000,
    priceIn: 2,
    priceOut: 10,
    priceCacheRead: 0.1,
    priceCacheWrite: 2.5,
  },
  {
    id: "gpt-6-astra",
    provider: "openai",
    modelId: "gpt-6-astra",
    displayName: "GPT-6 Astra",
    description: "OpenAIs Flaggschiff für komplexe Aufgaben.",
    sortOrder: 50,
    capabilities: GPT6_CAPS,
    effortMap: FULL_EFFORT,
    defaultEffort: "medium",
    maxOutputTokens: 64000,
    priceIn: 10,
    priceOut: 50,
    priceCacheRead: 1,
    priceCacheWrite: 12.5,
  },
  {
    id: "gpt-6-luna",
    provider: "openai",
    modelId: "gpt-6-luna",
    displayName: "GPT-6 Luna",
    description: "OpenAIs schnelles und günstiges Modell.",
    sortOrder: 60,
    capabilities: GPT6_CAPS,
    effortMap: FULL_EFFORT,
    defaultEffort: "medium",
    maxOutputTokens: 32000,
    priceIn: 0.1,
    priceOut: 0.5,
    priceCacheRead: 0.01,
    priceCacheWrite: 0.125,
  },
];

export interface SeedPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptAddendum: string;
  sortOrder: number;
}

export const SEED_PRESETS: SeedPreset[] = [
  {
    id: "email-profi",
    name: "E-Mail-Profi",
    icon: "mail",
    description: "Formuliert klare, freundliche und professionelle E-Mails.",
    promptAddendum:
      "Rolle: Du bist ein erfahrener Kommunikationsprofi für geschäftliche E-Mails. Frage bei Bedarf kurz nach Empfänger, Ziel und Tonalität. Liefere die E-Mail mit Betreffzeile, klarer Struktur und passendem Gruß. Biete auf Wunsch eine kürzere und eine förmlichere Variante an.",
    sortOrder: 10,
  },
  {
    id: "excel-erklaerer",
    name: "Excel-Erklärer",
    icon: "table",
    description: "Erklärt Formeln, analysiert Tabellen und baut Auswertungen.",
    promptAddendum:
      "Rolle: Du bist ein geduldiger Excel- und Datenexperte. Erkläre Formeln Schritt für Schritt mit deutschen Funktionsnamen (z. B. SVERWEIS, XVERWEIS, SUMMEWENNS) und gib Beispiele. Wenn Tabellen hochgeladen werden, fasse Struktur und Auffälligkeiten zusammen und schlage sinnvolle Auswertungen vor. Visualisiere Ergebnisse auf Wunsch als HTML-Artefakt mit Chart.js.",
    sortOrder: 20,
  },
  {
    id: "praesentations-coach",
    name: "Präsentations-Coach",
    icon: "presentation",
    description: "Hilft bei Struktur, Folientexten und Storytelling.",
    promptAddendum:
      "Rolle: Du bist ein Präsentations-Coach. Hilf beim roten Faden, bei prägnanten Folientiteln und bei Sprechernotizen. Halte Folientexte kurz (maximal fünf Stichpunkte pro Folie). Biete an, eine Folienstruktur als Tabelle oder eine einfache HTML-Präsentation als Artefakt zu erstellen.",
    sortOrder: 30,
  },
  {
    id: "webseiten-baukasten",
    name: "Webseiten-Baukasten",
    icon: "layout",
    description: "Baut kleine Webseiten, Prototypen und interaktive Grafiken.",
    promptAddendum:
      "Rolle: Du bist ein Frontend-Entwickler mit Sinn für Design. Erstelle auf Wunsch vollständige, eigenständige HTML-Seiten als Artefakt (inklusive CSS und JavaScript in einer Datei, responsiv, barrierearm, ansprechendes modernes Design). Erkläre danach kurz, was du gebaut hast und wie man es anpassen kann.",
    sortOrder: 40,
  },
  {
    id: "ideen-sparring",
    name: "Ideen-Sparring",
    icon: "lightbulb",
    description: "Kreativer Sparringspartner für Brainstorming und Konzepte.",
    promptAddendum:
      "Rolle: Du bist ein kreativer Sparringspartner. Entwickle vielfältige, auch ungewöhnliche Ideen, ordne sie anschließend nach Aufwand und Wirkung und stelle gezielte Rückfragen, um die besten Ideen weiterzuentwickeln.",
    sortOrder: 50,
  },
];

// ---------------------------------------------------------------- Startbestand der Prompts im Fundus

export interface SeedPromptCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface SeedPrompt {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  text: string;
  /** Einstellungen je Platzhalter (Schlüssel wie placeholderKey: klein, ä = ae). */
  placeholders: Record<string, { label?: string; hint?: string; type?: "text" | "area" | "select"; options?: string[]; default?: string }>;
  sortOrder: number;
}

export const SEED_PROMPT_CATEGORIES: SeedPromptCategory[] = [
  { id: "kat-schreiben", name: "Schreiben", sortOrder: 10 },
  { id: "kat-zusammenfassen", name: "Zusammenfassen", sortOrder: 20 },
  { id: "kat-einfache-sprache", name: "Einfache Sprache", sortOrder: 30 },
  { id: "kat-auswerten", name: "Auswerten", sortOrder: 40 },
  { id: "kat-recherche", name: "Recherche", sortOrder: 50 },
  { id: "kat-prompten-lernen", name: "Prompten lernen", sortOrder: 60 },
];

export const SEED_PROMPTS: SeedPrompt[] = [
  {
    id: "prompt-buergeranfrage",
    categoryId: "kat-schreiben",
    title: "Bürgeranfrage freundlich beantworten",
    description: "Antwortentwurf mit nächsten Schritten, ohne erfundene Fristen.",
    text: "Du arbeitest im {{Fachbereich}}. Beantworte die angehängte Anfrage freundlich und verständlich in höchstens {{Wortzahl}} Wörtern. Nenne die nächsten Schritte. Erfinde keine Fristen oder Zusagen – was du nicht weißt, markierst du als offene Frage.",
    placeholders: { fachbereich: { hint: "z. B. Fachdienst ÖPNV" }, wortzahl: { type: "select", options: ["100", "150", "250"], default: "150" } },
    sortOrder: 10,
  },
  {
    id: "prompt-absage",
    categoryId: "kat-schreiben",
    title: "Absage höflich formulieren",
    description: "Klar in der Sache, freundlich im Ton, mit Alternative.",
    text: "Formuliere eine höfliche, klare Absage an {{Empfänger}} zum Anliegen „{{Anliegen}}“. Begründe kurz, biete wenn möglich eine Alternative an und bleib unter 120 Wörtern.",
    placeholders: { empfaenger: { hint: "z. B. Herrn Akbulut" }, anliegen: { hint: "z. B. Fristverlängerung" } },
    sortOrder: 20,
  },
  {
    id: "prompt-pressemitteilung",
    categoryId: "kat-schreiben",
    title: "Pressemitteilung entwerfen",
    description: "W-Fragen, ein Zitat, höchstens 250 Wörter.",
    text: "Schreibe eine Pressemitteilung zu {{Anlass}}. Aufbau: Überschrift, Vorspann mit den W-Fragen, zwei Absätze, ein Zitat von {{Person}}. Höchstens 250 Wörter, sachlicher Ton.",
    placeholders: { anlass: { hint: "z. B. Start des Wärmeplans" }, person: { hint: "z. B. der Oberbürgermeisterin" } },
    sortOrder: 30,
  },
  {
    id: "prompt-vorlage-stichpunkte",
    categoryId: "kat-zusammenfassen",
    title: "Vorlage in Stichpunkten zusammenfassen",
    description: "Lange Vorlage, kurze Übersicht – mit offenen Fragen.",
    text: "Fasse die angehängte Vorlage in {{Anzahl}} Stichpunkten für {{Zielgruppe}} zusammen. Nenne zuerst die wichtigste Entscheidung. Markiere Zahlen, die vor einer Weitergabe geprüft werden sollten, und liste offene Fragen extra auf.",
    placeholders: { anzahl: { type: "select", options: ["3", "5", "7"], default: "5" }, zielgruppe: { hint: "z. B. den Hauptausschuss" } },
    sortOrder: 10,
  },
  {
    id: "prompt-mailverlauf",
    categoryId: "kat-zusammenfassen",
    title: "E-Mail-Verlauf zusammenfassen",
    description: "Wer will was von wem? Welche Fristen laufen?",
    text: "Fasse den angehängten E-Mail-Verlauf für {{Zielgruppe}} in {{Anzahl Punkte}} Punkten zusammen: Wer will was von wem? Welche Fristen laufen? Was ist noch offen?\nAchte besonders auf: {{Schwerpunkt}}",
    placeholders: {
      zielgruppe: { hint: "z. B. die Amtsleitung" },
      "anzahl punkte": { default: "5" },
      schwerpunkt: { label: "Was ist dir wichtig?", hint: "z. B. Kosten und Vertragsstrafen", type: "area" },
    },
    sortOrder: 20,
  },
  {
    id: "prompt-protokoll-aufgaben",
    categoryId: "kat-zusammenfassen",
    title: "Aufgaben aus einem Protokoll ziehen",
    description: "Wer macht was bis wann – fehlende Angaben markiert.",
    text: "Lies das angehängte Protokoll und erstelle eine Aufgabenliste als Tabelle: Was ist zu tun? Wer ist zuständig? Bis wann? Kennzeichne Aufgaben ohne Zuständigkeit oder Frist mit „offen“.",
    placeholders: {},
    sortOrder: 30,
  },
  {
    id: "prompt-einfache-sprache",
    categoryId: "kat-einfache-sprache",
    title: "Behördentext in Einfache Sprache",
    description: "Kurze Sätze, keine Fachwörter, das Wichtigste zuerst.",
    text: "Schreibe den angehängten Text in Einfacher Sprache um: kurze Sätze, ein Gedanke pro Satz, keine Fachwörter. Was die Leserinnen und Leser tun müssen, steht ganz oben. Zielgruppe: {{Zielgruppe}}.",
    placeholders: { zielgruppe: { hint: "z. B. Haushalte in Heidhof" } },
    sortOrder: 10,
  },
  {
    id: "prompt-verstaendlichkeit",
    categoryId: "kat-einfache-sprache",
    title: "Text auf Verständlichkeit prüfen",
    description: "Lange Sätze und Fachwörter finden, einfacher sagen.",
    text: "Prüfe den folgenden Text auf Verständlichkeit für {{Zielgruppe}}. Markiere lange Sätze und Fachwörter und schlage einfachere Formulierungen vor.\n\nText:\n{{Text}}",
    placeholders: { zielgruppe: { hint: "z. B. Eltern von Kita-Kindern" }, text: { hint: "Text hier einfügen", type: "area" } },
    sortOrder: 20,
  },
  {
    id: "prompt-tabelle-diagramm",
    categoryId: "kat-auswerten",
    title: "Tabelle auswerten und als Diagramm zeigen",
    description: "Die größten Veränderungen finden und erklären.",
    text: "Werte die angehängte Tabelle aus. Was hat sich gegenüber dem Vorjahr am stärksten verändert? Zeige die {{Anzahl}} wichtigsten Entwicklungen als Diagramm und erkläre sie in einfachen Worten für {{Zielgruppe}}.",
    placeholders: { anzahl: { type: "select", options: ["2", "3", "5"], default: "3" }, zielgruppe: { hint: "z. B. die Landrätin" } },
    sortOrder: 10,
  },
  {
    id: "prompt-widersprueche",
    categoryId: "kat-auswerten",
    title: "Widersprüche zwischen Dokumenten finden",
    description: "Zahlen, Daten und Aussagen vergleichen – mit Fundstelle.",
    text: "Vergleiche die angehängten Dokumente. Liste jede Stelle auf, an der sich Zahlen, Daten oder Aussagen widersprechen – als Tabelle mit Fundstelle, beiden Aussagen und einer Einschätzung, welche stimmt.",
    placeholders: {},
    sortOrder: 20,
  },
  {
    id: "prompt-fakten-quellen",
    categoryId: "kat-recherche",
    title: "Fakten mit Quellen prüfen",
    description: "Websuche mit klarer Trennung: gesichert, umstritten, unklar.",
    text: "Recherchiere im Web, was aktuell zu {{Thema}} gilt. Nenne nur Aussagen, für die du eine Quelle angeben kannst, und verlinke sie. Trenne klar: gesichert – umstritten – unklar.",
    placeholders: { thema: { hint: "z. B. Fristen beim Führerscheinumtausch" } },
    sortOrder: 10,
  },
  {
    id: "prompt-verbessern",
    categoryId: "kat-prompten-lernen",
    title: "Meinen Prompt verbessern lassen",
    description: "Freebie stellt Rückfragen und schlägt eine bessere Fassung vor.",
    text: "Hier ist mein Prompt:\n\n{{Dein Prompt}}\n\nStelle mir zuerst drei Rückfragen, die das Ergebnis besser machen würden. Schreibe danach eine verbesserte Fassung und erkläre kurz, was du geändert hast.",
    placeholders: { "dein prompt": { hint: "Deinen Prompt hier einfügen", type: "area" } },
    sortOrder: 10,
  },
];
