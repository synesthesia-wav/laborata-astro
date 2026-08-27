#!/usr/bin/env node
// Patch Astro's cookie import to handle both CJS (0.7.x) and ESM (2.x) interop.
// Astro 7.2.7's `import { parseCookie } from "cookie"` fails when Node resolves
// to the CJS build (cookie@0.7.2 via express) vs ESM (cookie@2.0.1).
// This makes the import interoperable: works with either.
import { existsSync, globSync, readFileSync, writeFileSync } from "node:fs";

const targets = globSync(
  "node_modules/.bun/astro*/node_modules/astro/dist/core/cookies/cookies.js"
);
if (targets.length === 0) {
  // also check non-bun layout
  const alt = "node_modules/astro/dist/core/cookies/cookies.js";
  if (existsSync(alt)) {
    targets.push(alt);
  }
}

let patched = 0;
for (const file of targets) {
  const src = readFileSync(file, "utf8");
  if (src.includes("import * as cookieMod")) {
    continue;
  }
  if (
    !src.includes('import { parseCookie, stringifySetCookie } from "cookie"')
  ) {
    continue;
  }
  const next = src.replace(
    'import { parseCookie, stringifySetCookie } from "cookie";',
    'import * as cookieMod from "cookie"; const parseCookie = cookieMod.parseCookie ?? cookieMod.default?.parseCookie; const stringifySetCookie = cookieMod.stringifySetCookie ?? cookieMod.default?.stringifySetCookie;'
  );
  writeFileSync(file, next);
  patched++;
  console.log(`[patch-astro-cookie] patched ${file}`);
}

if (patched === 0) {
  console.log("[patch-astro-cookie] no patch needed");
}
