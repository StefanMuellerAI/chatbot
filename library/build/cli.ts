// Aufruf: npm run library [-- --force]
import { buildLibrary } from "./build";

const started = Date.now();
buildLibrary({ force: process.argv.includes("--force"), log: (line) => console.log(line) })
  .then(({ skipped, manifest }) => {
    const { documents, threads } = manifest.catalog;
    const mails = threads.reduce((s, t) => s + t.mails.length, 0);
    console.log(
      skipped
        ? `Fundus ist aktuell (${documents.length} Dokumente, ${threads.length} Verläufe).`
        : `Fundus erzeugt: ${documents.length} Dokumente, ${threads.length} Verläufe mit ${mails} E-Mails in ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    );
  })
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
