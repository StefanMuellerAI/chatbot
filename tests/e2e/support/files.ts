import { fixture } from "./generate-files";

/** Pfad einer generierten Testdatei (siehe generate-files.mjs). */
export const file = (name: string): string => fixture(name);
