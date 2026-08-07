import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../lib/wave7.ts", import.meta.url);
let source = await readFile(path, "utf8");
const marker = "const note = next.fieldNotes.find((row) => row.id === noteId);";
const matches = source.split(marker).length - 1;
if (matches !== 2) throw new Error(`Expected 2 Wave 7 field-note narrowing sites, found ${matches}.`);
source = source.replaceAll(marker, `${marker.slice(0, -1)} as StructuredFieldNote | undefined;`);
await writeFile(path, source, "utf8");
console.log("Wave 7 structured field-note type narrowing applied.");
