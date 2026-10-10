// Erzeugt den Fundus (.library/) vor den Unit-Tests – nur wenn sich die Quellen geändert haben.
import { buildLibrary } from "@/library/build/build";

export default async function setup() {
  await buildLibrary();
}
