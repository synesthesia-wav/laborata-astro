#!/usr/bin/env node
import { createHash } from "node:crypto";
// Sync scrape-autoresearch truth → packages/data/data/ with SHA256 manifest
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src =
  process.env.SCRAPE_SRC ??
  "/Users/victorvanica/coding-projects/scrape-autoresearch/data";
const dest = join(root, "packages/data/data");

function sha(p) {
  return createHash("sha256").update(readFileSync(p)).digest("hex");
}

function ensureDir(p) {
  if (!existsSync(p)) {
    mkdirSync(p, { recursive: true });
  }
}

const files = [
  "canonical-graph.json",
  "vendor-mappings.json",
  "vendor_fees.json",
  "panel-archetypes-final-llm.json",
];

ensureDir(dest);
ensureDir(join(dest, "locations"));

for (const f of files) {
  copyFileSync(join(src, f), join(dest, f));
  console.log(`[sync-data] ${f} ${sha(join(dest, f)).slice(0, 12)}`);
}

for (const f of readdirSync(join(src, "prior_art/locations"))) {
  copyFileSync(join(src, "prior_art/locations", f), join(dest, "locations", f));
  console.log(
    `[sync-data] locations/${f} ${sha(join(dest, "locations", f)).slice(0, 12)}`
  );
}

// manifest
const manifest = {};
for (const f of files) {
  manifest[f] = sha(join(dest, f));
}
for (const f of readdirSync(join(dest, "locations"))) {
  manifest[`locations/${f}`] = sha(join(dest, "locations", f));
}
if (existsSync(join(dest, "search.json"))) {
  manifest["search.json"] = sha(join(dest, "search.json"));
}

writeFileSync(
  join(dest, "manifest.json"),
  JSON.stringify(
    { files: manifest, generated_at: new Date().toISOString() },
    null,
    2
  )
);
console.log(`[sync-data] manifest wrote ${Object.keys(manifest).length} files`);
console.log(
  "[sync-data] next: node scripts/build-search.mjs && node packages/data/data/validate.mjs"
);
