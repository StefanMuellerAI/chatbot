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
