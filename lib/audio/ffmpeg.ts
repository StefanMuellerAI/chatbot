import "server-only";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { HttpError } from "@/lib/errors";
import os from "node:os";
import path from "node:path";

const SEGMENT_SECONDS = 600; // 10 Minuten ≈ 3,6 MB bei 48 kbit/s – weit unter dem 25-MB-Limit

function ffmpegPath(): string {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    const require = createRequire(import.meta.url);
    const p = require("ffmpeg-static") as string | null;
    if (p && existsSync(p)) return p;
  } catch {
    // ignorieren – Fallback auf System-ffmpeg
  }
  return "ffmpeg";
}

function run(args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath(), args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
      if (stderr.length > 200_000) stderr = stderr.slice(-100_000);
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stderr }));
  });
}

export function parseDuration(stderr: string): number {
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
  if (!m) return 0;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

/**
 * Wandelt Audio in Mono, 16 kHz, 48 kbit/s MP3 um und teilt es in Abschnitte.
 * Liefert die Abschnitte als Buffer und die Gesamtdauer in Sekunden.
 */
export async function splitAudio(input: Buffer, fileName: string): Promise<{ chunks: Buffer[]; durationSec: number }> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "freebie-audio-"));
  try {
    const ext = path.extname(fileName).replace(/[^.a-z0-9]/gi, "") || ".bin";
    const inFile = path.join(dir, `input${ext}`);
    await writeFile(inFile, input);
    const { code, stderr } = await run([
      "-hide_banner",
      "-nostdin",
      "-y",
      "-i", inFile,
      "-vn",
      "-ac", "1",
      "-ar", "16000",
      "-c:a", "libmp3lame",
      "-b:a", "48k",
      "-f", "segment",
      "-segment_time", String(SEGMENT_SECONDS),
      "-reset_timestamps", "1",
      path.join(dir, "teil-%03d.mp3"),
    ]);
    if (code !== 0) {
      console.warn("ffmpeg:", stderr.slice(-500));
      // Videos ohne Tonspur: ffmpeg findet nach „-vn“ keinen Datenstrom mehr.
      if (/does not contain any stream|matches no streams/i.test(stderr)) throw new HttpError(422, "Die Audiodatei enthält keine Tonspur.");
      throw new HttpError(422, "Die Audiodatei konnte nicht gelesen werden. Ist sie beschädigt?");
    }
    const names = (await readdir(dir)).filter((n) => n.startsWith("teil-")).sort();
    const chunks = await Promise.all(names.map((n) => readFile(path.join(dir, n))));
    if (chunks.length === 0) throw new HttpError(422, "Die Audiodatei enthält keine Tonspur.");
    return { chunks, durationSec: parseDuration(stderr) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
