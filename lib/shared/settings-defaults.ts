import type { FeatureFlags } from "./types";

// Reine Daten ohne Server-Abhängigkeiten – auch von Tests nutzbar.

export interface AppSettings {
  features: FeatureFlags;
  imageModel: string;
  imageDefaultQuality: "low" | "medium" | "high";
  imageDefaultSize: "1024x1024" | "1536x1024" | "1024x1536";
  transcriptionModel: string;
  dictationModel: string;
  titleModelId: string;
  claudeCacheTtl: "5m" | "1h";
  answerCacheHours: number;
  fileRetentionDays: number;
  nativePdf: boolean;
  noticeText: string;
  noticeShort: string;
  paused: boolean;
  pausedMessage: string;
  systemPromptAddendum: string;
  /** Begrüßungs-E-Mail für neue Gast-Postfächer (beide leer: keine). */
  mailWelcomeSubject: string;
  mailWelcomeText: string;
  /** Wird bei „Alle abmelden“ erhöht und meldet damit alle Sitzungen ab. */
  sessionVersion: number;
}

export const DEFAULT_NOTICE =
  "Freebie ist eine Spiel- und Übungsumgebung für unsere Schulungen. Alle Eingaben, Dateien und Sprachaufnahmen werden zur Verarbeitung an OpenAI und Anthropic in den USA übertragen. Die Anwendung läuft bei Vercel (USA). Identische Anfragen können zur Kostenersparnis aus einem gemeinsamen Zwischenspeicher beantwortet werden. Bitte gib keine personenbezogenen, vertraulichen oder geschäftskritischen Daten ein.";

export const DEFAULT_WELCOME_SUBJECT = "Willkommen in deinem Posteingang";

export const DEFAULT_WELCOME_TEXT = `Hallo,

willkommen in deinem Übungs-Posteingang! Deine Adresse steht im Posteingang unter „Deine Adresse“. Du kannst allen aus deiner Gruppe schreiben und der Kursleitung.

Probier es aus: Schalte im Chat unter „Verbindungen“ den Posteingang ein und frag Freebie, was in deinen E-Mails steht. Freebie kann auch in deinem Namen antworten.

Beim Abmelden wird dein Posteingang gelöscht.

Viel Spaß!
Deine Kursleitung`;

export const DEFAULT_SETTINGS: AppSettings = {
  features: {
    webSearch: true,
    uploads: true,
    transcription: true,
    dictation: true,
    imageGeneration: true,
    artifacts: true,
    answerCache: true,
    showCacheBadge: true,
    showCost: false,
    mailbox: true,
  },
  imageModel: "gpt-image-2",
  imageDefaultQuality: "medium",
  imageDefaultSize: "1024x1024",
  transcriptionModel: "gpt-transcribe",
  dictationModel: "gpt-transcribe",
  titleModelId: "claude-haiku-5-5",
  claudeCacheTtl: "5m",
  answerCacheHours: 24,
  fileRetentionDays: 7,
  nativePdf: false,
  noticeText: DEFAULT_NOTICE,
  noticeShort: "Spielumgebung – bitte keine vertraulichen oder personenbezogenen Daten eingeben.",
  paused: false,
  pausedMessage: "Freebie macht gerade eine kurze Pause. Bitte wende dich an die Kursleitung.",
  systemPromptAddendum: "",
  mailWelcomeSubject: DEFAULT_WELCOME_SUBJECT,
  mailWelcomeText: DEFAULT_WELCOME_TEXT,
  sessionVersion: 1,
};
