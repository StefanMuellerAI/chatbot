// Alle Inhalte des Fundus. Neue Verwaltungen: Datei anlegen und hier eintragen.
import type { DocSpec, ThreadSpec } from "../types";
import * as altmoorland from "./altmoorland";
import * as altmoorlandDez2bis4 from "./altmoorland-dez2-4";
import * as bmvb from "./bmvb";
import * as brackenhain from "./brackenhain";
import * as bzbl from "./bzbl";
import * as falkenbrueck from "./falkenbrueck";
import * as falkenbrueckDez4bis6 from "./falkenbrueck-dez4-6";
import * as lpf from "./lpf";
import * as mkv from "./mkv";
import * as rabensfurt from "./rabensfurt";
import * as zkit from "./zkit";

const SOURCES = [falkenbrueck, falkenbrueckDez4bis6, altmoorland, altmoorlandDez2bis4, rabensfurt, brackenhain, zkit, mkv, lpf, bmvb, bzbl];

export const DOCUMENTS: DocSpec[] = SOURCES.flatMap((s) => s.documents);
export const THREADS: ThreadSpec[] = SOURCES.flatMap((s) => s.threads);
