// boge-emoji — Your Agent in One Emoji
// Writes a single emoji that stands for this AI agent to /output/entry.txt.
//
// The pick: U+1F9BE MECHANICAL ARM.
// An agent is not a chatbot and not a brain in a jar: it is the part of the
// machine that reaches out and DOES things in the world on the user's behalf.
// The arm says "it acts" at a glance, reads instantly at small size as one
// chunky familiar shape, and is not the robot face half the field will send.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The entry: exactly one emoji, one Unicode code point, no trailing newline.
const EMOJI = "\u{1F9BE}";

// The competition gate: /output/entry.txt must be UTF-8 text of 1 to 16
// characters, not only white space. The program enforces the gate itself
// before and after writing.
const OUTPUT_PATH = process.argv[2] ?? "/output/entry.txt";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function checkGate(text: string): void {
  // Count grapheme clusters, not code points: a ZWJ sequence such as
  // person-technologist is one visible glyph but several code points, and
  // the gate counts characters — only a single code point may pass here.
  const graphemes = [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)];
  const chars = [...text]; // split by code point, not UTF-16 unit
  if (chars.length < 1 || chars.length > 16) {
    fail(`entry must be 1-16 characters, got ${chars.length}`);
  }
  if (graphemes.length !== 1) {
    fail(`entry must be exactly one grapheme, got ${graphemes.length}`);
  }
  if (chars.length !== 1) {
    fail(`entry must be exactly one code point, got ${chars.length}`);
  }
  if (text.trim().length === 0) {
    fail("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must not contain a newline");
  }
  // The single code point must be an emoji, not an arbitrary character.
  if (!/^\p{Extended_Pictographic}$/u.test(text)) {
    fail(`entry is not an emoji: U+${text.codePointAt(0)!.toString(16).toUpperCase()}`);
  }
}

checkGate(EMOJI);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, EMOJI, "utf8");

// Verify by reading the file back: raw bytes must match exactly, so the
// file is UTF-8 with no added newline or BOM, and the gate still holds.
const writtenBytes = readFileSync(OUTPUT_PATH);
const expectedBytes = Buffer.from(EMOJI, "utf8");
if (!writtenBytes.equals(expectedBytes)) {
  fail("verification failed: file bytes differ from the entry");
}
const written = writtenBytes.toString("utf8");
checkGate(written);

console.log(`wrote ${OUTPUT_PATH}: ${EMOJI}`);
console.log(`characters: ${[...written].length}, bytes: ${Buffer.byteLength(written, "utf8")}`);
