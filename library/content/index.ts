// Alle Inhalte des Fundus. Neue Verwaltungen: Datei anlegen und hier eintragen.
import type { DocSpec, ThreadSpec } from "../types";
import * as altmoorland from "./altmoorland";
import * as bmvb from "./bmvb";
import * as brackenhain from "./brackenhain";
import * as bzbl from "./bzbl";
import * as falkenbrueck from "./falkenbrueck";
import * as lpf from "./lpf";
import * as mkv from "./mkv";
import * as zkit from "./zkit";

const SOURCES = [falkenbrueck, altmoorland, brackenhain, zkit, mkv, lpf, bmvb, bzbl];

export const DOCUMENTS: DocSpec[] = SOURCES.flatMap((s) => s.documents);
export const THREADS: ThreadSpec[] = SOURCES.flatMap((s) => s.threads);
