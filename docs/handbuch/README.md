# Handbuch

[`docs/Freebie-Handbuch.pdf`](../Freebie-Handbuch.pdf) beschreibt alle Funktionen von Freebie für Kolleginnen und
Kollegen: den Chat (für Gäste und Kursleitung) und den Admin-Bereich. Die Screenshots entstehen automatisch aus der
aktuellen Version.

## Neu erzeugen

```bash
npm run build           # Produktions-Build (das Skript startet ihn im Testmodus)
npm run docs:handbuch   # etwa 2 Minuten, schreibt docs/Freebie-Handbuch.pdf
```

Das Skript startet Freebie im Testmodus (`FREEBIE_MOCK=1`) mit frischer Datenbank auf Port 3400. Danach:

1. Es legt Beispieltermine an und lädt Beispiel-Chats über die Import-Funktion.
2. Es nimmt alle Screenshots mit Playwright auf.
3. Es rendert das Handbuch mit Chromium. Für die Seitenzahlen im Inhaltsverzeichnis rendert es mehrfach, bis sie sich
   nicht mehr ändern.

Schlägt ein Screenshot fehl, bricht es ab, statt ein unvollständiges PDF zu schreiben. Zwischenstände (Screenshots,
Schriften, Beispieldateien) liegen in `.data/handbuch/`.

## Dateien

| Datei | Inhalt |
|---|---|
| `handbuch.html` | Der Text des Handbuchs mit Deckblatt; Bilder als `shots/<name>.jpg` |
| `style.css` | Gestaltung für den Druck (A4, Fußzeile mit Seitenzahlen, Farben und Schriften der App) |
| `inhalt.js` | Baut das Inhaltsverzeichnis und trägt den Stand (Monat, Jahr) auf dem Deckblatt ein |
| `screenshots.mjs` | Legt die Beispieldaten an und nimmt die Screenshots auf (`c…` = Chat, `a…` = Admin) |
| `beispieldaten.mjs` | Beispiel-Chats sowie Beispielzahlen für Übersicht und Termine |
| `erstellen.mjs` | Ablauf: Server starten, Screenshots, Schriften übernehmen, PDF rendern |

**Text ändern:** `handbuch.html` bearbeiten. Kapitel sind `<h2 id="…">` mit Nummer, Teile `<section class="part">`.
Das Inhaltsverzeichnis entsteht daraus von selbst.

**Neuer Screenshot:** In `screenshots.mjs` einen `step(…)` mit `shot(…)` ergänzen und das Bild in `handbuch.html` als
`<figure>` einbinden.

## Hinweise

- Alle Inhalte sind Beispieldaten; das Handbuch sagt das auch.
- Im Testmodus entstehen keine Kosten. Für Übersicht und Termine setzt das Skript im Browser deshalb
  Beispielzahlen und den Systemstatus einer Live-Installation ein. Die Druckkärtchen zeigen „freebie.stefanai.de“.
- Der Bild-Modus liefert im Testmodus ein Platzhalterbild. Die Bildunterschrift im Handbuch sagt das.
