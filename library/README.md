# Fundus – Regeln für Inhalte

Der Fundus enthält erfundene Dateien und E-Mails aus Verwaltungen, mit denen Teilnehmende üben können, ohne echte
Unterlagen hochzuladen. Alles wirkt echt, ist aber nachweislich erfunden. Plan und Entscheidungen: [FUNDUS-PLAN.md](../FUNDUS-PLAN.md).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `world.ts` | Verwaltungen, Organisationseinheiten und Personen (das gemeinsame Weltmodell) |
| `content/<verwaltung>.ts` | Dokumente (Word, Excel, PowerPoint) und E-Mail-Verläufe als Daten |
| `build/` | Generator: Word (`docx`), Excel (`exceljs`), PowerPoint (`pptxgenjs`), E-Mail (eigener MIME-Schreiber), Signets, Formel-Rechner |

`npm run library` erzeugt daraus `.library/` (Dateien, `manifest.json`, Vorschau-Daten). Das passiert automatisch vor
`npm run dev`, `npm run build` (also auch auf Vercel) und vor den Unit-Tests. Unveränderte Quellen werden nicht neu
erzeugt. Jeder Build ergibt byte-gleiche Dateien, damit Datei- und Antwort-Cache über Deploys hinweg greifen.

## Regeln (werden in `tests/unit/library.test.ts` geprüft)

- **Erfunden:** Orte, Behörden, Personen und Firmen sind erfunden. Neue Namen vorher per Websuche und gegen das
  Gemeindeverzeichnis von Destatis prüfen. Echte Gesetze dürfen vorkommen, echte Behörden, Orte und Personen nicht
  (Sperrliste im Test).
- **Adressen:** Mail- und Webadressen enden auf `.example` (RFC 2606) – Antworten aus Outlook können nie ankommen.
- **Telefon:** nur aus den Spielfilm-Bereichen der Bundesnetzagentur (`030 23125`, `069 90009`, `040 66969`), immer mit
  dreistelliger Durchwahl.
- **Postleitzahlen:** beginnen mit `00` (gibt es in Deutschland nicht).
- **Kennzeichnung:** Dateieigenschaften und Fußzeile „Fiktives Übungsdokument – Freebie-Fundus“; Mails tragen den Kopf
  `X-Freebie-Fundus` und einen Hinweis am Ende.
- **Pflichtbegriffe:** Jeder Eintrag nennt `keywords`, die wörtlich im ausgelesenen Text stehen müssen.

## Neue Inhalte anlegen

1. Personen und Einheiten bei Bedarf in `world.ts` ergänzen.
2. Dokument oder Verlauf in der passenden Datei unter `content/` anlegen (Typen in `types.ts`). Merkmale (`tags`)
   setzen, wenn ein Inhalt bewusst Widersprüche, fiktive Personendaten oder unstrukturierte Notizen enthält; die Länge
   (kurz/mittel/lang) ergibt sich aus der Token-Schätzung.
3. Excel-Formeln schreiben wie in Excel (englische Funktionsnamen). `{r}` steht für die eigene Zeile, `{first}` und
   `{last}` für die erste und letzte Datenzeile. Der Generator rechnet die Ergebnisse mit, unterstützt werden
   `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `COUNTA`, `ROUND`, `ABS`, `IF`.
4. `npm run library` und `npm run test` – der Test meldet fehlende Pflichtbegriffe, unbekannte Personen oder
   Verstöße gegen die Regeln.
