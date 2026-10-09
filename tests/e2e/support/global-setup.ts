import { generateFiles } from "./generate-files";

export default async function globalSetup() {
  await generateFiles();
}
