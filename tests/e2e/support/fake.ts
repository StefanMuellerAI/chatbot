import { FAKE_API_PORT } from "./servers.mjs";

export { FAKE_USAGE } from "./servers.mjs";

/** Eine von der Fake-API mitgeschriebene Anfrage. */
export interface Recorded {
  at: number;
  provider: "anthropic" | "openai";
  method: string;
  path: string;
  headers: Record<string, string>;
  // Der Rohinhalt der Anfrage – je nach Endpunkt unterschiedlich aufgebaut.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}

/** Alle Anfragen an die Fake-API, deren Inhalt den Text enthält (optional nur ein Pfad). */
export async function fakeRequests(contains: string, path?: string): Promise<Recorded[]> {
  const res = await fetch(`http://127.0.0.1:${FAKE_API_PORT}/__requests?contains=${encodeURIComponent(contains)}`);
  const all = (await res.json()) as Recorded[];
  return path ? all.filter((r) => r.path.split("?")[0] === path) : all;
}
