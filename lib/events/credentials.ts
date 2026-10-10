// Einfache Zugangsdaten für Gäste: kurze deutsche Wörter ohne Umlaute plus Ziffern ohne 0 und 1
// (keine Verwechslung mit o/l). Benutzername z. B. „fuchs27“, Passwort z. B. „sonne482“.
import { randomInt } from "node:crypto";

/** Tiere und Naturbegriffe für Benutzernamen. */
export const USERNAME_WORDS = [
  "adler", "affe", "ameise", "biber", "biene", "birke", "blume", "dachs", "delfin", "drossel",
  "eiche", "eisvogel", "elch", "ente", "esel", "eule", "falke", "farn", "fasan", "fink",
  "fisch", "flamingo", "fohlen", "forelle", "frosch", "fuchs", "gams", "gans", "gecko", "geier",
  "giraffe", "gorilla", "grille", "habicht", "hai", "hamster", "hase", "hecht", "hering", "hirsch",
  "huhn", "hummel", "hummer", "igel", "iltis", "jaguar", "kamel", "kater", "katze", "kauz",
  "kiwi", "koala", "kobra", "kolibri", "kranich", "krebs", "kuckuck", "lachs", "lama", "lerche",
  "linde", "loewe", "luchs", "marder", "meise", "moewe", "mops", "motte", "muschel", "nashorn",
  "natter", "otter", "panda", "papagei", "pfau", "pferd", "pinguin", "puma", "qualle", "rabe",
  "reh", "rentier", "robbe", "rotkehlchen", "schaf", "schwan", "seehund", "spatz", "specht", "stier",
  "storch", "strauss", "taube", "tiger", "tukan", "uhu", "wal", "wachtel", "waran", "wiesel",
  "wolf", "wombat", "zebra", "ziege", "zander", "kraehe", "dohle", "amsel", "star", "zeisig",
  "ahorn", "buche", "tanne", "fichte", "kiefer", "pappel", "weide", "erle", "esche", "ulme",
  "moos", "klee", "minze", "salbei", "thymian", "lavendel", "tulpe", "rose", "nelke", "lilie",
  "krokus", "veilchen", "efeu", "distel", "mohn", "hopfen", "kastanie", "eichel", "zapfen", "beere",
] as const;

/** Alltagswörter für Passwörter (andere Liste als die Benutzernamen). */
export const PASSWORD_WORDS = [
  "abend", "acker", "anker", "apfel", "arena", "atlas", "auto", "bach", "bahn", "ball",
  "banane", "bank", "bauer", "baum", "berg", "besen", "bett", "bild", "birne", "blatt",
  "blitz", "boden", "boot", "brief", "brille", "brot", "bruecke", "brunnen", "buch", "burg",
  "butter", "dach", "dampf", "decke", "deich", "dorf", "drache", "dose", "duene", "eimer",
  "eis", "erde", "ernte", "fabel", "faden", "fahne", "feder", "fels", "fenster", "ferien",
  "feuer", "film", "flagge", "flasche", "fluss", "flut", "foto", "frage", "freund", "garten",
  "gabel", "geige", "gipfel", "glas", "glocke", "glueck", "gold", "gras", "gurke", "hafen",
  "hafer", "hammer", "hand", "harfe", "haus", "heft", "held", "helm", "herbst", "herz",
  "himmel", "hof", "honig", "hose", "hotel", "huegel", "hut", "insel", "jacke", "jahr",
  "kaffee", "kakao", "kanal", "kante", "kanu", "karte", "kasse", "kegel", "keks", "kerze",
  "kette", "kino", "kirsche", "kiste", "klang", "kleid", "knopf", "koffer", "kompass", "kopf",
  "korb", "krone", "kuchen", "kugel", "kurve", "lampe", "land", "laterne", "laub", "leiter",
  "licht", "lied", "limette", "liste", "loch", "loeffel", "luft", "mantel", "markt", "maske",
  "mauer", "meer", "melone", "messer", "milch", "mond", "morgen", "muehle", "muenze", "musik",
  "nebel", "nest", "netz", "nudel", "oase", "obst", "ofen", "onkel", "orange", "orgel",
  "paket", "palme", "papier", "park", "pfanne", "pfeffer", "pflaume", "pilz", "pinsel", "pirat",
  "planet", "platz", "pokal", "post", "puppe", "quelle", "rad", "radio", "rakete", "rasen",
  "regen", "reise", "rezept", "ring", "ritter", "rock", "rolle", "rubin", "ruder", "saft",
  "sahne", "salz", "sand", "schal", "schatz", "schiff", "schloss", "schnee", "schuh", "seil",
  "sessel", "sofa", "sommer", "sonne", "spiegel", "spiel", "stadt", "stein", "stern", "stift",
  "strand", "strom", "stuhl", "sturm", "suppe", "tafel", "tal", "tanz", "tasche", "tasse",
  "teller", "tempo", "teppich", "theater", "tinte", "tisch", "tomate", "tor", "traum", "treppe",
  "trommel", "tuer", "turm", "ufer", "uhr", "urlaub", "vase", "vogel", "wagen", "wald",
  "wand", "wasser", "weg", "welle", "welt", "wetter", "wiese", "wind", "winter", "wolke",
  "wunder", "wurzel", "zahl", "zange", "zaun", "zelt", "zimmer", "zitrone", "zucker", "zug",
  "anfang", "antwort", "arbeit", "ausflug", "bastel", "becher", "beutel", "biskuit", "bonbon", "brezel",
  "dino", "domino", "fackel", "feld", "flocke", "floete", "funke", "gitarre", "globus", "kerbe",
  "jubel", "kamin", "kekse", "klavier", "kreide", "lasso", "magnet", "marmor", "mosaik", "kurbel",
  "museum", "nadel", "notiz", "oper", "pause", "perle", "pizza", "polster", "pudding", "puzzle",
  "rodel", "roller", "sattel", "schaukel", "segel", "sieb", "skizze", "socke", "spur", "tablett",
] as const;

const DIGITS = "23456789";

function digits(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += DIGITS[randomInt(DIGITS.length)];
  return out;
}

const pick = <T>(list: readonly T[]): T => list[randomInt(list.length)];

/** Nur Kleinbuchstaben a–z und Ziffern 2–9 (Umlaute sind in den Listen ausgeschrieben). */
const ALLOWED = /^[a-z]+[2-9]+$/;

/** Neuer Benutzername, der in `taken` noch nicht vorkommt. */
export function generateUsername(taken: Set<string>): string {
  for (let attempt = 0; attempt < 1000; attempt++) {
    // Nach vielen Kollisionen eine Ziffer mehr – so geht es auch bei sehr vielen Gästen weiter.
    const name = `${pick(USERNAME_WORDS)}${digits(attempt < 200 ? 2 : 3)}`;
    if (!taken.has(name) && ALLOWED.test(name)) return name;
  }
  throw new Error("Kein freier Benutzername gefunden.");
}

export function generatePassword(): string {
  for (;;) {
    const password = `${pick(PASSWORD_WORDS)}${digits(3)}`;
    if (ALLOWED.test(password)) return password;
  }
}

/** Benutzername so, wie er verglichen wird (Groß-/Kleinschreibung und Leerzeichen egal). */
export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}
