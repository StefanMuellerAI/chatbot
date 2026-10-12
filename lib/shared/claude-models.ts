// Modellgenerationen von Claude – reine Logik, auch im Browser (Admin) nutzbar.

/**
 * Liest die Version aus einer Claude-Modell-ID, z. B. „claude-haiku-4-5-20251001“ → 4.5,
 * „claude-opus-4-1“ → 4.1, „claude-sonnet-4-20250514“ → 4, „claude-3-7-sonnet-…“ → 3.7.
 * Unbekannte Muster ergeben null.
 */
export function claudeVersion(modelId: string): number | null {
  const id = modelId.toLowerCase().replace(/^.*?(?=claude-)/, "");
  const m =
    /^claude-(?:opus|sonnet|haiku)-(\d+)(?:-(\d{1,2})(?=$|[-@]))?/.exec(id) ??
    /^claude-(\d+)(?:-(\d{1,2})(?=$|[-@]))?-(?:opus|sonnet|haiku)/.exec(id);
  if (!m) return null;
  return Number(m[1]) + (m[2] ? Number(m[2]) / 10 : 0);
}

/**
 * Ältere Modelle vor Claude 4.6 (z. B. Haiku 4.5, Sonnet 4.5, Opus 4.5): Thinking nur mit festem
 * Token-Budget, kein adaptives Thinking, kein Effort, keine Effort-System-Nachrichten,
 * kein Refusal-Fallback und nur die Basis-Version der Web-Tools.
 */
export function isLegacyClaude(modelId: string): boolean {
  const v = claudeVersion(modelId);
  return v !== null && v < 4.6;
}
